using Application.Interfaces.Infrastructure.Postgres;
using Application.Interfaces.Infrastructure.Postgres.Admin.UserManagement;
using Application.Interfaces.Services;
using Application.Models.Dtos.Dashboard;
using Application.Models.Dtos.Update;
using Core.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace Application.Services.ClientDashboardService;

public class ClientDashboardService : IClientDashboardService
{
    private const int DefaultUpdatesLimit = 5;
    private const int MaxUpdatesLimit = 50;

    private readonly IUserManagementRepository _userRepository;
    private readonly IProjectRepository _projectRepository;
    private readonly IMilestoneRepository _milestoneRepository;
    private readonly IUpdateRepository _updateRepository;
    private readonly ILogger<ClientDashboardService> _logger;

    public ClientDashboardService(
        IUserManagementRepository userRepository,
        IProjectRepository projectRepository,
        IMilestoneRepository milestoneRepository,
        IUpdateRepository updateRepository,
        ILogger<ClientDashboardService> logger)
    {
        _userRepository = userRepository;
        _projectRepository = projectRepository;
        _milestoneRepository = milestoneRepository;
        _updateRepository = updateRepository;
        _logger = logger;
    }

    public async Task<ClientDashboardResponseDto> GetDashboardAsync(
        Guid requesterId,
        string requesterRole,
        Guid? projectId,
        int latestUpdatesLimit = DefaultUpdatesLimit,
        CancellationToken ct = default)
    {
        latestUpdatesLimit = NormalizeUpdatesLimit(latestUpdatesLimit);

        var requester = await _userRepository.GetByIdAsync(requesterId)
                         ?? throw new UnauthorizedAccessException("User not found or inactive");

        if (requester.Isactive != true || requester.Isdeleted == true)
            throw new UnauthorizedAccessException("User is not active");

        var isAdmin = requesterRole.Equals("Admin", StringComparison.OrdinalIgnoreCase)
                      || requester.Role?.Equals("Admin", StringComparison.OrdinalIgnoreCase) == true;

        var projects = await LoadProjectsAsync(requesterId, isAdmin, projectId, ct);

        var projectDtos = new List<ClientDashboardProjectDto>(projects.Count);
        foreach (var project in projects)
        {
            var stages = await _milestoneRepository.GetAllByProjectAsync(project.Id, ct);
            var stageDtos = stages
                .Select(MapStage)
                .OrderBy(s => s.OrderIndex)
                .ToList();

            var currentStage = stageDtos
                                   .FirstOrDefault(s => !s.Status.Equals("Completed", StringComparison.OrdinalIgnoreCase))
                                   ?.Title
                               ?? stageDtos.LastOrDefault()?.Title;

            var (updates, _) = await _updateRepository.GetUpdatesAsync(
                page: 1,
                pageSize: latestUpdatesLimit,
                projectId: project.Id,
                updateType: null,
                search: null,
                ct);

            projectDtos.Add(new ClientDashboardProjectDto
            {
                Id = project.Id,
                Title = project.Title,
                Address = project.Address,
                City = project.City,
                PostalCode = project.Postalcode,
                Status = project.Status,
                ProgressPercentage = project.Progresspercentage,
                TotalArea = project.Totalarea,
                StartDate = project.Startdate,
                PlannedEndDate = project.Plannedenddate,
                ActualEndDate = project.Actualenddate,
                ThumbnailUrl = project.Thumbnailurl,
                CurrentStageTitle = currentStage,
                Stages = stageDtos,
                LatestUpdates = UpdateDto.FromEntities(updates)
            });
        }

        _logger.LogInformation("Built dashboard for user {UserId} with {ProjectCount} project(s)", requesterId, projectDtos.Count);

        return new ClientDashboardResponseDto
        {
            ClientId = requesterId,
            ClientName = $"{requester.Firstname} {requester.Lastname}".Trim(),
            Projects = projectDtos
        };
    }

    private async Task<List<Project>> LoadProjectsAsync(Guid requesterId, bool isAdmin, Guid? projectId, CancellationToken ct)
    {
        if (projectId.HasValue)
        {
            var project = await _projectRepository.GetByIdAsync(projectId.Value)
                         ?? throw new KeyNotFoundException("Project not found");

            if (!isAdmin && project.Clientid != requesterId)
                throw new UnauthorizedAccessException("You are not allowed to access this project");

            return new List<Project> { project };
        }

        return isAdmin
            ? await _projectRepository.GetAllAsync()
            : await _projectRepository.GetByClientIdAsync(requesterId);
    }

    private static ClientDashboardStageDto MapStage(Milestone milestone) =>
        new()
        {
            Id = milestone.Id,
            Title = milestone.Title,
            Status = milestone.Status,
            ProgressPercentage = milestone.Progresspercentage,
            OrderIndex = milestone.Orderindex,
            Notes = milestone.Notes,
            PlannedStartDate = milestone.Plannedstartdate,
            PlannedEndDate = milestone.Plannedenddate,
            ActualStartDate = milestone.Actualstartdate,
            ActualEndDate = milestone.Actualenddate
        };

    private static int NormalizeUpdatesLimit(int limit)
    {
        if (limit < 1) return DefaultUpdatesLimit;
        if (limit > MaxUpdatesLimit) return MaxUpdatesLimit;
        return limit;
    }
}
