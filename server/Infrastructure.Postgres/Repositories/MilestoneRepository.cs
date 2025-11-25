using Application.Interfaces.Infrastructure.Postgres;
using Core.Domain.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Postgres.Repositories;

public class MilestoneRepository(AppDbContext ctx) : IMilestoneRepository
{
    public Task<bool> ProjectExistsAsync(Guid projectId, CancellationToken ct = default) =>
        ctx.Projects.AnyAsync(p => p.Id == projectId && !p.Isdeleted, ct);

    public Task<bool> BelongsToProjectAsync(Guid milestoneId, Guid projectId, CancellationToken ct = default) =>
        ctx.Milestones.AnyAsync(m => m.Id == milestoneId && m.Projectid == projectId, ct);

    public async Task<int> GetNextOrderIndexAsync(Guid projectId, CancellationToken ct = default)
    {
        var currentMax = await ctx.Milestones
            .Where(m => m.Projectid == projectId)
            .MaxAsync(m => (int?)m.Orderindex, ct);

        return (currentMax ?? 0) + 1;
    }

    public async Task<(IReadOnlyCollection<Milestone> Items, int Total)> GetByProjectAsync(Guid projectId, int page, int pageSize, CancellationToken ct = default)
    {
        var query = ctx.Milestones
            .Include(m => m.Project)
            .Where(m => m.Projectid == projectId && (m.Isdeleted == false))
            .OrderBy(m => m.Orderindex);

        var total = await query.CountAsync(ct);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, total);
    }

    public Task<Milestone?> GetByIdAsync(Guid milestoneId, CancellationToken ct = default) =>
        ctx.Milestones
            .Include(m => m.Project)
            .FirstOrDefaultAsync(m => m.Id == milestoneId, ct);

    public async Task<Milestone> InsertAsync(Milestone milestone, CancellationToken ct = default)
    {
        ctx.Milestones.Add(milestone);
        await ctx.SaveChangesAsync(ct);
        return milestone;
    }

    public async Task<Milestone> UpdateAsync(Milestone milestone, CancellationToken ct = default)
    {
        ctx.Milestones.Update(milestone);
        await ctx.SaveChangesAsync(ct);
        return milestone;
    }

    public async Task SoftDeleteAsync(Guid milestoneId, CancellationToken ct = default)
    {
        var entity = await ctx.Milestones.FindAsync(new object[] { milestoneId }, ct)
                     ?? throw new KeyNotFoundException("Milestone not found");

        entity.Isdeleted = true;
        entity.Updatedat = DateTime.UtcNow;
        ctx.Milestones.Update(entity);
        await ctx.SaveChangesAsync(ct);
    }
}
