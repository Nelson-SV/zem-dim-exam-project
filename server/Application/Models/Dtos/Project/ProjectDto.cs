namespace Application.Models.Dtos.Project;
using Core.Domain.Entities;


public class ProjectDto
{
    public Guid Id { get; set; }
    public Guid ClientId { get; set; }
    public string ClientName { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? PostalCode { get; set; }
    public string Status { get; set; } = null!;
    public DateOnly StartDate { get; set; }
    public DateOnly? PlannedEndDate { get; set; }
    public DateOnly? ActualEndDate { get; set; }
    public decimal? TotalArea { get; set; }
    public decimal? Budget { get; set; }
    public int ProgressPercentage { get; set; }
    public string? ThumbnailUrl { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public static ProjectDto FromEntity(Project project)
    {
        return new ProjectDto
        {
            Id = project.Id,

        };
    }
   

    public static List<ProjectDto> FromEntityToList(List<Project> projects)
    {
        return projects.Select(u =>
        {
            var projectDto = FromEntity(u);
            return projectDto;
        }).ToList();
    }
}

public class ProjectParticipantsDto
{
    public Guid ProjectId { get; set; }
    public Guid ClientId { get; set; }
    public Guid AdminId { get; set; }
}

