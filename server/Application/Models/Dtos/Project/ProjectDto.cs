using System.ComponentModel.DataAnnotations;
using Core.Domain.Entities;

namespace Application.Models.Dtos.Project;

#region Existing DTOs

public class ProjectDto
{
    public Guid Id { get; set; }
    public Guid ClientId { get; set; }
    public string ClientName { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string? Notes { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? PostalCode { get; set; }
    public string Status { get; set; } = null!;
    public DateOnly StartDate { get; set; }
    public DateOnly PlannedEndDate { get; set; }
    public DateOnly? ActualEndDate { get; set; }
    public decimal? TotalArea { get; set; }
    public decimal? Budget { get; set; }
    public int ProgressPercentage { get; set; }
    public string? ThumbnailUrl { get; set; }
    public DateTimeOffset? CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
    public bool IsDeleted { get; set; }

    public static ProjectDto FromEntity(Core.Domain.Entities.Project project)
    {
        return new ProjectDto
        {
            Id = project.Id,
            ClientId = project.Clientid,
            ClientName = project.Client != null 
                ? $"{project.Client.Firstname} {project.Client.Lastname}" 
                : "Unknown Client",
            Title = project.Title,
            Notes = project.Notes,
            Address = project.Address,
            City = project.City,
            PostalCode = project.Postalcode,
            Status = project.Status,
            StartDate = project.Startdate,
            PlannedEndDate = project.Plannedenddate,
            ActualEndDate = project.Actualenddate,
            TotalArea = project.Totalarea,
            Budget = project.Budget,
            ProgressPercentage = project.Progresspercentage,
            ThumbnailUrl = project.Thumbnailurl,
            CreatedAt = project.Createdat,
            UpdatedAt = project.Updatedat,
            IsDeleted = project.Isdeleted
        };
    }

    public static List<ProjectDto> FromEntityToList(List<Core.Domain.Entities.Project> projects)
    {
        return projects.Select(FromEntity).ToList();
    }
}

public class ProjectParticipantsDto
{
    public Guid ProjectId { get; set; }
    public Guid ClientId { get; set; }
    public Guid AdminId { get; set; }
}

#endregion

#region CREATE DTOs

/// <summary>
/// DTO for creating new project
/// </summary>
public class CreateProjectDto
{
    [Required(ErrorMessage = "Client ID is required")]
    public Guid ClientId { get; set; }

    [Required(ErrorMessage = "Title is required")]
    [MaxLength(200, ErrorMessage = "Title cannot exceed 200 characters")]
    public string Title { get; set; } = null!;

    [MaxLength(2000, ErrorMessage = "Notes cannot exceed 2000 characters")]
    public string? Notes { get; set; }

    [Required, MaxLength(300, ErrorMessage = "Address cannot exceed 300 characters")]
    public string Address { get; set; } = null!;

    [Required, MaxLength(100, ErrorMessage = "City cannot exceed 100 characters")]
    public string City { get; set; } = null!;

    [Required, MaxLength(20, ErrorMessage = "Postal code cannot exceed 20 characters")]
    public string PostalCode { get; set; } = null!;

    [Required(ErrorMessage = "Status is required")]
    [MaxLength(50, ErrorMessage = "Status cannot exceed 50 characters")]
    public string Status { get; set; } = "Pending";

    [Required(ErrorMessage = "Start date is required")]
    public string StartDate { get; set; } = null!;

    [Required(ErrorMessage = "End date is required")]
    public string PlannedEndDate { get; set; } = null!;

    [Range(0, double.MaxValue, ErrorMessage = "Total area must be positive")]
    public decimal TotalArea { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Budget must be positive")]
    public decimal Budget { get; set; }

    [Range(0, 100, ErrorMessage = "Progress percentage must be between 0 and 100")]
    public int ProgressPercentage { get; set; } = 0;

    [MaxLength(500, ErrorMessage = "Thumbnail URL cannot exceed 500 characters")]
    public string? ThumbnailUrl { get; set; }
}

#endregion

#region UPDATE DTOs

/// <summary>
/// DTO for full update of project (PUT)
/// </summary>
public class UpdateProjectDto
{
    [Required(ErrorMessage = "Title is required")]
    [MaxLength(200, ErrorMessage = "Title cannot exceed 200 characters")]
    public string Title { get; set; } = null!;

    [MaxLength(2000, ErrorMessage = "Notes cannot exceed 2000 characters")]
    public string? Notes { get; set; }

    [Required, MaxLength(300, ErrorMessage = "Address cannot exceed 300 characters")]
    public string Address { get; set; } = null!;

    [Required, MaxLength(100, ErrorMessage = "City cannot exceed 100 characters")]
    public string City { get; set; } = null!;

    [Required, MaxLength(20, ErrorMessage = "Postal code cannot exceed 20 characters")]
    public string PostalCode { get; set; } = null!;

    [Required(ErrorMessage = "Status is required")]
    [MaxLength(50, ErrorMessage = "Status cannot exceed 50 characters")]
    public string Status { get; set; } = null!;

    [Required(ErrorMessage = "Start date is required")]
    public string StartDate { get; set; } = null!;

    public string? PlannedEndDate { get; set; }

    public string? ActualEndDate { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Total area must be positive")]
    public decimal TotalArea { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Budget must be positive")]
    public decimal Budget { get; set; }

    [Range(0, 100, ErrorMessage = "Progress percentage must be between 0 and 100")]
    public int ProgressPercentage { get; set; }

    [MaxLength(500, ErrorMessage = "Thumbnail URL cannot exceed 500 characters")]
    public string? ThumbnailUrl { get; set; }
}

/// <summary>
/// DTO for partial update of project (PATCH)
/// All fields are optional
/// </summary>
public class PatchProjectDto
{
    [MaxLength(200, ErrorMessage = "Title cannot exceed 200 characters")]
    public string? Title { get; set; }

    [MaxLength(2000, ErrorMessage = "Notes cannot exceed 2000 characters")]
    public string? Notes { get; set; }

    [MaxLength(300, ErrorMessage = "Address cannot exceed 300 characters")]
    public string? Address { get; set; }

    [MaxLength(100, ErrorMessage = "City cannot exceed 100 characters")]
    public string? City { get; set; }

    [MaxLength(20, ErrorMessage = "Postal code cannot exceed 20 characters")]
    public string? PostalCode { get; set; }

    [MaxLength(50, ErrorMessage = "Status cannot exceed 50 characters")]
    public string? Status { get; set; }

    public string? StartDate { get; set; }

    public string? PlannedEndDate { get; set; }

    public string? ActualEndDate { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Total area must be positive")]
    public decimal TotalArea { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Budget must be positive")]
    public decimal Budget { get; set; }

    [Range(0, 100, ErrorMessage = "Progress percentage must be between 0 and 100")]
    public int? ProgressPercentage { get; set; }

    [MaxLength(500, ErrorMessage = "Thumbnail URL cannot exceed 500 characters")]
    public string? ThumbnailUrl { get; set; }
}

/// <summary>
/// DTO for updating only project status
/// </summary>
public class UpdateProjectStatusDto
{
    [Required(ErrorMessage = "Status is required")]
    [MaxLength(50, ErrorMessage = "Status cannot exceed 50 characters")]
    public string Status { get; set; } = null!;
}

/// <summary>
/// DTO for updating only project progress
/// </summary>
public class UpdateProjectProgressDto
{
    [Required(ErrorMessage = "Progress percentage is required")]
    [Range(0, 100, ErrorMessage = "Progress percentage must be between 0 and 100")]
    public int ProgressPercentage { get; set; }
}

#endregion
