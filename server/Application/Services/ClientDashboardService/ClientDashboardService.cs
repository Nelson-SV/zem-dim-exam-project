using Application.Interfaces.Infrastructure.Postgres;
using Application.Interfaces.Infrastructure.Postgres.Admin.UserManagement;
using Application.Interfaces.Services;
using Application.Models.Dtos.Dashboard;
using Application.Models.Dtos.Update;
using Core.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace Application.Services.ClientDashboardService;

public class ClientDashboardService(
    IUserManagementRepository userRepository,
    IProjectRepository projectRepository,
    IMilestoneRepository milestoneRepository,
    IUpdateRepository updateRepository) : IClientDashboardService
{
    private const int DefaultUpdatesLimit = 5;
    private const int MaxUpdatesLimit = 50;

    public async Task<ClientDashboardResponseDto> GetDashboardAsync(
        Guid requesterId,
        Guid? projectId,
        int latestUpdatesLimit = DefaultUpdatesLimit)
    {
        latestUpdatesLimit = NormalizeUpdatesLimit(latestUpdatesLimit);

        var requester = await userRepository.GetByIdAsync(requesterId)
                         ?? throw new UnauthorizedAccessException("User not found or inactive");

        var projects = await LoadProjectsAsync(requesterId, projectId);

        var projectDtos = new List<ClientDashboardProjectDto>(projects.Count);
        foreach (var project in projects)
        {
            var stages = await milestoneRepository.GetMilestonesByProjectAsync(project.Id);
            var stageDtos = stages
                .Select(ClientDashboardStageDto.FromEntity)
                .OrderBy(s => s.OrderIndex)
                .ToList();

            var currentStage = stageDtos
                                   .FirstOrDefault(s => !s.Status.Equals("Completed", StringComparison.OrdinalIgnoreCase))
                                   ?.Title
                               ?? stageDtos.LastOrDefault()?.Title;

            var (updates, _) = await updateRepository.GetUpdatesAsync(
                page: 1,
                pageSize: latestUpdatesLimit,
                projectId: project.Id,
                updateType: null,
                search: null);

            projectDtos.Add(new ClientDashboardProjectDto
            {
                Id = project.Id,
                Title = project.Title,
                Notes =  project.Notes ?? string.Empty,
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

        return new ClientDashboardResponseDto
        {
            ClientId = requesterId,
            ClientName = $"{requester.Firstname} {requester.Lastname}".Trim(),
            Projects = projectDtos
        };
    }

    private async Task<List<Project>> LoadProjectsAsync(Guid requesterId, Guid? projectId)
    {
        if (projectId.HasValue)
        {
            var project = await projectRepository.GetByIdAsync(projectId.Value)
                         ?? throw new KeyNotFoundException("Project not found");

            return new List<Project> { project };
        }

        return await projectRepository.GetByClientIdAsync(requesterId);
    }

    private static int NormalizeUpdatesLimit(int limit)
    {
        if (limit < 1) return DefaultUpdatesLimit;
        if (limit > MaxUpdatesLimit) return MaxUpdatesLimit;
        return limit;
    }
}
