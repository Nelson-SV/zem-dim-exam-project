using Application.Interfaces.Infrastructure.Postgres;
using Application.Interfaces.Services;
using Application.Models.Dtos; // IStorageService, IDocuSealService
 
using Application.Services; // CreateDocuSealSubmissionDto, DocuSealSubmissionResponseDto, DocuSealWebhookDto, DocuSealWebhookResponseDto
using Microsoft.AspNetCore.Mvc;

namespace Api.Rest.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DocumentSignatureController : ControllerBase
{
    private readonly IStorageService _storageService;
    private readonly IDocumentRepository _documentRepository;
    private readonly IDocuSealService _docuSealService;

    public DocumentSignatureController(
        IStorageService storageService,
        IDocumentRepository documentRepository,
        IDocuSealService docuSealService)
    {
        _storageService = storageService;
        _documentRepository = documentRepository;
        _docuSealService = docuSealService;
    }

    // 1️⃣ Admin → Request signature
    [HttpPost("request")]
    public async Task<ActionResult<DocuSealSubmissionResponseDto>> RequestSignature(
        [FromBody] CreateDocuSealSubmissionDto dto)
    {
        // 1. Знайти документ у БД
        var document = await _documentRepository.GetByIdAsync(dto.DocumentId);
        if (document == null)
        {
            return NotFound($"Document with id '{dto.DocumentId}' not found");
        }

        if (string.IsNullOrWhiteSpace(document.Fileurl))
        {
            return BadRequest("Document does not have a file URL.");
        }

        // 2. Створити submission в DocuSeal
        var submission = await _docuSealService.CreateSubmission(
            documentUrl: document.Fileurl,
            signerEmail: dto.SignerEmail,
            signerName: dto.SignerName);

        // 3. Оновити документ у БД (зберегти submission id і статус)
        document.Docusealsubmissionid = submission.SubmissionId;
        document.Requiressignature = true;
        document.Issigned = false;

        await _documentRepository.UpdateAsync(document);

        // 4. Повернути інформацію про submission на фронт
        return Ok(submission);
    }

    // 2️⃣ DocuSeal → Webhook по завершенню підпису
    [HttpPost("webhook")]
    public async Task<ActionResult<DocuSealWebhookResponseDto>> Webhook([FromBody] DocuSealWebhookDto dto)
    {
        Console.WriteLine("📥 Webhook received: " + dto.EventType);

        if (!string.Equals(dto.EventType, "submission.completed", StringComparison.OrdinalIgnoreCase))
        {
            return Ok(new DocuSealWebhookResponseDto
            {
                Message = "Event ignored"
            });
        }

        var submissionId = dto.Data.SubmissionId;
        var signedUrl = dto.Data.SignedDocumentUrl;

        var document = await _documentRepository.GetByDocuSealSubmissionIdAsync(submissionId);

        if (document == null)
        {
            return NotFound(new DocuSealWebhookResponseDto
            {
                Message = "Document not found",
                DocumentId = null
            });
        }

        var pdfBytes = await _storageService.DownloadFileAsync(signedUrl);

        var fileName = $"{document.Id}_signed_{DateTime.UtcNow.Ticks}.pdf";
        var supabaseUrl = await _storageService.UploadSignedPdfAsync(pdfBytes, fileName);

        document.Issigned = true;
        document.Signedfileurl = supabaseUrl;
        document.Signedat = DateTime.UtcNow;
        document.Docusealoriginalurl = signedUrl;

        await _documentRepository.UpdateAsync(document);

        return Ok(new DocuSealWebhookResponseDto
        {
            Message = "Signature processed",
            DocumentId = document.Id,
            SignedFileUrl = supabaseUrl
        });
    }
}
