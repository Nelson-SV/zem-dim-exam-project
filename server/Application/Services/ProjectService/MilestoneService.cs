using Application.Interfaces.Infrastructure.Postgres;
using Application.Interfaces.Infrastructure.Postgres.DatabaseTransactions;
using Application.Interfaces.Services;
using Application.Models.Dtos.Common;
using Application.Models.Dtos.Project;
using Core.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace Application.Services.ProjectService;

public class MilestoneService(
    IMilestoneRepository repository,
    IProjectRepository projectRepository,
    IDbUnitOfWork unitOfWork,
    ILogger<MilestoneService> logger) : IMilestoneService
{
    public async Task<PaginationItemsResponse<MilestoneDto>> GetByProjectAsync(Guid projectId, int page, int pageSize, CancellationToken ct = default)
    {
        await EnsureProjectExists(projectId, ct);

        var (items, total) = await repository.GetByProjectAsync(projectId, page, pageSize, ct);
        return new PaginationItemsResponse<MilestoneDto>
        {
            Items = MilestoneDto.FromEntities(items),
            Page = page,
            PageSize = pageSize,
            TotalItems = total
        };
    }

    public async Task<MilestoneDto> CreateAsync(Guid projectId, CreateMilestoneDto dto, Guid performedBy, CancellationToken ct = default)
    {
        await unitOfWork.BeginAsync();
        try
        {
            await EnsureProjectExists(projectId, ct);

            var orderIndex = dto.OrderIndex ?? await repository.GetNextOrderIndexAsync(projectId, ct);

            var entity = new Milestone
            {
                Id = Guid.NewGuid(),
                Projectid = projectId,
                Title = dto.Title.Trim(),
                Description = dto.Description,
                Orderindex = orderIndex,
                Status = string.IsNullOrWhiteSpace(dto.Status) ? "Pending" : dto.Status,
                Progresspercentage = dto.ProgressPercentage ?? 0,
                Plannedstartdate = dto.PlannedStartDate,
                Plannedenddate = dto.PlannedEndDate,
                Actualstartdate = dto.ActualStartDate,
                Actualenddate = dto.ActualEndDate,
                Notes = dto.Notes,
                Createdat = DateTime.UtcNow,
                Updatedat = DateTime.UtcNow
            };

            var saved = await repository.InsertAsync(entity, ct);
            await unitOfWork.CommitAsync();
            logger.LogInformation("Milestone {MilestoneId} created for project {ProjectId} by {UserId}", saved.Id, projectId, performedBy);
            return MilestoneDto.FromEntity(saved);
        }
        catch (Exception ex)
        {
            await unitOfWork.RollbackAsync();
            logger.LogError(ex, "Failed to create milestone for project {ProjectId}", projectId);
            throw;
        }
    }

    public async Task<MilestoneDto> UpdateAsync(Guid projectId, Guid milestoneId, UpdateMilestoneDto dto, Guid performedBy, CancellationToken ct = default)
    {
        await unitOfWork.BeginAsync();
        try
        {
            var milestone = await GetAndValidate(projectId, milestoneId, ct);

            milestone.Title = dto.Title.Trim();
            milestone.Description = dto.Description;
            milestone.Status = dto.Status;
            milestone.Progresspercentage = dto.ProgressPercentage;
            milestone.Plannedstartdate = dto.PlannedStartDate;
            milestone.Plannedenddate = dto.PlannedEndDate;
            milestone.Actualstartdate = dto.ActualStartDate;
            milestone.Actualenddate = dto.ActualEndDate;
            milestone.Notes = dto.Notes;
            milestone.Orderindex = dto.OrderIndex;
            milestone.Updatedat = DateTime.UtcNow;

            var updated = await repository.UpdateAsync(milestone, ct);
            await unitOfWork.CommitAsync();
            logger.LogInformation("Milestone {MilestoneId} updated by {UserId}", milestoneId, performedBy);
            return MilestoneDto.FromEntity(updated);
        }
        catch (Exception ex)
        {
            await unitOfWork.RollbackAsync();
            logger.LogError(ex, "Failed to update milestone {MilestoneId}", milestoneId);
            throw;
        }
    }

    public async Task<MilestoneDto> PatchAsync(Guid projectId, Guid milestoneId, PatchMilestoneDto dto, Guid performedBy, CancellationToken ct = default)
    {
        await unitOfWork.BeginAsync();
        try
        {
            var milestone = await GetAndValidate(projectId, milestoneId, ct);

            if (!string.IsNullOrWhiteSpace(dto.Title)) milestone.Title = dto.Title.Trim();
            if (dto.Description != null) milestone.Description = dto.Description;
            if (dto.Status != null) milestone.Status = dto.Status;
            if (dto.ProgressPercentage.HasValue) milestone.Progresspercentage = dto.ProgressPercentage;
            if (dto.PlannedStartDate.HasValue) milestone.Plannedstartdate = dto.PlannedStartDate;
            if (dto.PlannedEndDate.HasValue) milestone.Plannedenddate = dto.PlannedEndDate;
            if (dto.ActualStartDate.HasValue) milestone.Actualstartdate = dto.ActualStartDate;
            if (dto.ActualEndDate.HasValue) milestone.Actualenddate = dto.ActualEndDate;
            if (dto.Notes != null) milestone.Notes = dto.Notes;
            if (dto.OrderIndex.HasValue) milestone.Orderindex = dto.OrderIndex.Value;
            milestone.Updatedat = DateTime.UtcNow;

            var updated = await repository.UpdateAsync(milestone, ct);
            await unitOfWork.CommitAsync();
            logger.LogInformation("Milestone {MilestoneId} patched by {UserId}", milestoneId, performedBy);
            return MilestoneDto.FromEntity(updated);
        }
        catch (Exception ex)
        {
            await unitOfWork.RollbackAsync();
            logger.LogError(ex, "Failed to patch milestone {MilestoneId}", milestoneId);
            throw;
        }
    }

    public async Task DeleteAsync(Guid projectId, Guid milestoneId, Guid performedBy, CancellationToken ct = default)
    {
        await unitOfWork.BeginAsync();
        try
        {
            await GetAndValidate(projectId, milestoneId, ct);
            await repository.SoftDeleteAsync(milestoneId, ct);
            await unitOfWork.CommitAsync();
            logger.LogInformation("Milestone {MilestoneId} deleted by {UserId}", milestoneId, performedBy);
        }
        catch (Exception ex)
        {
            await unitOfWork.RollbackAsync();
            logger.LogError(ex, "Failed to delete milestone {MilestoneId}", milestoneId);
            throw;
        }
    }

    private async Task EnsureProjectExists(Guid projectId, CancellationToken ct)
    {
        var project = await projectRepository.GetByIdAsync(projectId);
        if (project == null || project.Isdeleted)
            throw new KeyNotFoundException("Project not found");
    }

    private async Task<Milestone> GetAndValidate(Guid projectId, Guid milestoneId, CancellationToken ct)
    {
        var milestone = await repository.GetByIdAsync(milestoneId, ct)
                        ?? throw new KeyNotFoundException("Milestone not found");

        if (milestone.Projectid != projectId)
            throw new UnauthorizedAccessException("Milestone does not belong to this project");

        return milestone;
    }
}
