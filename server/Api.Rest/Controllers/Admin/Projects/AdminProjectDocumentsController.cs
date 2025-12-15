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
[Route("api/admin/projects/{projectId:guid}/documents")]
[Authorize(Policy = AuthorizationRoles.Admin)]
public class AdminProjectDocumentsController(IDocumentService service, ILogger<AdminProjectDocumentsController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PaginationItemsResponse<DocumentDto>>> GetDocuments(Guid projectId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        try
        {
            var result = await service.GetAsync(projectId, page, pageSize);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to fetch documents for project {ProjectId}", projectId);
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<DocumentDto>> UploadDocument(Guid projectId, [FromForm] UploadDocumentForm form)
    {
        if (form.File == null || form.File.Length == 0)
            return BadRequest("Document file is required.");

        try
        {
            var userId = GetUserId();
            await using var stream = form.File.OpenReadStream();
            var dto = new CreateDocumentDto
            {
                Title = form.Title,
                DocumentType = form.DocumentType ?? "General",
                IsVisibleToClient = form.IsVisibleToClient
            };

            var result = await service.CreateAsync(projectId, dto, stream, form.File.FileName, form.File.ContentType, form.File.Length, userId);
            return CreatedAtAction(nameof(GetDocuments), new { projectId, page = 1, pageSize = 1 }, result);
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
            logger.LogError(ex, "Failed to upload document for project {ProjectId}", projectId);
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPut("{documentId:guid}")]
    public async Task<ActionResult<DocumentDto>> UpdateDocument(Guid projectId, Guid documentId, [FromBody] UpdateDocumentDto dto)
    {
        try
        {
            var userId = GetUserId();
            var result = await service.UpdateAsync(projectId, documentId, dto, userId);
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
            logger.LogError(ex, "Failed to update document {DocumentId}", documentId);
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpDelete("{documentId:guid}")]
    public async Task<ActionResult> DeleteDocument(Guid projectId, Guid documentId)
    {
        try
        {
            var userId = GetUserId();
            await service.DeleteAsync(projectId, documentId, userId);
            return Ok(new { message = "Document deleted", documentId });
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
            logger.LogError(ex, "Failed to delete document {DocumentId}", documentId);
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

    public class UploadDocumentForm
    {
        [Required, MaxLength(200)]
        public string Title { get; set; } = null!;
        [MaxLength(50)]
        public string? DocumentType { get; set; }
        public bool IsVisibleToClient { get; set; } = true;
        [Required]
        public IFormFile File { get; set; } = default!;
    }
}
