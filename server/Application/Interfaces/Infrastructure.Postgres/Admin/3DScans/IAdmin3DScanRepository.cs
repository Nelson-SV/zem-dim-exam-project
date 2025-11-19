using Core.Domain.Entities;

namespace Application.Interfaces.Infrastructure.Postgres.Admin._3DScans;

public interface IAdmin3DScanRepository
{
    Task<bool> ProjectExistsAsync(Guid projectId, CancellationToken ct);
    Task<bool> MilestoneBelongsToProjectAsync(Guid milestoneId, Guid projectId, CancellationToken ct);
    Task<Threedscan> InsertAsync(Threedscan scan, CancellationToken ct);
    Task<(IReadOnlyCollection<Threedscan> Items, int Total)> GetAsync(Guid? projectId, Guid? milestoneId, int page, int pageSize, CancellationToken ct);
    Task<Threedscan?> GetByIdAsync(Guid scanId, CancellationToken ct);
    Task DeleteAsync(Guid scanId, CancellationToken ct);
    Task<Threedscan> UpdateAsync(Threedscan scan, CancellationToken ct);

}