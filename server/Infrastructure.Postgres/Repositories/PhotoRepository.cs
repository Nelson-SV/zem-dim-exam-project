using Application.Interfaces.Infrastructure.Postgres;
using Core.Domain.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Postgres.Repositories;

public class PhotoRepository(AppDbContext ctx) : IPhotoRepository
{
    public Task<bool> ProjectExistsAsync(Guid projectId) =>
        ctx.Projects.AnyAsync(p => p.Id == projectId && !p.Isdeleted);

    public Task<bool> MilestoneBelongsToProjectAsync(Guid milestoneId, Guid projectId) =>
        ctx.Milestones.AnyAsync(m => m.Id == milestoneId && m.Projectid == projectId);

    public async Task<(IReadOnlyCollection<Photo> Items, int Total)> GetAsync(Guid projectId, Guid? milestoneId, int page, int pageSize)
    {
        var query = ctx.Photos
            .Include(p => p.Milestone)
            .Include(p => p.Project)
            .Include(p => p.Uploadedby)
            .Where(p => p.Projectid == projectId && (p.Isdeleted == false));

        if (milestoneId.HasValue)
            query = query.Where(p => p.Milestoneid == milestoneId.Value);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(p => p.Createdat)
            .ThenByDescending(p => p.Takenat)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, total);
    }

    public Task<Photo?> GetByIdAsync(Guid photoId) =>
        ctx.Photos
           .Include(p => p.Milestone)
           .Include(p => p.Project)
           .Include(p => p.Uploadedby)
           .FirstOrDefaultAsync(p => p.Id == photoId);

    public async Task<Photo> InsertAsync(Photo photo)
    {
        ctx.Photos.Add(photo);
        await ctx.SaveChangesAsync();
        return photo;
    }

    public async Task<Photo> UpdateAsync(Photo photo)
    {
        ctx.Photos.Update(photo);
        await ctx.SaveChangesAsync();
        await ctx.Entry(photo).Reference(p => p.Milestone).LoadAsync();
        await ctx.Entry(photo).Reference(p => p.Project).LoadAsync();
        await ctx.Entry(photo).Reference(p => p.Uploadedby).LoadAsync();
        return photo;
    }

    public async Task SoftDeleteAsync(Guid photoId)
    {
        var entity = await ctx.Photos.FindAsync(new object[] { photoId })
                     ?? throw new KeyNotFoundException("Photo not found");

        entity.Isdeleted = true;
        ctx.Photos.Update(entity);
        await ctx.SaveChangesAsync();
    }
}
