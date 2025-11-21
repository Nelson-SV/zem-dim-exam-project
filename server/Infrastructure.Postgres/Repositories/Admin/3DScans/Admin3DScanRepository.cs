using Application.Interfaces.Infrastructure.Postgres.Admin._3DScans;
using Application.Models;
using Core.Domain.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Postgres.Repositories.Admin._3DScans;

public class Admin3DScanRepository(AppDbContext ctx) : IAdmin3DScanRepository
{
    public Task<bool> ProjectExistsAsync(Guid projectId, CancellationToken ct)
        => ctx.Projects.AnyAsync(p => p.Id == projectId && !p.Isdeleted, ct);

    public Task<bool> MilestoneBelongsToProjectAsync(Guid milestoneId, Guid projectId, CancellationToken ct)
        => ctx.Milestones.AnyAsync(m => m.Id == milestoneId && m.Projectid == projectId, ct);

    public async Task<Threedscan> InsertAsync(Threedscan scan, CancellationToken ct)
    {
        ctx.Threedscans.Add(scan);
        await ctx.SaveChangesAsync(ct);
        return scan;
    }

    public async Task<(IReadOnlyCollection<Threedscan>, int)> GetAsync(Guid? projectId, Guid? milestoneId, int page, int pageSize, CancellationToken ct)
    {
        var query = ctx.Threedscans
            .Include(s => s.Project)
            .Include(s => s.Milestone)
            .Include(s => s.Uploadedby)
            .AsQueryable();

        if (projectId.HasValue) query = query.Where(s => s.Projectid == projectId.Value);
        if (milestoneId.HasValue) query = query.Where(s => s.Milestoneid == milestoneId.Value);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(s => s.Createdat)   // primary sort
            .ThenByDescending(s => s.Scannedat)    // secondary sort
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, total);
    }

    public Task<Threedscan?> GetByIdAsync(Guid scanId, CancellationToken ct)
    {
        throw new NotImplementedException();
    }

    public async Task DeleteAsync(Guid scanId, CancellationToken ct)
    {
        var entity = await ctx.Threedscans.FindAsync(new object[] { scanId }, ct) ?? throw new ApplicationException(ErrorMessages.GetMessage(ErrorCode.ThreeDScanNotFound));
        ctx.Threedscans.Remove(entity);
        await ctx.SaveChangesAsync(ct);
    }

    public async Task<Threedscan> UpdateAsync(Threedscan scan, CancellationToken ct)
    {
        ctx.Threedscans.Update(scan);
        await ctx.SaveChangesAsync(ct);
        await ctx.Entry(scan).Reference(s => s.Project).LoadAsync(ct);
        await ctx.Entry(scan).Reference(s => s.Milestone).LoadAsync(ct);
        await ctx.Entry(scan).Reference(s => s.Uploadedby).LoadAsync(ct);
        return scan;
    }

}