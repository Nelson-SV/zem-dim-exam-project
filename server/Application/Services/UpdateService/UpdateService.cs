using Application.Interfaces.Infrastructure.Postgres;
using Application.Interfaces.Services;
using Application.Models.Dtos.Common;
using Application.Models.Dtos.Update;
using Microsoft.Extensions.Logging;

namespace Application.Services.UpdateService;

public class UpdateService(IUpdateRepository repository, ILogger<UpdateService> logger) : IUpdateService
{
    private const int MaxPageSize = 100;

    public async Task<PaginationItemsResponse<UpdateDto>> GetUpdatesAsync(
        int page,
        int pageSize,
        Guid? projectId,
        string? updateType,
        string? search)
    {
        if (page < 1) page = 1;
        if (pageSize <= 0 || pageSize > MaxPageSize) pageSize = 20;

        var (items, total) = await repository.GetUpdatesAsync(page, pageSize, projectId, updateType, search);

        logger.LogInformation("Fetched {Count} updates (page {Page}/{TotalPages})", items.Count, page, (int)Math.Ceiling(total / (double)pageSize));

        return new PaginationItemsResponse<UpdateDto>
        {
            Items = UpdateDto.FromEntities(items),
            Page = page,
            PageSize = pageSize,
            TotalItems = total
        };
    }
}
