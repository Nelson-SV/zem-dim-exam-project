using Application.Models.Dtos.Common;
using Application.Models.Dtos.Project;

namespace Application.Interfaces.Services;

public interface IMilestoneService
{
    Task<PaginationItemsResponse<MilestoneDto>> GetByProjectAsync(Guid projectId, int page, int pageSize, CancellationToken ct = default);
    Task<MilestoneDto> CreateAsync(Guid projectId, CreateMilestoneDto dto, Guid performedBy, CancellationToken ct = default);
    Task<MilestoneDto> UpdateAsync(Guid projectId, Guid milestoneId, UpdateMilestoneDto dto, Guid performedBy, CancellationToken ct = default);
    Task<MilestoneDto> PatchAsync(Guid projectId, Guid milestoneId, PatchMilestoneDto dto, Guid performedBy, CancellationToken ct = default);
    Task DeleteAsync(Guid projectId, Guid milestoneId, Guid performedBy, CancellationToken ct = default);
}
