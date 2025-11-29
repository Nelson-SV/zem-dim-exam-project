namespace Application.Models.Dtos.Documents;

public class SignedDocumentResponseDto
{
    public Guid DocumentId { get; set; }
    public string SignedFileUrl { get; set; } = null!;
    public string Message { get; set; } = null!;
}