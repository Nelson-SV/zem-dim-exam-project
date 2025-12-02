// SignDocumentRequest.cs - UPDATED DTO
namespace Application.Models.Dtos.Documents;

public class SignDocumentRequest
{
    public string SignatureBase64 { get; set; } = string.Empty;
    
    // Signature coordinates on the PDF
    public double PositionX { get; set; }
    public double PositionY { get; set; }
    public double PositionWidth { get; set; } = 150; // Default value
    public double PositionHeight { get; set; } = 75; // Default value
    public int PageNumber { get; set; } = 1; // Which page to sign
}
