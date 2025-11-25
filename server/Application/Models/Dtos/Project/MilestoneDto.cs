using System.ComponentModel.DataAnnotations;
using Core.Domain.Entities;

namespace Application.Models.Dtos.Project;

public class MilestoneDto
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string Title { get; set; } = null!;
    public int OrderIndex { get; set; }
    public string Status { get; set; } = null!;
    public int ProgressPercentage { get; set; }
    public DateOnly? PlannedStartDate { get; set; }
    public DateOnly? PlannedEndDate { get; set; }
    public DateOnly? ActualStartDate { get; set; }
    public DateOnly? ActualEndDate { get; set; }
    public string? Notes { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public static MilestoneDto FromEntity(Milestone milestone) => new()
    {
        Id = milestone.Id,
        ProjectId = milestone.Projectid,
        Title = milestone.Title,
        OrderIndex = milestone.Orderindex,
        Status = milestone.Status,
        ProgressPercentage = milestone.Progresspercentage,
        PlannedStartDate = milestone.Plannedstartdate,
        PlannedEndDate = milestone.Plannedenddate,
        ActualStartDate = milestone.Actualstartdate,
        ActualEndDate = milestone.Actualenddate,
        Notes = milestone.Notes,
        CreatedAt = milestone.Createdat,
        UpdatedAt = milestone.Updatedat
    };

    public static IReadOnlyCollection<MilestoneDto> FromEntities(IEnumerable<Milestone> milestones) =>
        milestones.Select(FromEntity).ToList();
}

public class CreateMilestoneDto
{
    [Required, MaxLength(200)]
    public string Title { get; set; } = null!;
    [Range(0, 100)]
    public int ProgressPercentage { get; set; } = 0;
    [MaxLength(50)]
    public string Status { get; set; } = "Pending";
    public DateOnly PlannedStartDate { get; set; }
    public DateOnly PlannedEndDate { get; set; }
    public DateOnly? ActualStartDate { get; set; }
    public DateOnly? ActualEndDate { get; set; }
    public string? Notes { get; set; }
    public int OrderIndex { get; set; }
}

public class UpdateMilestoneDto
{
    [Required, MaxLength(200)]
    public string Title { get; set; } = null!;
    [Range(0, 100)]
    public int ProgressPercentage { get; set; }
    [MaxLength(50)]
    public string Status { get; set; } = "Pending";
    public DateOnly PlannedStartDate { get; set; }
    public DateOnly PlannedEndDate { get; set; }
    public DateOnly? ActualStartDate { get; set; }
    public DateOnly? ActualEndDate { get; set; }
    public string? Notes { get; set; }
    public int OrderIndex { get; set; }
}

public class PatchMilestoneDto
{
    [MaxLength(200)] public string Title { get; set; } = null!;
        
    [Range(0, 100)]
    public int ProgressPercentage { get; set; }
    
    [MaxLength(50)]
    public string? Status { get; set; }
    public DateOnly PlannedStartDate { get; set; }
    public DateOnly PlannedEndDate { get; set; }
    public DateOnly? ActualStartDate { get; set; }
    public DateOnly? ActualEndDate { get; set; }
    public string? Notes { get; set; }
    public int? OrderIndex { get; set; }
}
