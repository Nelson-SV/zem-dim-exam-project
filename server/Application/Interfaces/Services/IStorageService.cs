namespace Application.Interfaces.Services;

public interface IStorageService
{
    Task<string> UploadProjectThumbnailAsync(Stream fileStream, string fileName, string contentType);
    Task<string> UploadThreeDScanAsync(Stream fileStream, string fileName, Guid projectId, Guid? milestoneId, CancellationToken ct = default);
    Task<bool> DeleteFileAsync(string fileUrl, CancellationToken ct = default);
    string GetPublicUrl(string filePath, string? bucketOverride = null);

}