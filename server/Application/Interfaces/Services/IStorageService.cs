namespace Application.Interfaces.Services;

public interface IStorageService
{
    Task<string> UploadProjectThumbnailAsync(Stream fileStream, string fileName, string contentType);
    Task<bool> DeleteFileAsync(string fileUrl);
    string GetPublicUrl(string filePath);
    Task<string> UploadSignedPdfAsync(byte[] pdfBytes, string fileName);
    Task<byte[]> DownloadFileAsync(string url);
    
    // 👇 Додано для проектних документів (PDF тощо)
    Task<string> UploadProjectDocumentAsync(Stream fileStream, string fileName, string contentType);
}