using Application.Models.Dtos.Common;
using Application.Models.Dtos.Project;

namespace Application.Interfaces.Services;

public interface IMilestoneService
{
    Task<PaginationItemsResponse<MilestoneDto>> GetByProjectAsync(Guid projectId, int page, int pageSize);
    Task<MilestoneDto> CreateAsync(Guid projectId, CreateMilestoneDto dto, Guid performedBy);
    Task<MilestoneDto> UpdateAsync(Guid projectId, Guid milestoneId, UpdateMilestoneDto dto, Guid performedBy);
    Task<MilestoneDto> PatchAsync(Guid projectId, Guid milestoneId, PatchMilestoneDto dto, Guid performedBy);
    Task DeleteAsync(Guid projectId, Guid milestoneId, Guid performedBy);
}
