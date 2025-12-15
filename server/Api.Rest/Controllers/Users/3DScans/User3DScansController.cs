

using Application.Interfaces.Users._3DScans;
using Application.Models.Dtos._3DScans;
using Application.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Rest.Controllers.Users._3DScans;


public class User3DScansController(IUser3DScanService service, ILogger<User3DScansController> logger) : ControllerBase
{
    public const string ControllerRoute = "api/client/3dscans/";
    public const string GetScansRoute = ControllerRoute + nameof(GetClientScans);
    
    [HttpGet]
    [Authorize(Policy = AuthorizationRoles.User)]
    [Route(GetScansRoute)]
    public async Task<ActionResult<List<User3DScanProjectDto>>> GetClientScans([FromQuery] Guid clientId)
    {
        if (clientId == Guid.Empty)
            return BadRequest("Client ID is required.");

        var scans = await service.GetScansByClientIdAsync(clientId);
        return Ok(scans);
    }
}