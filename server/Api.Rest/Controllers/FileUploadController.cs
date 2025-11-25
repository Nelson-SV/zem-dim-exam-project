using Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Rest.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FileUploadController : ControllerBase
{
    private readonly IStorageService _storageService;
    private readonly ILogger<FileUploadController> _logger;
    
    private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
    private const long MaxFileSize = 5 * 1024 * 1024; // 5 MB

    public FileUploadController(IStorageService storageService, ILogger<FileUploadController> logger)
    {
        _storageService = storageService;
        _logger = logger;
    }

    /// <summary>
    /// Upload project thumbnail image
    /// IMPORTANT: In Postman, the form-data key MUST be exactly "file" (lowercase)
    /// </summary>
    [HttpPost("project-thumbnail")]
    [Authorize]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<FileUploadResponseDto>> UploadProjectThumbnail([FromForm(Name = "file")] IFormFile file, [FromForm] Guid? projectId, CancellationToken ct = default)
    {
        try
        {
            // Log all form data to debug
            _logger.LogInformation("=== FILE UPLOAD DEBUG ===");
            _logger.LogInformation("Content-Type: {ContentType}", Request.ContentType);
            _logger.LogInformation("Has Form: {HasForm}", Request.HasFormContentType);
            
            if (Request.HasFormContentType && Request.Form?.Files != null)
            {
                _logger.LogInformation("Total files in request: {Count}", Request.Form.Files.Count);
                foreach (var formFile in Request.Form.Files)
                {
                    _logger.LogInformation("Found file with key: '{Key}', name: '{Name}', size: {Size}", 
                        formFile.Name, formFile.FileName, formFile.Length);
                }
            }

            // Validate file
            if (file == null || file.Length == 0)
            {
                _logger.LogWarning("File validation failed: file is null or empty");
                return BadRequest(new { 
                    error = "No file provided or file is empty",
                    hint = "Make sure the form-data key in Postman is exactly 'file' (lowercase)"
                });
            }

            _logger.LogInformation("File received: {FileName}, Size: {Size} bytes", file.FileName, file.Length);

            // Validate file size
            if (file.Length > MaxFileSize)
            {
                _logger.LogWarning("File too large: {Size} bytes (max: {MaxSize})", file.Length, MaxFileSize);
                return BadRequest(new { error = $"File size exceeds {MaxFileSize / 1024 / 1024} MB limit" });
            }

            // Validate extension
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (string.IsNullOrEmpty(extension) || !AllowedExtensions.Contains(extension))
            {
                _logger.LogWarning("Invalid file extension: {Extension}", extension);
                return BadRequest(new { 
                    error = "Invalid file type", 
                    allowedTypes = string.Join(", ", AllowedExtensions) 
                });
            }

            // Validate content type
            if (!file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning("Invalid content type: {ContentType}", file.ContentType);
                return BadRequest(new { 
                    error = "File must be an image",
                    receivedContentType = file.ContentType
                });
            }

            // Upload file
            _logger.LogInformation("Starting file upload to storage...");
            await using var stream = file.OpenReadStream();
            var fileUrl = await _storageService.UploadProjectThumbnailAsync(
                stream, 
                file.FileName, 
                file.ContentType,
                projectId,
                ct
            );

            _logger.LogInformation("✅ File uploaded successfully: {FileUrl}", fileUrl);

            return Ok(new FileUploadResponseDto
            {
                Url = fileUrl,
                FileName = file.FileName,
                ContentType = file.ContentType,
                Size = file.Length
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Error uploading file: {Message}", ex.Message);
            return StatusCode(500, new { error = $"Failed to upload file: {ex.Message}" });
        }
    }

    /// <summary>
    /// Alternative endpoint that accepts any form key
    /// Use this if the main endpoint doesn't work
    /// </summary>
    [HttpPost("project-thumbnail-alt")]
    [RequestSizeLimit(MaxFileSize)]
    public async Task<ActionResult<FileUploadResponseDto>> UploadProjectThumbnailAlternative([FromForm] Guid? projectId, CancellationToken ct = default)
    {
        try
        {
            _logger.LogInformation("=== ALTERNATIVE UPLOAD ENDPOINT ===");
            
            if (!Request.HasFormContentType)
            {
                _logger.LogWarning("Request doesn't have form content type");
                return BadRequest(new { error = "Request must be multipart/form-data" });
            }

            var files = Request.Form.Files;
            _logger.LogInformation("Files count: {Count}", files.Count);

            if (files.Count == 0)
            {
                _logger.LogWarning("No files in request");
                return BadRequest(new { error = "No file provided" });
            }

            // Take the first file regardless of key name
            var file = files[0];
            _logger.LogInformation("Using file from key: '{Key}', name: '{Name}'", file.Name, file.FileName);

            if (file.Length == 0)
            {
                return BadRequest(new { error = "File is empty" });
            }

            if (file.Length > MaxFileSize)
            {
                return BadRequest(new { error = $"File size exceeds {MaxFileSize / 1024 / 1024} MB limit" });
            }

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(extension))
            {
                return BadRequest(new { 
                    error = "Invalid file type", 
                    allowedTypes = string.Join(", ", AllowedExtensions) 
                });
            }

            if (!file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { error = "File must be an image" });
            }

            await using var stream = file.OpenReadStream();
            var fileUrl = await _storageService.UploadProjectThumbnailAsync(
                stream, 
                file.FileName, 
                file.ContentType,
                projectId,
                ct
            );

            _logger.LogInformation("✅ File uploaded successfully: {FileUrl}", fileUrl);

            return Ok(new FileUploadResponseDto
            {
                Url = fileUrl,
                FileName = file.FileName,
                ContentType = file.ContentType,
                Size = file.Length
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Error uploading file");
            return StatusCode(500, new { error = $"Failed to upload file: {ex.Message}" });
        }
    }

    /// <summary>
    /// Delete file from storage
    /// </summary>
    [HttpDelete]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<FileDeleteResponseDto>> DeleteFile([FromQuery] string fileUrl)
    {
        try
        {
            if (string.IsNullOrEmpty(fileUrl))
                return BadRequest(new { error = "File URL is required" });

            var result = await _storageService.DeleteFileAsync(fileUrl);
            
            if (!result)
                return NotFound(new { error = "File not found" });

            return Ok(new FileDeleteResponseDto { Message = "File deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file");
            return StatusCode(500, new { error = $"Failed to delete file: {ex.Message}" });
        }
    }
}

// DTOs
public class FileUploadResponseDto
{
    public string Url { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long Size { get; set; }
}

public class FileDeleteResponseDto
{
    public string Message { get; set; } = string.Empty;
}
