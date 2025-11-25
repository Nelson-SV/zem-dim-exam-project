namespace Application.Models.Dtos.Documents;

public class DocumentDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = default!;
    public string Filename { get; set; } = default!;
    public string Fileurl { get; set; } = default!;
    public long? Filesize { get; set; }

    public string UploadedBy { get; set; } = default!; // "company" / "client" / "admin"
    public DateTime? Createdat { get; set; }

    public string Documenttype { get; set; } = "pdf";
    public Guid Projectid { get; set; }
    public string? Docusealsubmissionid { get; set; }
    public bool? Requiressignature { get; set; }
    public bool? Issigned { get; set; }
    public DateTime? Signedat { get; set; }
    public string? Signedfileurl { get; set; }
    public Guid? Signedbyuserid { get; set; }
}