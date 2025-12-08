namespace Application.Models.Dtos.Documents;

/// <summary>
/// Request model for client document uploads.
/// Unlike admin uploads, these are automatically visible to clients.
/// </summary>
public class ClientUploadDocumentRequest
{
    /// <summary>
    /// The project this document belongs to
    /// </summary>
    public Guid ProjectId { get; set; }

    /// <summary>
    /// Document title (optional, will use filename if not provided)
    /// </summary>
    public string? Title { get; set; }

    /// <summary>
    /// Whether this document requires a signature from admin/company
    /// </summary>
    public bool RequiresSignature { get; set; }
}
