// SignDocumentRequest.cs - ОНОВЛЕНИЙ DTO
namespace Application.Models.Dtos.Documents;

public class SignDocumentRequest
{
    public string SignatureBase64 { get; set; } = string.Empty;
    
    // Координати підпису на PDF
    public double PositionX { get; set; }
    public double PositionY { get; set; }
    public double PositionWidth { get; set; } = 150; // За замовчуванням
    public double PositionHeight { get; set; } = 75; // За замовчуванням
    public int PageNumber { get; set; } = 1; // На якій сторінці підписувати
}