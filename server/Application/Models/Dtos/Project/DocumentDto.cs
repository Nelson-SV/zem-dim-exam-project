using System.ComponentModel.DataAnnotations;
using Core.Domain.Entities;

namespace Application.Models.Dtos.Project;

public class DocumentDto
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string Title { get; set; } = null!;
    public string FileName { get; set; } = null!;
    public string FileUrl { get; set; } = null!;
    public long? FileSize { get; set; }
    public string? MimeType { get; set; }
    public string DocumentType { get; set; } = null!;
    public Guid UploadedBy { get; set; }
    public string? UploadedByName { get; set; }
    public bool IsVisibleToClient { get; set; }
    public DateTime? CreatedAt { get; set; }

    public static DocumentDto FromEntity(Document document) => new()
    {
        Id = document.Id,
        ProjectId = document.Projectid,
        Title = document.Title,
        FileName = document.Filename,
        FileUrl = document.Fileurl,
        FileSize = document.Filesize,
        MimeType = document.Mimetype,
        DocumentType = document.Documenttype,
        UploadedBy = document.Uploadedbyid,
        UploadedByName = document.Uploadedby != null
            ? $"{document.Uploadedby.Firstname} {document.Uploadedby.Lastname}".Trim()
            : null,
        IsVisibleToClient = document.Isvisibletoclient ?? true,
        CreatedAt = document.Createdat
    };

    public static IReadOnlyCollection<DocumentDto> FromEntities(IEnumerable<Document> documents) =>
        documents.Select(FromEntity).ToList();
}

public class CreateDocumentDto
{
    [Required, MaxLength(200)]
    public string Title { get; set; } = null!;
    [Required, MaxLength(50)]
    public string DocumentType { get; set; } = "General";
    public bool IsVisibleToClient { get; set; } = true;
}

public class UpdateDocumentDto
{
    [MaxLength(200)]
    public string? Title { get; set; }
    [MaxLength(50)]
    public string? DocumentType { get; set; }
    public bool? IsVisibleToClient { get; set; }
}
