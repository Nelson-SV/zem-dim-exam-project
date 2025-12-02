using Application.Interfaces.Documents;
using Application.Models.Dtos.Documents;
using Application.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.IdentityModel.JsonWebTokens;

namespace Api.Rest.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Basic authorization
public class DocumentsController : ControllerBase
{
    private readonly IDocumentsService _documentsService;

    public DocumentsController(IDocumentsService documentsService)
    {
        _documentsService = documentsService;
    }

    // -----------------------------------------------------------
    // GET /api/documents
    // -----------------------------------------------------------
    [HttpGet]
    public async Task<ActionResult<IEnumerable<DocumentDto>>> GetAll()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst(JwtRegisteredClaimNames.Sub);
        var roleClaim = User.FindFirst(ClaimTypes.Role);

        if (userIdClaim == null || roleClaim == null)
            return Unauthorized("Missing user info");

        var userId = Guid.Parse(userIdClaim.Value);
        var role = roleClaim.Value;

        var result = await _documentsService.GetAllAsync(userId, role);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<DocumentDto>> GetById(Guid id)
    {
        var dto = await _documentsService.GetByIdAsync(id);
        if (dto == null)
            return NotFound("Document not found");

        return Ok(dto);
    }

    [HttpPost]
    [Authorize(Policy = AuthorizationRoles.Admin)] // ⬅️ Admin only
    [RequestSizeLimit(50 * 1024 * 1024)]
    public async Task<ActionResult<DocumentDto>> Upload(
        [FromForm] IFormFile file,
        [FromForm] Guid projectId,
        [FromForm] string title)
    {
        if (file == null || file.Length == 0)
            return BadRequest("File is required");

        if (!file.FileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
            return BadRequest("Only PDF files allowed");

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst(JwtRegisteredClaimNames.Sub);
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            return Unauthorized("Invalid or missing user id in token");

        await using var stream = file.OpenReadStream();

        var dto = await _documentsService.UploadAsync(
            stream,
            file.FileName,
            file.ContentType,
            projectId,
            title,
            userId);

        return Ok(dto);
    }

    [HttpPost("{documentId:guid}/sign")]
    [Authorize(Policy = AuthorizationRoles.User)] // ⬅️ User only
    public async Task<ActionResult<SignedDocumentResponseDto>> SignDocument(
        Guid documentId,
        [FromBody] SignDocumentRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.SignatureBase64))
            return BadRequest("Signature is required");

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst(JwtRegisteredClaimNames.Sub);
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            return Unauthorized("Invalid or missing user id in token");

        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();

        try
        {
            var signedUrl = await _documentsService.SignDocumentAsync(
                documentId,
                request.SignatureBase64,
                request.PositionX,
                request.PositionY,
                request.PositionWidth,
                request.PositionHeight,
                request.PageNumber,
                userId,
                ip);

            var response = new SignedDocumentResponseDto
            {
                DocumentId = documentId,
                SignedFileUrl = signedUrl,
                Message = "Document signed successfully"
            };

            return Ok(response);
        }
        catch (KeyNotFoundException)
        {
            return NotFound("Document not found");
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = AuthorizationRoles.Admin)] // ⬅️ Admin only
    public async Task<ActionResult<DocumentDto>> Update(Guid id, [FromBody] UpdateDocumentRequest request)
    {
        try
        {
            await _documentsService.UpdateAsync(id, request);
            var dto = await _documentsService.GetByIdAsync(id);
            return Ok(dto);
        }
        catch (KeyNotFoundException)
        {
            return NotFound("Document not found");
        }
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = AuthorizationRoles.Admin)] // ⬅️ Admin only
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            await _documentsService.DeleteAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound("Document not found");
        }
    }
}
