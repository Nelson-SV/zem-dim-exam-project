namespace Application.Models.Dtos.Documents;

public class DocumentDto
{
    public Guid Id { get; set; }

    public Guid ProjectId { get; set; }
    public string? ProjectTitle { get; set; }

    public string Title { get; set; } = default!;
    public string FileName { get; set; } = default!;
    public string FileUrl { get; set; } = default!;
    public long? FileSize { get; set; }

    public DateTime? CreatedAt { get; set; }
    public string UploadedBy { get; set; } = default!; // "admin" / "client" / "company"

    public string DocumentType { get; set; } = "pdf";

    public bool RequiresSignature { get; set; }
    public bool IsSigned { get; set; }
    public DateTime? SignedAt { get; set; }
    public Guid? SignedByUserId { get; set; }
    public string? SignedFileUrl { get; set; }
}