using Api.Rest.AuthExtensions;
using Application.Interfaces.Services;
using Application.Models.Dtos.Common;
using Application.Models.Dtos.Photos;
using Application.Models.Dtos.Project;
using Application.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Rest.Controllers.Client;

public class ClientProjectPhotosController(
    IClientGalleryService galleryService,
    ILogger<ClientProjectPhotosController> logger) : ControllerBase
{
    public const string ControllerRoute = "api/client/gallery/";
    public const string GetProjectsRoute = ControllerRoute + nameof(GetProjects);
    public const string GetGalleryRoute = ControllerRoute + nameof(GetProjectPhotos);
    
    [HttpGet]
    [Authorize(Policy = AuthorizationRoles.User)]
    [Route(GetProjectsRoute)]
    public async Task<ActionResult<IEnumerable<ClientGalleryProjectDto>>> GetProjects([FromQuery] string userIdFromClient)
    {
        var userId = User.GetUserId();
        if (userId != Guid.Parse(userIdFromClient)) return Forbid();

        var projects = await galleryService.GetProjectsAsync(userId);
        return Ok(projects);
    }
    
    [HttpGet]
    [Authorize(Policy = AuthorizationRoles.User)]
    [Route(GetGalleryRoute)]
    public async Task<ActionResult<PaginationItemsResponse<PhotoDto>>> GetProjectPhotos(
        Guid projectId,
        [FromQuery] string userIdFromClient,
        [FromQuery] Guid? milestoneId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            var userId = User.GetUserId();

            if (userId != Guid.Parse(userIdFromClient))
                return Forbid();
            
            var result = await galleryService.GetPhotosAsync(userId, projectId, milestoneId, page, pageSize);
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
            logger.LogError(ex, "Failed to get photos for project {ProjectId}", projectId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }
}

