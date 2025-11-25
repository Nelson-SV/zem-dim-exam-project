using Application.Interfaces.Infrastructure.Postgres;
using Application.Interfaces.Services;
using Application.Models.Dtos.Documents;
using Core.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Api.Rest.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentRepository _documentRepository;
    private readonly IStorageService _storageService;

    public DocumentsController(
        IDocumentRepository documentRepository,
        IStorageService storageService)
    {
        _documentRepository = documentRepository;
        _storageService = storageService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DocumentDto>>> GetAll()
    {
        var docs = await _documentRepository.GetAllAsync();

        var result = docs.Select(d => new DocumentDto
        {
            Id = d.Id,
            Title = d.Title,
            Filename = d.Filename,
            Fileurl = d.Fileurl,
            Filesize = d.Filesize,
            UploadedBy = "admin",
            Createdat = d.Createdat,
            Documenttype = d.Documenttype,
            Projectid = d.Projectid,
            Docusealsubmissionid = d.Docusealsubmissionid,
            Requiressignature = d.Requiressignature,
            Issigned = d.Issigned,
            Signedat = d.Signedat,
            Signedfileurl = d.Signedfileurl,
            Signedbyuserid = d.Signedbyuserid
        });

        return Ok(result);
    }

    [HttpPost]
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

        // 1. User Id з JWT
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            return Unauthorized("Invalid or missing user id in token");

        // 2. Upload у storage
        await using var stream = file.OpenReadStream();
        var fileUrl = await _storageService.UploadProjectDocumentAsync(
            stream,
            file.FileName,
            file.ContentType
        );

        // 3. Запис у базу
        var document = new Document
        {
            Id = Guid.NewGuid(),
            Projectid = projectId,
            Title = title,
            Filename = file.FileName,
            Fileurl = fileUrl,
            Filesize = file.Length,
            Createdat = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            Documenttype = "pdf",
            Uploadedbyid = userId,
            Isdeleted = false,
            Isvisibletoclient = true,
            Requiressignature = false,
            Issigned = false
        };


        await _documentRepository.AddAsync(document);

        var dto = new DocumentDto
        {
            Id = document.Id,
            Title = document.Title,
            Filename = document.Filename,
            Fileurl = document.Fileurl,
            Filesize = document.Filesize,
            UploadedBy = "admin",
            Createdat = document.Createdat,
            Documenttype = document.Documenttype
        };

        return Ok(dto);
    }
}
