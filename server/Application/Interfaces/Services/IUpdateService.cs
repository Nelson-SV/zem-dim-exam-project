using Application.Models.Dtos.Common;
using Application.Models.Dtos.Update;

namespace Application.Interfaces.Services;

public interface IUpdateService
{
    Task<PaginationItemsResponse<UpdateDto>> GetUpdatesAsync(
        int page,
        int pageSize,
        Guid? projectId,
        string? updateType,
        string? search,
        CancellationToken ct = default);
}
