namespace Application.Models.Dtos.Documents;

public class UpdateDocumentRequest
{
    public string? Title { get; set; }
    public bool? IsVisibleToClient { get; set; }
    public bool? RequiresSignature { get; set; }
}
