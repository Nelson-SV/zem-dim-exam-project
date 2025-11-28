using Core.Domain.Entities;

namespace Application.Interfaces.Infrastructure.Postgres;

public interface IMilestoneRepository
{
    Task<bool> ProjectExistsAsync(Guid projectId, CancellationToken ct = default);
    Task<bool> BelongsToProjectAsync(Guid milestoneId, Guid projectId, CancellationToken ct = default);
    Task<int> GetNextOrderIndexAsync(Guid projectId, CancellationToken ct = default);
    Task<(IReadOnlyCollection<Milestone> Items, int Total)> GetByProjectAsync(Guid projectId, int page, int pageSize, CancellationToken ct = default);
    Task<IReadOnlyCollection<Milestone>> GetAllByProjectAsync(Guid projectId, CancellationToken ct = default);
    Task<Milestone?> GetByIdAsync(Guid milestoneId, CancellationToken ct = default);
    Task<Milestone> InsertAsync(Milestone milestone, CancellationToken ct = default);
    Task<Milestone> UpdateAsync(Milestone milestone, CancellationToken ct = default);
    Task SoftDeleteAsync(Guid milestoneId, CancellationToken ct = default);
}
