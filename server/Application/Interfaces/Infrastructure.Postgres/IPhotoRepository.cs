using Core.Domain.Entities;

namespace Application.Interfaces.Infrastructure.Postgres;

public interface IPhotoRepository
{
    Task<bool> ProjectExistsAsync(Guid projectId);
    Task<bool> MilestoneBelongsToProjectAsync(Guid milestoneId, Guid projectId);
    Task<(IReadOnlyCollection<Photo> Items, int Total)> GetAsync(Guid projectId, Guid? milestoneId, int page, int pageSize);
    Task<Photo?> GetByIdAsync(Guid photoId);
    Task<Photo> InsertAsync(Photo photo);
    Task<Photo> UpdateAsync(Photo photo);
    Task SoftDeleteAsync(Guid photoId);
}
