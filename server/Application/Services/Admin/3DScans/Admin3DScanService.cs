using Application.Interfaces.Admin._3DScans;
using Application.Interfaces.Infrastructure.Postgres.Admin._3DScans;
using Application.Interfaces.Infrastructure.Postgres.DatabaseTransactions;
using Application.Interfaces.Services;
using Application.Models;
using Application.Models.Dtos._3DScans;
using Application.Models.Dtos.Common;
using Core.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace Application.Services.Admin._3DScans;

public class Admin3DScanService(IStorageService _storage, IDbUnitOfWork _unitOfWork, IAdmin3DScanRepository _repository, ILogger<Admin3DScanService> _logger) : IAdmin3DScanService
{
    public async Task<AdminThreeDScanDto> UploadAsync(UploadThreeDScanRequestDto.UploadThreeDScanCommand command, Guid uploadedBy, CancellationToken ct)
    {
        await EnsureProjectAsync(command.Request.ProjectId, ct);
        if (command.Request.MilestoneId.HasValue)
            await EnsureMilestoneAsync(command.Request.MilestoneId.Value, command.Request.ProjectId, ct);

        await _unitOfWork.BeginAsync();
        var fileUrl = string.Empty;
        try
        {
            fileUrl = await _storage.UploadThreeDScanAsync(
                command.File.Content,
                command.File.FileName,
                command.Request.ProjectId,
                command.Request.MilestoneId,
                ct);

            var entity = new Threedscan
            {
                Id = Guid.NewGuid(),
                Projectid = command.Request.ProjectId,
                Milestoneid = command.Request.MilestoneId,
                Roomname = command.Request.RoomName.Trim(),
                Filename = Path.GetFileNameWithoutExtension(command.File.FileName),
                Fileurl = fileUrl,
                Filetype = Path.GetExtension(command.File.FileName),
                Roomarea = command.Request.RoomArea,
                Scannedat = command.Request.ScannedAt ?? DateTime.UtcNow,
                Uploadedbyid = uploadedBy,
                Notes = command.Request.Notes,
                Createdat = DateTime.UtcNow
            };

            var saved = await _repository.InsertAsync(entity, ct);
            await _unitOfWork.CommitAsync();
            return AdminThreeDScanDto.FromEntity(saved);
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackAsync();
            if (!string.IsNullOrEmpty(fileUrl))
                await _storage.DeleteFileAsync(fileUrl, ct);
            _logger.LogError(ex, "Failed to upload 3D scan for project {ProjectId}", command.Request.ProjectId);
            throw new ApplicationException(ErrorMessages.GetMessage(ErrorCode.ThreeDScanUploadFailed), ex);
        }
    }

    public async Task<PaginationItemsResponse<AdminThreeDScanDto>> GetAsync(
        Guid? projectId,
        Guid? milestoneId,
        int page,
        int pageSize,
        CancellationToken ct)
    {
        var (entities, total) = await _repository.GetAsync(projectId, milestoneId, page, pageSize, ct);
        var dtos = entities.Select(AdminThreeDScanDto.FromEntity).ToList();

        return new PaginationItemsResponse<AdminThreeDScanDto>
        {
            Items = dtos,
            Page = page,
            PageSize = pageSize,
            TotalItems = total
        };
    }

    public async Task<AdminThreeDScanDto?> GetByIdAsync(Guid scanId, CancellationToken ct)
    {
        var entity = await _repository.GetByIdAsync(scanId, ct);
        return entity is null ? null : AdminThreeDScanDto.FromEntity(entity);
    }

    private async Task EnsureProjectAsync(Guid projectId, CancellationToken ct)
    {
        if (!await _repository.ProjectExistsAsync(projectId, ct))
            throw new ApplicationException(ErrorMessages.GetMessage(ErrorCode.ProjectNotFound));
    }

    private async Task EnsureMilestoneAsync(Guid milestoneId, Guid projectId, CancellationToken ct)
    {
        if (!await _repository.MilestoneBelongsToProjectAsync(milestoneId, projectId, ct))
            throw new ApplicationException(ErrorMessages.GetMessage(ErrorCode.MilestoneDoesNotBelongToProject));
    }


    public async Task DeleteAsync(Guid scanId, Guid performedBy, CancellationToken ct)
    {
        var scan = await _repository.GetByIdAsync(scanId, ct) ?? throw new ApplicationException(ErrorMessages.GetMessage(ErrorCode.ThreeDScanNotFound));
        await _unitOfWork.BeginAsync();
        try
        {
            await _repository.DeleteAsync(scanId, ct);
            await _storage.DeleteFileAsync(scan.Fileurl, ct);
            await _unitOfWork.CommitAsync();
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackAsync();
            _logger.LogError(ex, "Failed to delete 3D scan {ScanId} (requested by {AdminId})", scanId, performedBy);
            throw new ApplicationException(ErrorMessages.GetMessage(ErrorCode.ThreeDScanDeleteFailed), ex);
        }
    }

    public async Task<AdminThreeDScanDto> UpdateAsync(Guid scanId, UpdateThreeDScanRequestDto dto, Guid performedBy, CancellationToken ct)
    {
        await _unitOfWork.BeginAsync();
        try
        {
            var scan = await _repository.GetByIdAsync(scanId, ct)
                       ?? throw new ApplicationException(ErrorMessages.GetMessage(ErrorCode.ThreeDScanNotFound));

            if (dto.MilestoneId.HasValue)
                await EnsureMilestoneAsync(dto.MilestoneId.Value, scan.Projectid, ct);

            if (!string.IsNullOrWhiteSpace(dto.RoomName))
                scan.Roomname = dto.RoomName.Trim();

            scan.Milestoneid = dto.MilestoneId ?? scan.Milestoneid;
            scan.Roomarea = dto.RoomArea ?? scan.Roomarea;
            scan.Scannedat = dto.ScannedAt ?? scan.Scannedat;
            scan.Notes = dto.Notes ?? scan.Notes;

            var updated = await _repository.UpdateAsync(scan, ct);
            await _unitOfWork.CommitAsync();

            _logger.LogInformation("3D scan {ScanId} updated by {UserId}", scanId, performedBy);
            return AdminThreeDScanDto.FromEntity(updated);
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackAsync();
            _logger.LogError(ex, "Failed to update 3D scan {ScanId}", scanId);
            throw new ApplicationException(ErrorMessages.GetMessage(ErrorCode.ThreeDScanUpdateFailed), ex);
        }
    }

}