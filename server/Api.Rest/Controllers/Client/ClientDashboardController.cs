using Api.Rest.AuthExtensions;
using Application.Interfaces.Services;
using Application.Models.Dtos.Dashboard;
using Application.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Rest.Controllers.Client;

public class ClientDashboardController(IClientDashboardService dashboardService, ILogger<ClientDashboardController> logger) : ControllerBase
{
    public const string ControllerRoute = "api/client/dashboard/";
    public const string GetDashboardRoute = ControllerRoute + nameof(GetClientProjects);

    [HttpGet]
    [Authorize(Policy = AuthorizationRoles.User)]
    [Route(GetDashboardRoute)]
    public async Task<ActionResult<ClientDashboardResponseDto>> GetClientProjects(
        [FromQuery] string userIdFromClient,
        [FromQuery] Guid? projectId = null,
        [FromQuery] int updatesLimit = 5)
    {
        try
        {
            var userId = User.GetUserId();

            if (userId != Guid.Parse(userIdFromClient))
                return Forbid();

            var result = await dashboardService.GetDashboardAsync(userId, projectId, updatesLimit);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            logger.LogWarning(ex, "Unauthorized dashboard access");
            return Forbid();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {   
            logger.LogError(ex, "Failed to fetch client dashboard");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }
}
