using Core.Domain.Entities;

namespace Application.Interfaces.Infrastructure.Postgres;

public interface IMilestoneRepository
{
    Task<bool> ProjectExistsAsync(Guid projectId);
    Task<bool> BelongsToProjectAsync(Guid milestoneId, Guid projectId);
    Task<int> GetNextOrderIndexAsync(Guid projectId);
    Task<(IReadOnlyCollection<Milestone> Items, int Total)> GetByProjectAsync(Guid projectId, int page, int pageSize);
    Task<IReadOnlyCollection<Milestone>> GetMilestonesByProjectAsync(Guid projectId);
    Task<Milestone?> GetByIdAsync(Guid milestoneId);
    Task<Milestone> InsertAsync(Milestone milestone);
    Task<Milestone> UpdateAsync(Milestone milestone);
    Task SoftDeleteAsync(Guid milestoneId);
}
