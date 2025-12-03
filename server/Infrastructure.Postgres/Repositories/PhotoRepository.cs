using Application.Interfaces.Infrastructure.Postgres;
using Core.Domain.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Postgres.Repositories;

public class PhotoRepository(AppDbContext ctx) : IPhotoRepository
{
    public Task<bool> ProjectExistsAsync(Guid projectId, CancellationToken ct = default) =>
        ctx.Projects.AnyAsync(p => p.Id == projectId && !p.Isdeleted, ct);

    public Task<bool> MilestoneBelongsToProjectAsync(Guid milestoneId, Guid projectId, CancellationToken ct = default) =>
        ctx.Milestones.AnyAsync(m => m.Id == milestoneId && m.Projectid == projectId, ct);

    public async Task<(IReadOnlyCollection<Photo> Items, int Total)> GetAsync(Guid projectId, Guid? milestoneId, int page, int pageSize, CancellationToken ct = default)
    {
        var query = ctx.Photos
            .Include(p => p.Milestone)
            .Include(p => p.Project)
            .Include(p => p.Uploadedby)
            .Where(p => p.Projectid == projectId && (p.Isdeleted == false));

        if (milestoneId.HasValue)
            query = query.Where(p => p.Milestoneid == milestoneId.Value);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(p => p.Createdat)
            .ThenByDescending(p => p.Takenat)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, total);
    }

    public Task<Photo?> GetByIdAsync(Guid photoId, CancellationToken ct = default) =>
        ctx.Photos
           .Include(p => p.Milestone)
           .Include(p => p.Project)
           .Include(p => p.Uploadedby)
           .FirstOrDefaultAsync(p => p.Id == photoId, ct);

    public async Task<Photo> InsertAsync(Photo photo, CancellationToken ct = default)
    {
        ctx.Photos.Add(photo);
        await ctx.SaveChangesAsync(ct);
        return photo;
    }

    public async Task<Photo> UpdateAsync(Photo photo, CancellationToken ct = default)
    {
        ctx.Photos.Update(photo);
        await ctx.SaveChangesAsync(ct);
        await ctx.Entry(photo).Reference(p => p.Milestone).LoadAsync(ct);
        await ctx.Entry(photo).Reference(p => p.Project).LoadAsync(ct);
        await ctx.Entry(photo).Reference(p => p.Uploadedby).LoadAsync(ct);
        return photo;
    }

    public async Task SoftDeleteAsync(Guid photoId, CancellationToken ct = default)
    {
        var entity = await ctx.Photos.FindAsync(new object[] { photoId }, ct)
                     ?? throw new KeyNotFoundException("Photo not found");

        entity.Isdeleted = true;
        ctx.Photos.Update(entity);
        await ctx.SaveChangesAsync(ct);
    }
}
