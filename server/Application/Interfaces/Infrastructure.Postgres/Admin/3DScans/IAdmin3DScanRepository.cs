using Core.Domain.Entities;

namespace Application.Interfaces.Infrastructure.Postgres.Admin._3DScans;

public interface IAdmin3DScanRepository
{
    Task<bool> ProjectExistsAsync(Guid projectId);
    Task<bool> MilestoneBelongsToProjectAsync(Guid milestoneId, Guid projectId);
    Task<Threedscan> InsertAsync(Threedscan scan);
    Task<(IReadOnlyCollection<Threedscan> Items, int Total)> GetAsync(Guid? projectId, Guid? milestoneId, int page, int pageSize);
    Task<Threedscan?> GetByIdAsync(Guid scanId);
    Task DeleteAsync(Guid scanId);
    Task<Threedscan> UpdateAsync(Threedscan scan);

}