using Application.Interfaces.Infrastructure.Postgres;
using Application.Interfaces.Infrastructure.Postgres.Admin.UserManagement;
using Application.Interfaces.Services;
using Application.Models.Dtos.Project;

namespace Application.Services.ProjectService;

public class ProjectService : IProjectService
{
    private readonly IProjectRepository _projectRepository;
    private readonly IUserManagementRepository _userRepository;
    private static readonly Guid ADMIN_ID = Guid.Parse("11111111-1111-1111-1111-111111111111");

    public ProjectService(IProjectRepository projectRepository, IUserManagementRepository userRepository)
    {
        _projectRepository = projectRepository;
        _userRepository = userRepository;
    }

    public async Task<List<ProjectDto>> GetUserProjectsAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new KeyNotFoundException("User not found");

        List<Core.Domain.Entities.Project> projects;

        if (user.Role == "Admin")
        {
            // Admin бачить всі проєкти
            projects = await _projectRepository.GetAllAsync();
        }
        else
        {
            // Client бачить тільки свої проєкти
            projects = await _projectRepository.GetByClientIdAsync(userId);
        }

        return projects.Select(p => new ProjectDto
        {
            Id = p.Id,
            ClientId = p.Clientid,
            ClientName = p.Client != null 
                ? $"{p.Client.Firstname} {p.Client.Lastname}" 
                : "Unknown Client",
            Title = p.Title,
            Description = p.Description,
            Address = p.Address,
            City = p.City,
            PostalCode = p.Postalcode,
            Status = p.Status,
            StartDate = p.Startdate,
            PlannedEndDate = p.Plannedenddate,
            ActualEndDate = p.Actualenddate,
            TotalArea = p.Totalarea,
            Budget = p.Budget,
            ProgressPercentage = p.Progresspercentage ?? 0,
            ThumbnailUrl = p.Thumbnailurl,
            CreatedAt = p.Createdat,
            UpdatedAt = p.Updatedat
        }).ToList();
    }

    public async Task<ProjectDto?> GetProjectByIdAsync(Guid projectId)
    {
        var project = await _projectRepository.GetByIdAsync(projectId);
        if (project == null)
            return null;

        return new ProjectDto
        {
            Id = project.Id,
            ClientId = project.Clientid,
            ClientName = project.Client != null 
                ? $"{project.Client.Firstname} {project.Client.Lastname}" 
                : "Unknown Client",
            Title = project.Title,
            Description = project.Description,
            Address = project.Address,
            City = project.City,
            PostalCode = project.Postalcode,
            Status = project.Status,
            StartDate = project.Startdate,
            PlannedEndDate = project.Plannedenddate,
            ActualEndDate = project.Actualenddate,
            TotalArea = project.Totalarea,
            Budget = project.Budget,
            ProgressPercentage = project.Progresspercentage ?? 0,
            ThumbnailUrl = project.Thumbnailurl,
            CreatedAt = project.Createdat,
            UpdatedAt = project.Updatedat
        };
    }

    public async Task<ProjectParticipantsDto> GetProjectParticipantsAsync(Guid projectId)
    {
        var project = await _projectRepository.GetByIdAsync(projectId);
        if (project == null)
            throw new KeyNotFoundException("Project not found");

        return new ProjectParticipantsDto
        {
            ProjectId = project.Id,
            ClientId = project.Clientid,
            AdminId = ADMIN_ID
        };
    }
}