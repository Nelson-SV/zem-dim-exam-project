using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Application.Interfaces.Services;
using Application.Models.Dtos.Common;
using Application.Models.Dtos.Project;
using Application.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Api.Rest.Controllers.Admin.Projects;

[ApiController]
[Route("api/admin/projects/{projectId:guid}/photos")]
[Authorize(Policy = AuthorizationRoles.Admin)]
public class AdminProjectPhotosController(IPhotoService service, ILogger<AdminProjectPhotosController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PaginationItemsResponse<PhotoDto>>> GetPhotos(Guid projectId, [FromQuery] Guid? milestoneId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        try
        {
            var result = await service.GetAsync(projectId, milestoneId, page, pageSize);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to get photos for project {ProjectId}", projectId);
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<PhotoDto>> UploadPhoto(Guid projectId, [FromForm] UploadPhotoForm form)
    {
        if (form.File == null || form.File.Length == 0)
            return BadRequest("Photo file is required.");

        try
        {
            var userId = GetUserId();
            await using var stream = form.File.OpenReadStream();
            var dto = new CreatePhotoDto
            {
                MilestoneId = form.MilestoneId,
                Caption = form.Caption,
                TakenAt = form.TakenAt
            };

            var result = await service.CreateAsync(
                projectId,
                dto,
                stream,
                form.File.FileName,
                form.File.ContentType,
                form.File.Length,
                userId);

            return CreatedAtAction(nameof(GetPhotos), new { projectId, page = 1, pageSize = 1 }, result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (ApplicationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to upload photo for project {ProjectId}", projectId);
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPut("{photoId:guid}")]
    public async Task<ActionResult<PhotoDto>> UpdatePhoto(Guid projectId, Guid photoId, [FromBody] UpdatePhotoDto dto)
    {
        try
        {
            var userId = GetUserId();
            var result = await service.UpdateAsync(projectId, photoId, dto, userId);
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
            logger.LogError(ex, "Failed to update photo {PhotoId}", photoId);
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpDelete("{photoId:guid}")]
    public async Task<ActionResult> DeletePhoto(Guid projectId, Guid photoId)
    {
        try
        {
            var userId = GetUserId();
            await service.DeleteAsync(projectId, photoId, userId);
            return Ok(new { message = "Photo deleted", photoId });
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
            logger.LogError(ex, "Failed to delete photo {PhotoId}", photoId);
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

    public class UploadPhotoForm
    {
        [Required]
        public IFormFile File { get; set; } = default!;
        public Guid? MilestoneId { get; set; }
        public string Caption { get; set; } = null!;
        public DateTime TakenAt { get; set; }
    }
}
