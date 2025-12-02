using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using Application.Interfaces.Services;
using Common.Constants; // The IStorageService interface now lives here
using Application.Interfaces.Services;
using Supabase;

namespace Application.Services.Storage;

public class SupabaseStorageService : IStorageService
{
    // Explicitly specify the type to avoid conflicts with Supabase.Storage.Client
    private readonly Supabase.Client _supabaseClient;

    private const string PROJECTS_BUCKET = "Projects";   // thumbnails
    private const string DOCUMENTS_BUCKET = "Documents"; // pdf/doc, signed pdfs
    
    private static readonly Regex PublicUrlRegex = new("/storage/v1/object/public/(?<bucket>[^/]+)/(?<path>.+)", RegexOptions.Compiled | RegexOptions.IgnoreCase);


    public SupabaseStorageService(Supabase.Client supabaseClient)
    {
        _supabaseClient = supabaseClient;
    }

    public async Task<string> UploadProjectThumbnailAsync(Stream fileStream, string fileName, string contentType, Guid? projectId = null, CancellationToken ct = default)
    {
        try
        {
            var extension = Path.GetExtension(fileName);
            var uniqueFileName = $"{Guid.NewGuid()}{extension}";
            var folder = projectId.HasValue ? $"thumbnails/{projectId.Value}" : "thumbnails";
            var filePath = $"{folder}/{uniqueFileName}";

            // Read the incoming stream into bytes
            using var ms = new MemoryStream();
            await fileStream.CopyToAsync(ms, ct);
            var bytes = ms.ToArray();

            // IMPORTANT: the signature is Upload(path, bytes, options)
            await _supabaseClient
                .Storage
                .From(StorageBuckets.Projects)
                .Upload(
                    bytes,
                    filePath,
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

    /*
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
    */
    
    public async Task<bool> DeleteFileAsync(string fileUrl, CancellationToken ct = default)
    {
        if (!TryParsePublicUrl(fileUrl, out var bucket, out var path))
            return false;

        await _supabaseClient.Storage
            .From(bucket)
            .Remove(new List<string> { path });

        return true;
    }
    
    public string GetPublicUrl(string filePath, string? bucketOverride = null)
    {
        var bucket = bucketOverride ?? StorageBuckets.Projects;
        return _supabaseClient.Storage.From(bucket).GetPublicUrl(filePath);
    }

    /*
    public string GetPublicUrl(string filePath)
        => _supabaseClient.Storage.From(BUCKET_NAME).GetPublicUrl(filePath);
        */

    public async Task<string> UploadThreeDScanAsync(Stream fileStream, string fileName, Guid projectId, Guid? milestoneId, CancellationToken ct = default)
    {
        //_logger.LogInformation("Uploading .glb {FileName} for project {ProjectId}", fileName, projectId);

        var extension = Path.GetExtension(fileName);
        var normalizedExtension = string.IsNullOrWhiteSpace(extension) ? ".glb" : extension.ToLowerInvariant();
        if (normalizedExtension != ".glb")
            throw new ValidationException("Only .glb files are supported.");

        var objectPath = Build3DScanPath(projectId, milestoneId, normalizedExtension);
        await using var buffer = new MemoryStream();
        await fileStream.CopyToAsync(buffer, ct);

        await _supabaseClient.Storage
            .From(StorageBuckets.ThreeDScans)
            .Upload(buffer.ToArray(), objectPath, new Supabase.Storage.FileOptions
            {
                //CacheControl = "3600",
                Upsert = false,
                ContentType = "model/gltf-binary"
            });

        return GetPublicUrl(objectPath, StorageBuckets.ThreeDScans);
    }

    public async Task<string> UploadPhotoAsync(Stream fileStream, string fileName, string contentType, Guid projectId, Guid? milestoneId, CancellationToken ct = default)
    {
        var extension = Path.GetExtension(fileName);
        var normalizedExtension = string.IsNullOrWhiteSpace(extension) ? ".jpg" : extension.ToLowerInvariant();
        var path = BuildPhotoPath(projectId, milestoneId, normalizedExtension);

        await using var buffer = new MemoryStream();
        await fileStream.CopyToAsync(buffer, ct);

        await _supabaseClient.Storage
            .From(StorageBuckets.Photos)
            .Upload(buffer.ToArray(), path, new Supabase.Storage.FileOptions
            {
                ContentType = contentType,
                Upsert = false
            });

        return GetPublicUrl(path, StorageBuckets.Photos);
    }

    public async Task<string> UploadDocumentAsync(Stream fileStream, string fileName, string contentType, Guid projectId, CancellationToken ct = default)
    {
        var extension = Path.GetExtension(fileName);
        var normalizedExtension = string.IsNullOrWhiteSpace(extension) ? ".dat" : extension.ToLowerInvariant();
        var path = $"documents/projects/{projectId}/{Guid.NewGuid()}{normalizedExtension}";

        await using var buffer = new MemoryStream();
        await fileStream.CopyToAsync(buffer, ct);

        await _supabaseClient.Storage
            .From(StorageBuckets.Documents)
            .Upload(buffer.ToArray(), path, new Supabase.Storage.FileOptions
            {
                ContentType = contentType,
                Upsert = false
            });

        return GetPublicUrl(path, StorageBuckets.Documents);
    }
    
    private static string Build3DScanPath(Guid projectId, Guid? milestoneId, string extension)
    {
        var milestoneSegment = milestoneId.HasValue ? $"milestones/{milestoneId.Value}/" : string.Empty;
        return $"{StorageBuckets.ThreeDScanPrefix}/projects/{projectId}/{milestoneSegment}{Guid.NewGuid()}{extension}";
    }

    private static string BuildPhotoPath(Guid projectId, Guid? milestoneId, string extension)
    {
        var milestoneSegment = milestoneId.HasValue ? $"milestones/{milestoneId.Value}/" : string.Empty;
        return $"photos/projects/{projectId}/{milestoneSegment}{Guid.NewGuid()}{extension}";
    }

    private static bool TryParsePublicUrl(string fileUrl, out string bucket, out string path)
    {
        bucket = string.Empty;
        path = string.Empty;

        if (!Uri.TryCreate(fileUrl, UriKind.Absolute, out var uri)) return false;
        var match = PublicUrlRegex.Match(uri.AbsolutePath);
        if (!match.Success) return false;

        bucket = match.Groups["bucket"].Value;
        path = Uri.UnescapeDataString(match.Groups["path"].Value);
        return true;
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

            return GetPublicUrl(filePath, DOCUMENTS_BUCKET);
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

            return GetPublicUrl(filePath, DOCUMENTS_BUCKET);
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
}
