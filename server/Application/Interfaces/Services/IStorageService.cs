namespace Application.Interfaces.Services;

public interface IStorageService
{
    Task<string> UploadProjectThumbnailAsync(Stream fileStream, string fileName, string contentType);
    Task<string> UploadThreeDScanAsync(Stream fileStream, string fileName, Guid projectId, Guid? milestoneId, CancellationToken ct = default);
    Task<string> UploadPhotoAsync(Stream fileStream, string fileName, string contentType, Guid projectId, Guid? milestoneId, CancellationToken ct = default);
    Task<string> UploadDocumentAsync(Stream fileStream, string fileName, string contentType, Guid projectId, CancellationToken ct = default);
    Task<bool> DeleteFileAsync(string fileUrl, CancellationToken ct = default);
    string GetPublicUrl(string filePath, string? bucketOverride = null);

}
