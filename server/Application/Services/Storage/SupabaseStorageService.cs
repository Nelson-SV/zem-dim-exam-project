using Application.Interfaces.Services;   // The IStorageService interface now lives here
using Supabase;

namespace Application.Services.Storage;

public class SupabaseStorageService : IStorageService
{
    // Explicitly specify the type to avoid conflicts with Supabase.Storage.Client
    private readonly Supabase.Client _supabaseClient;
    private const string BUCKET_NAME = "Projects"; 

    public SupabaseStorageService(Supabase.Client supabaseClient)
    {
        _supabaseClient = supabaseClient;
    }

    public async Task<string> UploadProjectThumbnailAsync(Stream fileStream, string fileName, string contentType)
    {
        try
        {
            var extension = Path.GetExtension(fileName);
            var uniqueFileName = $"{Guid.NewGuid()}{extension}";
            var filePath = $"thumbnails/{uniqueFileName}";

            // Read the incoming stream into bytes
            using var ms = new MemoryStream();
            await fileStream.CopyToAsync(ms);
            var bytes = ms.ToArray();

            // IMPORTANT: the signature is Upload(path, bytes, options)
            await _supabaseClient
                .Storage
                .From(BUCKET_NAME)
                .Upload(
                    bytes,          // first parameter - byte array
                    filePath,       // second parameter - path
                    new Supabase.Storage.FileOptions
                    {
                        ContentType = contentType,
                        Upsert = false
                    });

            return GetPublicUrl(filePath);
        }
        catch (Exception ex)
        {
            throw new ApplicationException($"Failed to upload file: {ex.Message}", ex);
        }
    }

    public async Task<bool> DeleteFileAsync(string fileUrl)
    {
        try
        {
            // Extract the object path within the bucket from the public URL
            var uri = new Uri(fileUrl);
            var prefix = $"/storage/v1/object/public/{BUCKET_NAME}/";
            var fullPath = Uri.UnescapeDataString(uri.AbsolutePath);

            if (!fullPath.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
                return false;

            var filePath = fullPath.Substring(prefix.Length); // e.g. "thumbnails/xxx.webp"

            // IMPORTANT: Remove expects IEnumerable<string>
            await _supabaseClient
                .Storage
                .From(BUCKET_NAME)
                .Remove(new List<string> { filePath });

            return true;
        }
        catch
        {
            return false;
        }
    }

    public string GetPublicUrl(string filePath)
        => _supabaseClient.Storage.From(BUCKET_NAME).GetPublicUrl(filePath);
}
