using System.Security.Claims;
using Application.Interfaces.Services;
using Application.Models.Dtos.Common;
using Application.Models.Dtos.Project;
using Application.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Rest.Controllers.Admin.Projects;

[ApiController]
[Route("api/admin/projects/{projectId:guid}/stages")]
[Authorize(Policy = AuthorizationRoles.Admin)]
public class AdminProjectMilestonesController(IMilestoneService service, ILogger<AdminProjectMilestonesController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PaginationItemsResponse<MilestoneDto>>> GetStages(Guid projectId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        try
        {
            var result = await service.GetByProjectAsync(projectId, page, pageSize);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to fetch stages for project {ProjectId}", projectId);
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<ActionResult<MilestoneDto>> CreateStage(Guid projectId, [FromBody] CreateMilestoneDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try
        {
            var userId = GetUserId();
            var result = await service.CreateAsync(projectId, dto, userId);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to create stage for project {ProjectId}", projectId);
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPut("{stageId:guid}")]
    public async Task<ActionResult<MilestoneDto>> UpdateStage(Guid projectId, Guid stageId, [FromBody] UpdateMilestoneDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try
        {
            var userId = GetUserId();
            var result = await service.UpdateAsync(projectId, stageId, dto, userId);
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
            logger.LogError(ex, "Failed to update stage {StageId}", stageId);
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPatch("{stageId:guid}")]
    public async Task<ActionResult<MilestoneDto>> PatchStage(Guid projectId, Guid stageId, [FromBody] PatchMilestoneDto dto)
    {
        try
        {
            var userId = GetUserId();
            var result = await service.PatchAsync(projectId, stageId, dto, userId);
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
            logger.LogError(ex, "Failed to patch stage {StageId}", stageId);
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpDelete("{stageId:guid}")]
    public async Task<ActionResult> DeleteStage(Guid projectId, Guid stageId)
    {
        try
        {
            var userId = GetUserId();
            await service.DeleteAsync(projectId, stageId, userId);
            return Ok(new { message = "Stage deleted", stageId });
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
            logger.LogError(ex, "Failed to delete stage {StageId}", stageId);
            return StatusCode(500, new { error = ex.Message });
        }
    }

    private Guid GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(claim))
            throw new UnauthorizedAccessException("User id not found in token");
        return Guid.Parse(claim);
    }
}
