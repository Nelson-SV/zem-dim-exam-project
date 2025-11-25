using Core.Domain.Entities;

namespace Application.Interfaces.Infrastructure.Postgres;

public interface IPhotoRepository
{
    Task<bool> ProjectExistsAsync(Guid projectId, CancellationToken ct = default);
    Task<bool> MilestoneBelongsToProjectAsync(Guid milestoneId, Guid projectId, CancellationToken ct = default);
    Task<(IReadOnlyCollection<Photo> Items, int Total)> GetAsync(Guid projectId, Guid? milestoneId, int page, int pageSize, CancellationToken ct = default);
    Task<Photo?> GetByIdAsync(Guid photoId, CancellationToken ct = default);
    Task<Photo> InsertAsync(Photo photo, CancellationToken ct = default);
    Task<Photo> UpdateAsync(Photo photo, CancellationToken ct = default);
    Task SoftDeleteAsync(Guid photoId, CancellationToken ct = default);
}
