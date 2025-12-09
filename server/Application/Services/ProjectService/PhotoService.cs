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

    public async Task<PaginationItemsResponse<PhotoDto>> GetAsync(Guid projectId, Guid? milestoneId, int page, int pageSize)
    {
        await EnsureProjectExists(projectId);
        if (milestoneId.HasValue)
            await EnsureMilestone(projectId, milestoneId.Value);

        var (items, total) = await repository.GetAsync(projectId, milestoneId, page, pageSize);
        return new PaginationItemsResponse<PhotoDto>
        {
            Items = PhotoDto.FromEntities(items),
            Page = page,
            PageSize = pageSize,
            TotalItems = total
        };
    }

    public async Task<PaginationItemsResponse<PhotoDto>> GetForClientAsync(
        Guid requesterId,
        string requesterRole,
        Guid projectId,
        Guid? milestoneId,
        int page,
        int pageSize)
    {
        var project = await projectRepository.GetByIdAsync(projectId);
        if (project == null || project.Isdeleted)
            throw new KeyNotFoundException("Project not found");

        var isAdmin = requesterRole.Equals("Admin", StringComparison.OrdinalIgnoreCase);
        if (!isAdmin && project.Clientid != requesterId)
            throw new UnauthorizedAccessException("You are not allowed to view this project's photos");

        if (milestoneId.HasValue)
            await EnsureMilestone(projectId, milestoneId.Value);

        var (items, total) = await repository.GetAsync(projectId, milestoneId, page, pageSize);
        return new PaginationItemsResponse<PhotoDto>
        {
            Items = PhotoDto.FromEntities(items),
            Page = page,
            PageSize = pageSize,
            TotalItems = total
        };
    }

    public async Task<PhotoDto> CreateAsync(Guid projectId, CreatePhotoDto dto, Stream fileStream, string fileName, string contentType, long fileSize, Guid uploadedBy)
    {
        if (fileSize <= 0 || fileSize > MaxPhotoSizeBytes)
            throw new ApplicationException("Photo file size exceeds allowed limit (10 MB).");

        if (!AllowedPhotoMimeTypes.Contains(contentType, StringComparer.OrdinalIgnoreCase))
            throw new ApplicationException("Unsupported photo content type.");

        await unitOfWork.BeginAsync();
        string fileUrl = string.Empty;
        try
        {
            await EnsureProjectExists(projectId);
            if (dto.MilestoneId.HasValue)
                await EnsureMilestone(projectId, dto.MilestoneId.Value);

            fileUrl = await storage.UploadPhotoAsync(fileStream, fileName, contentType, projectId, dto.MilestoneId);

            var entity = new Photo
            {
                Id = Guid.NewGuid(),
                Projectid = projectId,
                Milestoneid = dto.MilestoneId,
                Filename = fileName,
                Fileurl = fileUrl,
                Filetype = contentType,
                Caption = dto.Caption,
                Takenat = dto.TakenAt,
                Uploadedbyid = uploadedBy,
                Createdat = DateTime.UtcNow
            };

            var saved = await repository.InsertAsync(entity);
            await unitOfWork.CommitAsync();
            logger.LogInformation("Photo {PhotoId} created for project {ProjectId} by {UserId}", saved.Id, projectId, uploadedBy);
            return PhotoDto.FromEntity(saved);
        }
        catch (Exception ex)
        {
            await unitOfWork.RollbackAsync();
            if (!string.IsNullOrEmpty(fileUrl))
                await storage.DeleteFileAsync(fileUrl);
            logger.LogError(ex, "Failed to create photo for project {ProjectId}", projectId);
            throw;
        }
    }

    public async Task<PhotoDto> UpdateAsync(Guid projectId, Guid photoId, UpdatePhotoDto dto, Guid performedBy)
    {
        await unitOfWork.BeginAsync();
        try
        {
            var photo = await repository.GetByIdAsync(photoId) ?? throw new KeyNotFoundException("Photo not found");
            if (photo.Projectid != projectId)
                throw new UnauthorizedAccessException("Photo does not belong to this project");

            if (dto.MilestoneId.HasValue)
                await EnsureMilestone(projectId, dto.MilestoneId.Value);

            photo.Milestoneid = dto.MilestoneId ?? photo.Milestoneid;
            photo.Caption = dto.Caption ?? photo.Caption;
            photo.Takenat = dto.TakenAt ?? photo.Takenat;

            var updated = await repository.UpdateAsync(photo);
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

    public async Task DeleteAsync(Guid projectId, Guid photoId, Guid performedBy)
    {
        await unitOfWork.BeginAsync();
        try
        {
            var photo = await repository.GetByIdAsync(photoId) ?? throw new KeyNotFoundException("Photo not found");
            if (photo.Projectid != projectId)
                throw new UnauthorizedAccessException("Photo does not belong to this project");

            await repository.SoftDeleteAsync(photoId);
            if (!string.IsNullOrEmpty(photo.Fileurl))
                await storage.DeleteFileAsync(photo.Fileurl);

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

    private async Task EnsureProjectExists(Guid projectId)
    {
        var project = await projectRepository.GetByIdAsync(projectId);
        if (project == null || project.Isdeleted)
            throw new KeyNotFoundException("Project not found");
    }

    private async Task EnsureMilestone(Guid projectId, Guid milestoneId)
    {
        if (!await milestoneRepository.BelongsToProjectAsync(milestoneId, projectId))
            throw new ApplicationException("Milestone does not belong to the project.");
    }
}
