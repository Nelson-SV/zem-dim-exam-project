using Application.Models.Dtos.Update;
using Core.Domain.Entities;

namespace Application.Models.Dtos.Dashboard;

public class ClientDashboardResponseDto
{
    public Guid ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public IReadOnlyCollection<ClientDashboardProjectDto> Projects { get; set; } = Array.Empty<ClientDashboardProjectDto>();
}

public class ClientDashboardProjectDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? PostalCode { get; set; }
    public string Status { get; set; } = string.Empty;
    public int ProgressPercentage { get; set; }
    public decimal? TotalArea { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly PlannedEndDate { get; set; }
    public DateOnly? ActualEndDate { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string? CurrentStageTitle { get; set; }
    public IReadOnlyCollection<ClientDashboardStageDto> Stages { get; set; } = Array.Empty<ClientDashboardStageDto>();
    public IReadOnlyCollection<UpdateDto> LatestUpdates { get; set; } = Array.Empty<UpdateDto>();
}

public class ClientDashboardStageDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int ProgressPercentage { get; set; }
    public int OrderIndex { get; set; }
    public string? Notes { get; set; }
    public DateOnly? PlannedStartDate { get; set; }
    public DateOnly? PlannedEndDate { get; set; }
    public DateOnly? ActualStartDate { get; set; }
    public DateOnly? ActualEndDate { get; set; }
    
    public static ClientDashboardStageDto FromEntity(Milestone milestone)
    {
        return new ClientDashboardStageDto
        {
            Id = milestone.Id,
            Title = milestone.Title,
            Status = milestone.Status,
            ProgressPercentage = milestone.Progresspercentage,
            OrderIndex = milestone.Orderindex,
            Notes = milestone.Notes,
            PlannedStartDate = milestone.Plannedstartdate,
            PlannedEndDate = milestone.Plannedenddate,
            ActualStartDate = milestone.Actualstartdate,
            ActualEndDate = milestone.Actualenddate
        };
    }
}