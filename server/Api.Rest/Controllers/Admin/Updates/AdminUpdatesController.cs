using Application.Interfaces.Services;
using Application.Models.Dtos.Common;
using Application.Models.Dtos.Update;
using Application.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Api.Rest.Controllers.Admin.Updates;

[ApiController]
[Authorize(Policy = AuthorizationRoles.Admin)]
[Route("api/admin/updates")]
public class AdminUpdatesController(IUpdateService service, ILogger<AdminUpdatesController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PaginationItemsResponse<UpdateDto>>> GetUpdates(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] Guid? projectId = null,
        [FromQuery] string? updateType = null,
        [FromQuery] string? search = null,
        CancellationToken ct = default)
    {
        try
        {
            var result = await service.GetUpdatesAsync(page, pageSize, projectId, updateType, search, ct);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to fetch updates (page {Page}, size {Size})", page, pageSize);
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
