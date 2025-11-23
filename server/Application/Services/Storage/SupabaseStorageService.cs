using Application.Interfaces.Services;
using Supabase;

namespace Application.Services.Storage;

public class SupabaseStorageService : IStorageService
{
    private readonly Supabase.Client _supabaseClient;

    private const string PROJECTS_BUCKET = "Projects";   // thumbnails
    private const string DOCUMENTS_BUCKET = "Documents"; // pdf/doc, signed pdfs

    public SupabaseStorageService(Supabase.Client supabaseClient)
    {
        _supabaseClient = supabaseClient;
    }

    // ---------- Thumbnails ----------

    public async Task<string> UploadProjectThumbnailAsync(Stream fileStream, string fileName, string contentType)
    {
        try
        {
            var extension = Path.GetExtension(fileName);
            var uniqueFileName = $"{Guid.NewGuid()}{extension}";
            var filePath = $"thumbnails/{uniqueFileName}";

            using var ms = new MemoryStream();
            await fileStream.CopyToAsync(ms);
            var bytes = ms.ToArray();

            await _supabaseClient
                .Storage
                .From(PROJECTS_BUCKET)
                .Upload(
                    bytes,
                    filePath,
                    new Supabase.Storage.FileOptions
                    {
                        ContentType = contentType,
                        Upsert = false
                    });

            return GetPublicUrl(PROJECTS_BUCKET, filePath);
        }
        catch (Exception ex)
        {
            throw new ApplicationException($"Failed to upload thumbnail: {ex.Message}", ex);
        }
    }

    // ---------- Project documents (PDF, etc.) ----------

    public async Task<string> UploadProjectDocumentAsync(Stream fileStream, string fileName, string contentType)
    {
        try
        {
            var extension = Path.GetExtension(fileName);
            var uniqueFileName = $"{Guid.NewGuid()}{extension}";
            var filePath = $"project-documents/{uniqueFileName}";

            using var ms = new MemoryStream();
            await fileStream.CopyToAsync(ms);
            var bytes = ms.ToArray();

            await _supabaseClient
                .Storage
                .From(DOCUMENTS_BUCKET)
                .Upload(
                    bytes,
                    filePath,
                    new Supabase.Storage.FileOptions
                    {
                        ContentType = contentType,
                        Upsert = false
                    });

            return GetPublicUrl(DOCUMENTS_BUCKET, filePath);
        }
        catch (Exception ex)
        {
            throw new ApplicationException($"Failed to upload project document: {ex.Message}", ex);
        }
    }

    // ---------- Signed PDF ----------

    public async Task<string> UploadSignedPdfAsync(byte[] pdfBytes, string fileName)
    {
        try
        {
            var filePath = $"signed-documents/{fileName}";

            await _supabaseClient
                .Storage
                .From(DOCUMENTS_BUCKET)
                .Upload(
                    pdfBytes,
                    filePath,
                    new Supabase.Storage.FileOptions
                    {
                        ContentType = "application/pdf",
                        Upsert = false
                    });

            return GetPublicUrl(DOCUMENTS_BUCKET, filePath);
        }
        catch (Exception ex)
        {
            throw new ApplicationException($"Failed to upload signed PDF: {ex.Message}", ex);
        }
    }

    // ---------- Download ----------

    public async Task<byte[]> DownloadFileAsync(string url)
    {
        try
        {
            using var httpClient = new HttpClient();
            return await httpClient.GetByteArrayAsync(url);
        }
        catch (Exception ex)
        {
            throw new ApplicationException($"Failed to download file: {ex.Message}", ex);
        }
    }

    // ---------- Delete (both buckets) ----------

    public async Task<bool> DeleteFileAsync(string fileUrl)
    {
        try
        {
            var uri = new Uri(fileUrl);
            var fullPath = Uri.UnescapeDataString(uri.AbsolutePath);

            string bucketName;
            string prefix;

            if (fullPath.Contains($"/storage/v1/object/public/{PROJECTS_BUCKET}/"))
            {
                bucketName = PROJECTS_BUCKET;
                prefix = $"/storage/v1/object/public/{PROJECTS_BUCKET}/";
            }
            else if (fullPath.Contains($"/storage/v1/object/public/{DOCUMENTS_BUCKET}/"))
            {
                bucketName = DOCUMENTS_BUCKET;
                prefix = $"/storage/v1/object/public/{DOCUMENTS_BUCKET}/";
            }
            else
            {
                return false;
            }

            if (!fullPath.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
                return false;

            var filePath = fullPath.Substring(prefix.Length);

            await _supabaseClient
                .Storage
                .From(bucketName)
                .Remove(new List<string> { filePath });

            return true;
        }
        catch
        {
            return false;
        }
    }

    // ---------- Public URLs ----------

    public string GetPublicUrl(string filePath)
        => GetPublicUrl(PROJECTS_BUCKET, filePath);

    private string GetPublicUrl(string bucketName, string filePath)
        => _supabaseClient.Storage.From(bucketName).GetPublicUrl(filePath);
}
