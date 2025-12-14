using Application.Interfaces.Documents;
using Application.Interfaces.Infrastructure.Postgres;
using Application.Interfaces.Services;
using Application.Models.Dtos.Documents;
using Application.Models.Enums;
using Core.Domain.Entities;

namespace Application.Services.Documents;

public class DocumentsService : IDocumentsService
{
    private readonly IDocumentRepository _documentRepository;
    private readonly IStorageService _storageService;
    private readonly IPdfSignatureService _pdfSignatureService;
    private readonly IDocumentSignatureRepository _documentSignatureRepository;

    public DocumentsService(
        IDocumentRepository documentRepository,
        IStorageService storageService,
        IPdfSignatureService pdfSignatureService,
        IDocumentSignatureRepository documentSignatureRepository)
    {
        _documentRepository = documentRepository;
        _storageService = storageService;
        _pdfSignatureService = pdfSignatureService;
        _documentSignatureRepository = documentSignatureRepository;
    }

    // ============================================================
    // GET ALL (admin – sees everything, user – only own projects)
    // ============================================================

    public async Task<IEnumerable<DocumentDto>> GetAllAsync(Guid userId, string role)
    {
        var normalizedRole = role?.Trim().ToLowerInvariant() ?? "";
        var isAdmin = normalizedRole == Roles.AdminRole;

        IEnumerable<Document> docs;

        if (isAdmin)
        {
            // Admins see every non-deleted document
            docs = await _documentRepository.GetAllWithProjectAsync();
            docs = docs.Where(d => !d.Isdeleted);
        }
        else
        {
            // Clients only see documents that belong to them
            docs = await _documentRepository.GetUserDocumentsAsync(userId);
        }

        return docs.Select(MapToDto).ToList();
    }


    // ============================================================
    // GET BY ID
    // ============================================================

    public async Task<DocumentDto?> GetByIdAsync(Guid id)
    {
        var d = await _documentRepository.GetByIdWithProjectAsync(id);
        if (d == null)
            return null;

        return MapToDto(d);
    }

    // ============================================================
    // UPLOAD DOCUMENT (admin uploads)
    // ============================================================

