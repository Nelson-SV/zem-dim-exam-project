namespace Application.Interfaces.Services;

public interface IStorageService
{
    Task<string> UploadProjectThumbnailAsync(Stream fileStream, string fileName, string contentType, Guid? projectId = null);
    Task<string> UploadThreeDScanAsync(Stream fileStream, string fileName, Guid projectId, Guid? milestoneId);
    Task<string> UploadPhotoAsync(Stream fileStream, string fileName, string contentType, Guid projectId, Guid? milestoneId);
    Task<string> UploadDocumentAsync(Stream fileStream, string fileName, string contentType, Guid projectId);
    Task<bool> DeleteFileAsync(string fileUrl);
    string GetPublicUrl(string filePath, string? bucketOverride = null);
    Task<string> UploadSignedPdfAsync(byte[] pdfBytes, string fileName);
    Task<byte[]> DownloadFileAsync(string url);
    
    // 👇 Added for project documents (PDF files, etc.)
    Task<string> UploadProjectDocumentAsync(Stream fileStream, string fileName, string contentType);
}
