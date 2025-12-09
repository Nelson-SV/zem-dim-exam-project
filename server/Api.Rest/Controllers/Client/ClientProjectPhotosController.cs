using System.Security.Claims;
using Application.Interfaces.Services;
using Application.Models.Dtos.Common;
using Application.Models.Dtos.Project;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Rest.Controllers.Client;

[ApiController]
[Route("api/client/projects/{projectId:guid}/photos")]
[Authorize]
public class ClientProjectPhotosController : ControllerBase
{
    private readonly IPhotoService _photoService;
    private readonly ILogger<ClientProjectPhotosController> _logger;

    public ClientProjectPhotosController(IPhotoService photoService, ILogger<ClientProjectPhotosController> logger)
    {
        _photoService = photoService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<PaginationItemsResponse<PhotoDto>>> GetProjectPhotos(
        Guid projectId,
        [FromQuery] Guid? milestoneId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            var requesterId = GetUserIdFromToken();
            var role = GetUserRoleFromToken();

            var result = await _photoService.GetForClientAsync(requesterId, role, projectId, milestoneId, page, pageSize);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get photos for project {ProjectId}", projectId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    private Guid GetUserIdFromToken()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                          ?? User.FindFirst("id")?.Value;

        if (string.IsNullOrEmpty(userIdClaim))
            throw new UnauthorizedAccessException("User ID not found in token");

        return Guid.Parse(userIdClaim);
    }

    private string GetUserRoleFromToken()
    {
        var role = User.FindFirst(ClaimTypes.Role)?.Value
                   ?? User.FindFirst("role")?.Value;

        if (string.IsNullOrEmpty(role))
            throw new UnauthorizedAccessException("User role not found in token");

        return role;
    }
}

