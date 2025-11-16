namespace Application.Interfaces.Services;

public interface IStorageService
{
    Task<string> UploadProjectThumbnailAsync(Stream fileStream, string fileName, string contentType);
    Task<bool> DeleteFileAsync(string fileUrl);
    string GetPublicUrl(string filePath);
}