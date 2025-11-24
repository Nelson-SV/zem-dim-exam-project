using Application.Interfaces.Infrastructure.Postgres;
using Core.Domain.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Postgres.Repositories;

public class ProjectRepository : IProjectRepository
{
    private readonly AppDbContext _context;

    public ProjectRepository(AppDbContext context)
    {
        _context = context;
    }

    #region READ Operations

    /// <summary>
    /// Get all active (non-deleted) projects
    /// </summary>
    public async Task<List<Project>> GetAllAsync()
    {
        return await _context.Projects
            .Include(p => p.Client)
            .Where(p => p.Isdeleted == false || p.Isdeleted == null)
            .OrderByDescending(p => p.Createdat)
            .ToListAsync();
    }

    public async Task<(IReadOnlyCollection<Project> Items, int Total)> GetPagedAsync(string? search, string? status, int page, int pageSize, CancellationToken ct = default)
    {
        var query = _context.Projects
            .Include(p => p.Client)
            .Where(p => p.Isdeleted == false);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(p =>
                p.Title.ToLower().Contains(term) ||
                (p.Address != null && p.Address.ToLower().Contains(term)) ||
                (p.City != null && p.City.ToLower().Contains(term)) ||
                (p.Client != null && (
                    (p.Client.Firstname + " " + p.Client.Lastname).ToLower().Contains(term) ||
                    (p.Client.Email ?? string.Empty).ToLower().Contains(term))));
        }

        if (!string.IsNullOrWhiteSpace(status) && !status.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(p => p.Status.ToLower() == status.ToLower());
        }

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(p => p.Createdat)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, total);
    }

    /// <summary>
    /// Get all projects including soft-deleted ones
    /// </summary>
    public async Task<List<Project>> GetAllIncludingDeletedAsync()
    {
        return await _context.Projects
            .Include(p => p.Client)
            .OrderByDescending(p => p.Createdat)
            .ToListAsync();
    }

    /// <summary>
    /// Get projects for specific client (excluding deleted)
    /// </summary>
    public async Task<List<Project>> GetByClientIdAsync(Guid clientId)
    {
        return await _context.Projects
            .Include(p => p.Client)
            .Where(p => p.Clientid == clientId && (p.Isdeleted == false || p.Isdeleted == null))
            .OrderByDescending(p => p.Createdat)
            .ToListAsync();
    }

    /// <summary>
    /// Get single project by ID (excluding deleted)
    /// </summary>
    public async Task<Project?> GetByIdAsync(Guid projectId)
    {
        return await _context.Projects
            .Include(p => p.Client)
            .FirstOrDefaultAsync(p => p.Id == projectId && (p.Isdeleted == false || p.Isdeleted == null));
    }

    /// <summary>
    /// Get single project by ID including soft-deleted
    /// </summary>
    public async Task<Project?> GetByIdIncludingDeletedAsync(Guid projectId)
    {
        return await _context.Projects
            .Include(p => p.Client)
            .FirstOrDefaultAsync(p => p.Id == projectId);
    }

    #endregion

    #region CREATE Operations

    /// <summary>
    /// Add new project to database
    /// </summary>
    public async Task<Project> AddAsync(Project project)
    {
        _context.Projects.Add(project);
        await _context.SaveChangesAsync();
        
        // Reload with navigation properties
        return await GetByIdAsync(project.Id) ?? project;
    }

    #endregion

    #region UPDATE Operations

    /// <summary>
    /// Update existing project
    /// </summary>
    public async Task<Project> UpdateAsync(Project project)
    {
        var existing = await _context.Projects
            .Include(p => p.Client)
            .FirstOrDefaultAsync(p => p.Id == project.Id);

        if (existing == null)
            throw new KeyNotFoundException("Project not found");

        // Update all properties
        _context.Entry(existing).CurrentValues.SetValues(project);
        
        await _context.SaveChangesAsync();
        
        return existing;
    }

    #endregion

    #region DELETE Operations

    /// <summary>
    /// Soft delete project (marks as deleted)
    /// </summary>
    public async Task<bool> SoftDeleteAsync(Guid projectId)
    {
        var project = await _context.Projects.FindAsync(projectId);
        if (project == null)
            return false;

        project.Isdeleted = true;
        project.Updatedat = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Restore soft-deleted project
    /// </summary>
    public async Task<bool> RestoreAsync(Guid projectId)
    {
        var project = await _context.Projects.FindAsync(projectId);
        if (project == null)
            return false;

        project.Isdeleted = false;
        project.Updatedat = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Permanently delete project from database
    /// ⚠️ WARNING: This completely removes the project
    /// </summary>
    public async Task<bool> PermanentDeleteAsync(Guid projectId)
    {
        var project = await _context.Projects.FindAsync(projectId);
        if (project == null)
            return false;

        _context.Projects.Remove(project);
        await _context.SaveChangesAsync();
        return true;
    }

    #endregion
}
