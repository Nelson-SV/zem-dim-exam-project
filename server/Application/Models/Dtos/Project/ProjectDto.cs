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
    
    // ✅ Замінено Description на Notes
    public string? Notes { get; set; }
    
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? PostalCode { get; set; }
    
    // ❌ Видалено Latitude і Longitude
    // public decimal? Latitude { get; set; }
    // public decimal? Longitude { get; set; }
    
    public string Status { get; set; } = null!;
    public DateOnly StartDate { get; set; }
    public DateOnly? PlannedEndDate { get; set; }
    public DateOnly? ActualEndDate { get; set; }
    public decimal? TotalArea { get; set; }
    public decimal? Budget { get; set; }
    public int? ProgressPercentage { get; set; }  
    public string? ThumbnailUrl { get; set; }
    public DateTime? CreatedAt { get; set; }   
    public DateTime? UpdatedAt { get; set; }   
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
            ProgressPercentage = project.Progresspercentage,  // ✅ Вже nullable
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

 
public class CreateProjectDto
{
    [Required(ErrorMessage = "Client ID is required")]
    public Guid ClientId { get; set; }

    [Required(ErrorMessage = "Title is required")]
    [MaxLength(200, ErrorMessage = "Title cannot exceed 200 characters")]
    public string Title { get; set; } = null!;

     
    [MaxLength(1000, ErrorMessage = "Notes cannot exceed 1000 characters")]
    public string? Notes { get; set; }

    [MaxLength(300, ErrorMessage = "Address cannot exceed 300 characters")]
    public string? Address { get; set; }

    [MaxLength(100, ErrorMessage = "City cannot exceed 100 characters")]
    public string? City { get; set; }

    [MaxLength(20, ErrorMessage = "Postal code cannot exceed 20 characters")]
    public string? PostalCode { get; set; }

     

    [Required(ErrorMessage = "Status is required")]
    [MaxLength(50, ErrorMessage = "Status cannot exceed 50 characters")]
    public string Status { get; set; } = "Planning";

    [Required(ErrorMessage = "Start date is required")]
    public DateOnly StartDate { get; set; }

    public DateOnly? PlannedEndDate { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Total area must be positive")]
    public decimal? TotalArea { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Budget must be positive")]
    public decimal? Budget { get; set; }

    [Range(0, 100, ErrorMessage = "Progress percentage must be between 0 and 100")]
    public int? ProgressPercentage { get; set; } = 0;  // ✅ Зробив nullable

    [MaxLength(500, ErrorMessage = "Thumbnail URL cannot exceed 500 characters")]
    public string? ThumbnailUrl { get; set; }
}

#endregion

#region UPDATE DTOs

 
public class UpdateProjectDto
{
    [Required(ErrorMessage = "Title is required")]
    [MaxLength(200, ErrorMessage = "Title cannot exceed 200 characters")]
    public string Title { get; set; } = null!;

     
    [MaxLength(1000, ErrorMessage = "Notes cannot exceed 1000 characters")]
    public string? Notes { get; set; }

    [MaxLength(300, ErrorMessage = "Address cannot exceed 300 characters")]
    public string? Address { get; set; }

    [MaxLength(100, ErrorMessage = "City cannot exceed 100 characters")]
    public string? City { get; set; }

    [MaxLength(20, ErrorMessage = "Postal code cannot exceed 20 characters")]
    public string? PostalCode { get; set; }

    

    [Required(ErrorMessage = "Status is required")]
    [MaxLength(50, ErrorMessage = "Status cannot exceed 50 characters")]
    public string Status { get; set; } = null!;

    [Required(ErrorMessage = "Start date is required")]
    public DateOnly StartDate { get; set; }

    public DateOnly? PlannedEndDate { get; set; }

    public DateOnly? ActualEndDate { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Total area must be positive")]
    public decimal? TotalArea { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Budget must be positive")]
    public decimal? Budget { get; set; }

    [Range(0, 100, ErrorMessage = "Progress percentage must be between 0 and 100")]
    public int? ProgressPercentage { get; set; }  // ✅ Зробив nullable

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

    // ✅ Замінено Description на Notes
    [MaxLength(1000, ErrorMessage = "Notes cannot exceed 1000 characters")]
    public string? Notes { get; set; }

    [MaxLength(300, ErrorMessage = "Address cannot exceed 300 characters")]
    public string? Address { get; set; }

    [MaxLength(100, ErrorMessage = "City cannot exceed 100 characters")]
    public string? City { get; set; }

    [MaxLength(20, ErrorMessage = "Postal code cannot exceed 20 characters")]
    public string? PostalCode { get; set; }

    // ❌ Видалено Latitude і Longitude
    // [Range(-90, 90, ErrorMessage = "Latitude must be between -90 and 90")]
    // public decimal? Latitude { get; set; }
    // [Range(-180, 180, ErrorMessage = "Longitude must be between -180 and 180")]
    // public decimal? Longitude { get; set; }

    [MaxLength(50, ErrorMessage = "Status cannot exceed 50 characters")]
    public string? Status { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? PlannedEndDate { get; set; }

    public DateOnly? ActualEndDate { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Total area must be positive")]
    public decimal? TotalArea { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Budget must be positive")]
    public decimal? Budget { get; set; }

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