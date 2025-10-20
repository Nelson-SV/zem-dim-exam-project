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

    public async Task<List<Project>> GetAllAsync()
    {
        return await _context.Projects
            .Include(p => p.Client)
            .OrderByDescending(p => p.Createdat)
            .ToListAsync();
    }

    public async Task<List<Project>> GetByClientIdAsync(Guid clientId)
    {
        return await _context.Projects
            .Include(p => p.Client)
            .Where(p => p.Clientid == clientId)
            .OrderByDescending(p => p.Createdat)
            .ToListAsync();
    }

    public async Task<Project?> GetByIdAsync(Guid projectId)
    {
        return await _context.Projects
            .Include(p => p.Client)
            .FirstOrDefaultAsync(p => p.Id == projectId);
    }
}