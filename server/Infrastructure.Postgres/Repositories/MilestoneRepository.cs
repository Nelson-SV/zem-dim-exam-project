using Application.Interfaces.Infrastructure.Postgres;
using Core.Domain.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Postgres.Repositories;

public class MilestoneRepository(AppDbContext ctx) : IMilestoneRepository
{
    public Task<bool> ProjectExistsAsync(Guid projectId) =>
        ctx.Projects.AnyAsync(p => p.Id == projectId && !p.Isdeleted);

    public Task<bool> BelongsToProjectAsync(Guid milestoneId, Guid projectId) =>
        ctx.Milestones.AnyAsync(m => m.Id == milestoneId && m.Projectid == projectId);

    public async Task<int> GetNextOrderIndexAsync(Guid projectId)
    {
        var currentMax = await ctx.Milestones
            .Where(m => m.Projectid == projectId)
            .MaxAsync(m => (int?)m.Orderindex);

        return (currentMax ?? 0) + 1;
    }

    public async Task<(IReadOnlyCollection<Milestone> Items, int Total)> GetByProjectAsync(Guid projectId, int page, int pageSize)
    {
        var query = ctx.Milestones
            .Include(m => m.Project)
            .Where(m => m.Projectid == projectId && (m.Isdeleted == false))
            .OrderBy(m => m.Orderindex);

        var total = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, total);
    }

    public async Task<IReadOnlyCollection<Milestone>> GetAllByProjectAsync(Guid projectId)
    {
        return await ctx.Milestones
            .Where(m => m.Projectid == projectId && m.Isdeleted == false)
            .OrderBy(m => m.Orderindex)
            .ToListAsync();
    }

    public Task<Milestone?> GetByIdAsync(Guid milestoneId) =>
        ctx.Milestones
            .Include(m => m.Project)
            .FirstOrDefaultAsync(m => m.Id == milestoneId);

    public async Task<Milestone> InsertAsync(Milestone milestone)
    {
        ctx.Milestones.Add(milestone);
        await ctx.SaveChangesAsync();
        return milestone;
    }

    public async Task<Milestone> UpdateAsync(Milestone milestone)
    {
        ctx.Milestones.Update(milestone);
        await ctx.SaveChangesAsync();
        return milestone;
    }

    public async Task SoftDeleteAsync(Guid milestoneId)
    {
        var entity = await ctx.Milestones.FindAsync(new object[] { milestoneId })
                     ?? throw new KeyNotFoundException("Milestone not found");

        entity.Isdeleted = true;
        entity.Updatedat = DateTime.UtcNow;
        ctx.Milestones.Update(entity);
        await ctx.SaveChangesAsync();
    }
}
