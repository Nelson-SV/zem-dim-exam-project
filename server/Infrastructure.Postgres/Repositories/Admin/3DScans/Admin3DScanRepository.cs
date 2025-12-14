using Application.Interfaces.Infrastructure.Postgres.Admin._3DScans;
using Application.Models;
using Core.Domain.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Postgres.Repositories.Admin._3DScans;

public class Admin3DScanRepository(AppDbContext ctx) : IAdmin3DScanRepository
{
    public Task<bool> ProjectExistsAsync(Guid projectId)
        => ctx.Projects.AnyAsync(p => p.Id == projectId && !p.Isdeleted);

    public Task<bool> MilestoneBelongsToProjectAsync(Guid milestoneId, Guid projectId)
        => ctx.Milestones.AnyAsync(m => m.Id == milestoneId && m.Projectid == projectId);

    public async Task<Threedscan> InsertAsync(Threedscan scan)
    {
        ctx.Threedscans.Add(scan);
        await ctx.SaveChangesAsync();
        return scan;
    }

    public async Task<(IReadOnlyCollection<Threedscan>, int)> GetAsync(Guid? projectId, Guid? milestoneId, int page, int pageSize)
    {
        var query = ctx.Threedscans
            .Include(s => s.Project)
            .Include(s => s.Milestone)
            .Include(s => s.Uploadedby)
            .AsQueryable();

        if (projectId.HasValue) query = query.Where(s => s.Projectid == projectId.Value);
        if (milestoneId.HasValue) query = query.Where(s => s.Milestoneid == milestoneId.Value);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(s => s.Createdat)   // primary sort
            .ThenByDescending(s => s.Scannedat)    // secondary sort
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, total);
    }

    public Task<Threedscan?> GetByIdAsync(Guid scanId)
        => ctx.Threedscans
            .Include(s => s.Project)
            .Include(s => s.Milestone)
            .Include(s => s.Uploadedby)
            .FirstOrDefaultAsync(s => s.Id == scanId);

    public async Task DeleteAsync(Guid scanId)
    {
        var entity = await ctx.Threedscans.FindAsync(new object[] { scanId }) ?? throw new ApplicationException(ErrorMessages.GetMessage(ErrorCode.ThreeDScanNotFound));
        ctx.Threedscans.Remove(entity);
        await ctx.SaveChangesAsync();
    }

    public async Task<Threedscan> UpdateAsync(Threedscan scan)
    {
        ctx.Threedscans.Update(scan);
        await ctx.SaveChangesAsync();
        await ctx.Entry(scan).Reference(s => s.Project).LoadAsync();
        await ctx.Entry(scan).Reference(s => s.Milestone).LoadAsync();
        await ctx.Entry(scan).Reference(s => s.Uploadedby).LoadAsync();
        return scan;
    }

}
