using Application.Interfaces.Infrastructure.Postgres;
using Application.Interfaces.Infrastructure.Postgres.DatabaseTransactions;
using Application.Interfaces.Services;
using Application.Models.Dtos.Common;
using Application.Models.Dtos.Project;
using Core.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace Application.Services.ProjectService;

public class PhotoService(
    IPhotoRepository repository,
    IMilestoneRepository milestoneRepository,
    IProjectRepository projectRepository,
    IStorageService storage,
    IDbUnitOfWork unitOfWork,
    ILogger<PhotoService> logger) : IPhotoService
{
    private const long MaxPhotoSizeBytes = 10 * 1024 * 1024; // 10MB
    private static readonly string[] AllowedPhotoMimeTypes = { "image/jpeg", "image/png", "image/webp", "image/gif" };

    public async Task<PaginationItemsResponse<PhotoDto>> GetAsync(Guid projectId, Guid? milestoneId, int page, int pageSize, CancellationToken ct = default)
    {
        await EnsureProjectExists(projectId, ct);
        if (milestoneId.HasValue)
            await EnsureMilestone(projectId, milestoneId.Value, ct);

        var (items, total) = await repository.GetAsync(projectId, milestoneId, page, pageSize, ct);
        return new PaginationItemsResponse<PhotoDto>
        {
            Items = PhotoDto.FromEntities(items),
            Page = page,
            PageSize = pageSize,
            TotalItems = total
        };
    }

    public async Task<PhotoDto> CreateAsync(Guid projectId, CreatePhotoDto dto, Stream fileStream, string fileName, string contentType, long fileSize, Guid uploadedBy, CancellationToken ct = default)
    {
        if (fileSize <= 0 || fileSize > MaxPhotoSizeBytes)
            throw new ApplicationException("Photo file size exceeds allowed limit (10 MB).");

        if (!AllowedPhotoMimeTypes.Contains(contentType, StringComparer.OrdinalIgnoreCase))
            throw new ApplicationException("Unsupported photo content type.");

        await unitOfWork.BeginAsync();
        string fileUrl = string.Empty;
        try
        {
            await EnsureProjectExists(projectId, ct);
            if (dto.MilestoneId.HasValue)
                await EnsureMilestone(projectId, dto.MilestoneId.Value, ct);

            fileUrl = await storage.UploadPhotoAsync(fileStream, fileName, contentType, projectId, dto.MilestoneId, ct);

            var entity = new Photo
            {
                Id = Guid.NewGuid(),
                Projectid = projectId,
                Milestoneid = dto.MilestoneId,
                Filename = fileName,
                Fileurl = fileUrl,
                Filesize = fileSize,
                Mimetype = contentType,
                Caption = dto.Caption,
                Takenat = dto.TakenAt,
                Uploadedbyid = uploadedBy,
                Createdat = DateTime.UtcNow
            };

            var saved = await repository.InsertAsync(entity, ct);
            await unitOfWork.CommitAsync();
            logger.LogInformation("Photo {PhotoId} created for project {ProjectId} by {UserId}", saved.Id, projectId, uploadedBy);
            return PhotoDto.FromEntity(saved);
        }
        catch (Exception ex)
        {
            await unitOfWork.RollbackAsync();
            if (!string.IsNullOrEmpty(fileUrl))
                await storage.DeleteFileAsync(fileUrl, ct);
            logger.LogError(ex, "Failed to create photo for project {ProjectId}", projectId);
            throw;
        }
    }

    public async Task<PhotoDto> UpdateAsync(Guid projectId, Guid photoId, UpdatePhotoDto dto, Guid performedBy, CancellationToken ct = default)
    {
        await unitOfWork.BeginAsync();
        try
        {
            var photo = await repository.GetByIdAsync(photoId, ct) ?? throw new KeyNotFoundException("Photo not found");
            if (photo.Projectid != projectId)
                throw new UnauthorizedAccessException("Photo does not belong to this project");

            if (dto.MilestoneId.HasValue)
                await EnsureMilestone(projectId, dto.MilestoneId.Value, ct);

            photo.Milestoneid = dto.MilestoneId ?? photo.Milestoneid;
            photo.Caption = dto.Caption ?? photo.Caption;
            photo.Takenat = dto.TakenAt ?? photo.Takenat;
            photo.Thumbnailurl = dto.ThumbnailUrl ?? photo.Thumbnailurl;

            var updated = await repository.UpdateAsync(photo, ct);
            await unitOfWork.CommitAsync();
            logger.LogInformation("Photo {PhotoId} updated by {UserId}", photoId, performedBy);
            return PhotoDto.FromEntity(updated);
        }
        catch (Exception ex)
        {
            await unitOfWork.RollbackAsync();
            logger.LogError(ex, "Failed to update photo {PhotoId}", photoId);
            throw;
        }
    }

    public async Task DeleteAsync(Guid projectId, Guid photoId, Guid performedBy, CancellationToken ct = default)
    {
        await unitOfWork.BeginAsync();
        try
        {
            var photo = await repository.GetByIdAsync(photoId, ct) ?? throw new KeyNotFoundException("Photo not found");
            if (photo.Projectid != projectId)
                throw new UnauthorizedAccessException("Photo does not belong to this project");

            await repository.DeleteAsync(photoId, ct);
            if (!string.IsNullOrEmpty(photo.Fileurl))
                await storage.DeleteFileAsync(photo.Fileurl, ct);

            await unitOfWork.CommitAsync();
            logger.LogInformation("Photo {PhotoId} deleted by {UserId}", photoId, performedBy);
        }
        catch (Exception ex)
        {
            await unitOfWork.RollbackAsync();
            logger.LogError(ex, "Failed to delete photo {PhotoId}", photoId);
            throw;
        }
    }

    private async Task EnsureProjectExists(Guid projectId, CancellationToken ct)
    {
        var project = await projectRepository.GetByIdAsync(projectId);
        if (project == null || project.Isdeleted)
            throw new KeyNotFoundException("Project not found");
    }

    private async Task EnsureMilestone(Guid projectId, Guid milestoneId, CancellationToken ct)
    {
        if (!await milestoneRepository.BelongsToProjectAsync(milestoneId, projectId, ct))
            throw new ApplicationException("Milestone does not belong to the project.");
    }
}
