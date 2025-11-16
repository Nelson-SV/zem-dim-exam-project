using Core.Domain.Entities;

namespace Application.Interfaces.Infrastructure.Postgres;

public interface IProjectRepository
{
    #region READ Operations

    /// <summary>
    /// Get all projects
    /// </summary>
    Task<List<Project>> GetAllAsync();

    /// <summary>
    /// Get all projects including soft-deleted ones
    /// </summary>
    Task<List<Project>> GetAllIncludingDeletedAsync();

    /// <summary>
    /// Get projects for specific client
    /// </summary>
    Task<List<Project>> GetByClientIdAsync(Guid clientId);

    /// <summary>
    /// Get single project by ID
    /// </summary>
    Task<Project?> GetByIdAsync(Guid projectId);

    /// <summary>
    /// Get single project by ID including soft-deleted ones
    /// </summary>
    Task<Project?> GetByIdIncludingDeletedAsync(Guid projectId);

    #endregion

    #region CREATE Operations

    /// <summary>
    /// Add new project to database
    /// </summary>
    Task<Project> AddAsync(Project project);

    #endregion

    #region UPDATE Operations

    /// <summary>
    /// Update existing project
    /// </summary>
    Task<Project> UpdateAsync(Project project);

    #endregion

    #region DELETE Operations

    /// <summary>
    /// Soft delete project (marks as deleted)
    /// </summary>
    Task<bool> SoftDeleteAsync(Guid projectId);

    /// <summary>
    /// Restore soft-deleted project
    /// </summary>
    Task<bool> RestoreAsync(Guid projectId);

    /// <summary>
    /// Permanently delete project from database
    /// </summary>
    Task<bool> PermanentDeleteAsync(Guid projectId);

    #endregion
}