    public async Task<DocumentDto> UploadAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        Guid projectId,
        string title,
        Guid uploadedById,
        bool isVisibleToClient = false,
        bool requiresSignature = false)
    {
        var fileUrl = await _storageService.UploadProjectDocumentAsync(
            fileStream,
            fileName,
            contentType
        );

        Console.WriteLine("URL HERE: " + fileUrl);

        var document = new Document
        {
            Id = Guid.NewGuid(),
            Projectid = projectId,
            Title = title,
            Filename = fileName,
            Fileurl = fileUrl,
            Filesize = fileStream.Length,
            // PostgreSQL: timestamp without time zone → Kind = Unspecified
            Createdat = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            Documenttype = "pdf",
            Uploadedbyid = uploadedById,
            Isdeleted = false,

            // Admin uploads: visibility and signature requirement are independent
            Isvisibletoclient = isVisibleToClient, // Admin decides if client can see
            Requiressignature = requiresSignature, // Admin decides if client needs to sign
            Issigned = false
        };

        await _documentRepository.AddAsync(document);

        return MapToDto(document);
    }

    // ============================================================
    // UPLOAD DOCUMENT FOR CLIENT (client uploads)
    // ============================================================

    public async Task<DocumentDto> UploadDocumentForClientAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        Guid projectId,
        string? title,
        bool requiresSignature,
        Guid uploadedById)
    {
        var fileUrl = await _storageService.UploadProjectDocumentAsync(
            fileStream,
            fileName,
            contentType
        );

        Console.WriteLine("Client upload URL: " + fileUrl);

        var document = new Document
        {
            Id = Guid.NewGuid(),
            Projectid = projectId,
            Title = title ?? fileName, // Use filename if title is not provided
            Filename = fileName,
            Fileurl = fileUrl,
            Filesize = fileStream.Length,
            Createdat = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            Documenttype = "pdf",
            Uploadedbyid = uploadedById,
            Isdeleted = false,

            // Client uploads are automatically visible to both client and admin
            Isvisibletoclient = true,
            Requiressignature = requiresSignature, // Client decides if signature is needed
            Issigned = false
        };

        await _documentRepository.AddAsync(document);

        return MapToDto(document);
    }

    // ============================================================
    // SIGN DOCUMENT (client or admin signs)
    // ============================================================

    public async Task<string> SignDocumentAsync(
        Guid documentId,
        string signatureBase64,
        double positionX,
        double positionY,
        double width,
        double height,
        int pageNumber,
        Guid userId,
        string userRole,
        string? ipAddress)
    {
        var document = await _documentRepository.GetByIdWithProjectAsync(documentId);
        if (document == null)
            throw new KeyNotFoundException("Document not found");

        if (document.Isdeleted)
            throw new InvalidOperationException("Document is deleted");

        if (document.Project == null)
            throw new InvalidOperationException("Document is not linked to any project.");

        var normalizedRole = userRole?.ToLowerInvariant() ?? "";
        var isAdmin = normalizedRole == Roles.AdminRole;

        // 🔒 Access control: clients may only sign documents from their own projects, admins can sign any
        if (!isAdmin && document.Project.Clientid != userId)
            throw new InvalidOperationException("You are not allowed to sign this document.");

        if (document.Issigned == true)
            throw new InvalidOperationException("Document is already signed.");

        if (document.Requiressignature != true)
            throw new InvalidOperationException("This document does not require a signature.");

        // Apply the signature to the PDF (generate a new file in Supabase)
        var signedUrl = await _pdfSignatureService.SignDocumentAsync(
            document,
            signatureBase64,
            positionX,
            positionY,
            width,
            height,
            pageNumber);

        document.Issigned = true;
        document.Signedat = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        document.Signedbyuserid = userId;
        document.Signedfileurl = signedUrl;

        await _documentRepository.UpdateAsync(document);

        // Signature log entry
        var signature = new DocumentSignature
        {
            Id = Guid.NewGuid(),
            DocumentId = document.Id,
            UserId = userId,
            SignatureBase64 = signatureBase64,
            SignedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            IpAddress = ipAddress,
            CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
        };

        await _documentSignatureRepository.AddAsync(signature);

        return signedUrl;
    }

    // ============================================================
    // UPDATE (admin toggles RequiresSignature / VisibleToClient)
    // ============================================================

    public async Task UpdateAsync(Guid id, UpdateDocumentRequest request)
    {
        var document = await _documentRepository.GetByIdAsync(id);
        if (document == null)
            throw new KeyNotFoundException("Document not found");

        if (request.Title != null)
            document.Title = request.Title;

        if (request.IsVisibleToClient.HasValue)
            document.Isvisibletoclient = request.IsVisibleToClient.Value;

        if (request.RequiresSignature.HasValue)
            document.Requiressignature = request.RequiresSignature.Value;

        await _documentRepository.UpdateAsync(document);
    }

    // ============================================================
    // DELETE
    // ============================================================

    public async Task DeleteAsync(Guid id)
    {
        var document = await _documentRepository.GetByIdAsync(id);
        if (document == null)
            throw new KeyNotFoundException("Document not found");

        if (!string.IsNullOrWhiteSpace(document.Fileurl))
            await _storageService.DeleteFileAsync(document.Fileurl);

        if (!string.IsNullOrWhiteSpace(document.Signedfileurl))
            await _storageService.DeleteFileAsync(document.Signedfileurl);

        document.Isdeleted = true;
        await _documentRepository.UpdateAsync(document);
    }

    // ============================================================
    // MAP TO DTO
    // ============================================================

    private static DocumentDto MapToDto(Document d)
    {
        // Map role to uploadedBy type
        string uploadedBy = "unknown";
        if (d.Uploadedby != null)
        {
            var role = d.Uploadedby.Role?.ToLowerInvariant();
            uploadedBy = role switch
            {
                "admin" => "company",
                "user" => "client",
                _ => "unknown"
            };
        }

        return new DocumentDto
        {
            Id = d.Id,
            ProjectId = d.Projectid,
            ProjectTitle = d.Project?.Title,

            Title = d.Title,
            FileName = d.Filename,
            FileUrl = d.Fileurl,
            FileSize = d.Filesize,

            CreatedAt = d.Createdat,
            UploadedBy = uploadedBy,

            DocumentType = d.Documenttype,

            RequiresSignature = d.Requiressignature ?? false,
            IsSigned = d.Issigned ?? false,
            SignedAt = d.Signedat,
            SignedByUserId = d.Signedbyuserid,
            SignedFileUrl = d.Signedfileurl
        };
    }
}
