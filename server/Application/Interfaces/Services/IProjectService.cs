using Application.Models.Dtos.Common;
using Application.Models.Dtos.Project;

namespace Application.Interfaces.Services;

public interface IProjectService
{
    #region READ Operations

    /// <summary>
    /// Get all projects (for Admin)
    /// </summary>
    Task<List<ProjectDto>> GetAllProjectsAsync();

    /// <summary>
    /// Get paged projects with optional search and status filters (Admin)
    /// </summary>
    Task<PaginationItemsResponse<ProjectDto>> GetPagedAsync(string? search, string? status, int page, int pageSize);

    /// <summary>
    /// Get projects for specific user
    /// </summary>
    Task<List<ProjectDto>> GetUserProjectsAsync(Guid userId);

    /// <summary>
    /// Get single project by ID
    /// </summary>
    Task<ProjectDto?> GetProjectByIdAsync(Guid projectId);

    /// <summary>
    /// Get project participants (client and admin)
    /// </summary>
    Task<ProjectParticipantsDto> GetProjectParticipantsAsync(Guid projectId);

    #endregion

    #region CREATE Operations

    /// <summary>
    /// Create new project
    /// </summary>
    Task<ProjectDto> CreateProjectAsync(CreateProjectDto dto);

    #endregion

    #region UPDATE Operations

    /// <summary>
    /// Full update of project
    /// </summary>
    Task<ProjectDto> UpdateProjectAsync(Guid projectId, UpdateProjectDto dto);

    /// <summary>
    /// Partial update of project
    /// </summary>
    Task<ProjectDto> PatchProjectAsync(Guid projectId, PatchProjectDto dto);

    /// <summary>
    /// Update only project status
    /// </summary>
    Task<ProjectDto> UpdateProjectStatusAsync(Guid projectId, string status);

    /// <summary>
    /// Update only project progress percentage
    /// </summary>
    Task<ProjectDto> UpdateProjectProgressAsync(Guid projectId, int progressPercentage);

    #endregion

    #region DELETE Operations

    /// <summary>
    /// Soft delete project (marks as deleted, keeps in DB)
    /// </summary>
    Task<bool> SoftDeleteProjectAsync(Guid projectId);

    /// <summary>
    /// Restore soft-deleted project
    /// </summary>
    Task<bool> RestoreProjectAsync(Guid projectId);

    /// <summary>
    /// Permanent delete project (removes from DB completely)
    /// ⚠️ Use with caution!
    /// </summary>
    Task<bool> PermanentDeleteProjectAsync(Guid projectId);

    #endregion
}
