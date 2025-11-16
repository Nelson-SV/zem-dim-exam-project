using Application.Interfaces.Infrastructure.Postgres;
using Application.Interfaces.Infrastructure.Postgres.Admin.UserManagement;
using Application.Interfaces.Services;
using Application.Models.Dtos.Project;
using Core.Domain.Entities;

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

    #region READ Operations

    public async Task<List<ProjectDto>> GetAllProjectsAsync()
    {
        var projects = await _projectRepository.GetAllAsync();
        return ProjectDto.FromEntityToList(projects);
    }

    public async Task<List<ProjectDto>> GetUserProjectsAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new KeyNotFoundException("User not found");

        List<Project> projects;

        if (user.Role?.Equals("Admin", StringComparison.OrdinalIgnoreCase) == true)
        {
            projects = await _projectRepository.GetAllAsync();
        }
        else
        {
            projects = await _projectRepository.GetByClientIdAsync(userId);
        }

        return ProjectDto.FromEntityToList(projects);
    }

    public async Task<ProjectDto?> GetProjectByIdAsync(Guid projectId)
    {
        var project = await _projectRepository.GetByIdAsync(projectId);
        if (project == null)
            return null;

        return ProjectDto.FromEntity(project);
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

    #endregion

    #region CREATE Operations

    public async Task<ProjectDto> CreateProjectAsync(CreateProjectDto dto)
    {
        // Verify client exists
        var client = await _userRepository.GetByIdAsync(dto.ClientId);
        if (client == null)
            throw new KeyNotFoundException("Client not found");

        // Create project entity
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Clientid = dto.ClientId,
            Title = dto.Title,
            Description = dto.Description,
            Address = dto.Address,
            City = dto.City,
            Postalcode = dto.PostalCode,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            Status = dto.Status,
            Startdate = dto.StartDate,
            Plannedenddate = dto.PlannedEndDate,
            Totalarea = dto.TotalArea,
            Budget = dto.Budget,
            Progresspercentage = dto.ProgressPercentage,
            Thumbnailurl = dto.ThumbnailUrl,
            Createdat = DateTime.UtcNow,
            Updatedat = DateTime.UtcNow,
            Isdeleted = false
        };

        var createdProject = await _projectRepository.AddAsync(project);
        return ProjectDto.FromEntity(createdProject);
    }

    #endregion

    #region UPDATE Operations

    public async Task<ProjectDto> UpdateProjectAsync(Guid projectId, UpdateProjectDto dto)
    {
        var project = await _projectRepository.GetByIdAsync(projectId);
        if (project == null)
            throw new KeyNotFoundException("Project not found");

        // Update all fields
        project.Title = dto.Title;
        project.Description = dto.Description;
        project.Address = dto.Address;
        project.City = dto.City;
        project.Postalcode = dto.PostalCode;
        project.Latitude = dto.Latitude;
        project.Longitude = dto.Longitude;
        project.Status = dto.Status;
        project.Startdate = dto.StartDate;
        project.Plannedenddate = dto.PlannedEndDate;
        project.Actualenddate = dto.ActualEndDate;
        project.Totalarea = dto.TotalArea;
        project.Budget = dto.Budget;
        project.Progresspercentage = dto.ProgressPercentage;
        project.Thumbnailurl = dto.ThumbnailUrl;
        project.Updatedat = DateTime.UtcNow;

        var updatedProject = await _projectRepository.UpdateAsync(project);
        return ProjectDto.FromEntity(updatedProject);
    }

    public async Task<ProjectDto> PatchProjectAsync(Guid projectId, PatchProjectDto dto)
    {
        var project = await _projectRepository.GetByIdAsync(projectId);
        if (project == null)
            throw new KeyNotFoundException("Project not found");

        // Update only provided fields
        if (dto.Title != null)
            project.Title = dto.Title;

        if (dto.Description != null)
            project.Description = dto.Description;

        if (dto.Address != null)
            project.Address = dto.Address;

        if (dto.City != null)
            project.City = dto.City;

        if (dto.PostalCode != null)
            project.Postalcode = dto.PostalCode;

        if (dto.Latitude.HasValue)
            project.Latitude = dto.Latitude;

        if (dto.Longitude.HasValue)
            project.Longitude = dto.Longitude;

        if (dto.Status != null)
            project.Status = dto.Status;

        if (dto.StartDate.HasValue)
            project.Startdate = dto.StartDate.Value;

        if (dto.PlannedEndDate.HasValue)
            project.Plannedenddate = dto.PlannedEndDate;

        if (dto.ActualEndDate.HasValue)
            project.Actualenddate = dto.ActualEndDate;

        if (dto.TotalArea.HasValue)
            project.Totalarea = dto.TotalArea;

        if (dto.Budget.HasValue)
            project.Budget = dto.Budget;

        if (dto.ProgressPercentage.HasValue)
            project.Progresspercentage = dto.ProgressPercentage.Value;

        if (dto.ThumbnailUrl != null)
            project.Thumbnailurl = dto.ThumbnailUrl;

        project.Updatedat = DateTime.UtcNow;

        var updatedProject = await _projectRepository.UpdateAsync(project);
        return ProjectDto.FromEntity(updatedProject);
    }

    public async Task<ProjectDto> UpdateProjectStatusAsync(Guid projectId, string status)
    {
        var project = await _projectRepository.GetByIdAsync(projectId);
        if (project == null)
            throw new KeyNotFoundException("Project not found");

        project.Status = status;
        project.Updatedat = DateTime.UtcNow;

        // Auto-set actual end date if status is "Completed"
        if (status.Equals("Completed", StringComparison.OrdinalIgnoreCase) && !project.Actualenddate.HasValue)
        {
            project.Actualenddate = DateOnly.FromDateTime(DateTime.UtcNow);
        }

        var updatedProject = await _projectRepository.UpdateAsync(project);
        return ProjectDto.FromEntity(updatedProject);
    }

    public async Task<ProjectDto> UpdateProjectProgressAsync(Guid projectId, int progressPercentage)
    {
        if (progressPercentage < 0 || progressPercentage > 100)
            throw new ArgumentException("Progress percentage must be between 0 and 100");

        var project = await _projectRepository.GetByIdAsync(projectId);
        if (project == null)
            throw new KeyNotFoundException("Project not found");

        project.Progresspercentage = progressPercentage;
        project.Updatedat = DateTime.UtcNow;

        // Auto-update status based on progress
        if (progressPercentage == 0 && project.Status == "Planning")
        {
            // Keep as Planning
        }
        else if (progressPercentage > 0 && progressPercentage < 100)
        {
            project.Status = "InProgress";
        }
        else if (progressPercentage == 100)
        {
            project.Status = "Completed";
            if (!project.Actualenddate.HasValue)
            {
                project.Actualenddate = DateOnly.FromDateTime(DateTime.UtcNow);
            }
        }

        var updatedProject = await _projectRepository.UpdateAsync(project);
        return ProjectDto.FromEntity(updatedProject);
    }

    #endregion

    #region DELETE Operations

    public async Task<bool> SoftDeleteProjectAsync(Guid projectId)
    {
        return await _projectRepository.SoftDeleteAsync(projectId);
    }

    public async Task<bool> RestoreProjectAsync(Guid projectId)
    {
        return await _projectRepository.RestoreAsync(projectId);
    }

    public async Task<bool> PermanentDeleteProjectAsync(Guid projectId)
    {
        return await _projectRepository.PermanentDeleteAsync(projectId);
    }

    #endregion
}