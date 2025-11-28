using System.Security.Claims;
using Application.Interfaces.Services;
using Application.Models.Dtos.Dashboard;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Api.Rest.Controllers.Client;

[ApiController]
[Route("api/client/dashboard")]
[Authorize]
public class ClientDashboardController : ControllerBase
{
    private readonly IClientDashboardService _dashboardService;
    private readonly ILogger<ClientDashboardController> _logger;

    public ClientDashboardController(IClientDashboardService dashboardService, ILogger<ClientDashboardController> logger)
    {
        _dashboardService = dashboardService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<ClientDashboardResponseDto>> GetDashboard(
        [FromQuery] Guid? projectId = null,
        [FromQuery] int updatesLimit = 5,
        CancellationToken ct = default)
    {
        try
        {
            var userId = GetUserIdFromToken();
            var role = GetUserRoleFromToken();

            var result = await _dashboardService.GetDashboardAsync(userId, role, projectId, updatesLimit, ct);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized dashboard access");
            return Forbid();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch client dashboard");
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
