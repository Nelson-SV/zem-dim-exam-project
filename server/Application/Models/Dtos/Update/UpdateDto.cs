using Core.Domain.Entities;

namespace Application.Models.Dtos.Update;

public class UpdateDto
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string ProjectTitle { get; set; } = string.Empty;
    public Guid? MilestoneId { get; set; }
    public string? MilestoneTitle { get; set; }
    public string UpdateType { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid CreatedById { get; set; }
    public string? CreatedByName { get; set; }
    public DateTime? CreatedAt { get; set; }

    public static UpdateDto FromEntity(Core.Domain.Entities.Update entity)
    {
        return new UpdateDto
        {
            Id = entity.Id,
            ProjectId = entity.Projectid,
            ProjectTitle = entity.Project?.Title ?? string.Empty,
            MilestoneId = entity.Milestoneid,
            MilestoneTitle = entity.Milestone?.Title,
            UpdateType = entity.Updatetype,
            Title = entity.Title,
            Description = entity.Description,
            CreatedById = entity.Createdbyid,
            CreatedByName = entity.Createdby != null
                ? $"{entity.Createdby.Firstname} {entity.Createdby.Lastname}".Trim()
                : null,
            CreatedAt = entity.Createdat
        };
    }

    public static IReadOnlyCollection<UpdateDto> FromEntities(IEnumerable<Core.Domain.Entities.Update> entities)
    {
        return entities.Select(FromEntity).ToList();
    }
}
