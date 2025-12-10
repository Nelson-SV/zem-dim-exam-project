using Core.Domain.Entities;

namespace Application.Models.Dtos.Photos;

public record ClientGalleryProjectDto(Guid Id, string Title, IReadOnlyCollection<ClientGalleryStageDto> Stages);
public record ClientGalleryStageDto(Guid Id, string Title, int OrderIndex);

public class ClientGalleryDto
{
    public Guid Id { get; init; }
    public Guid ProjectId { get; init; }
    public Guid? MilestoneId { get; init; }
    public string? MilestoneTitle { get; init; }
    public string FileUrl { get; init; } = null!;
    public string? Caption { get; init; }
    public DateTime? TakenAt { get; init; }
    public DateTime? CreatedAt { get; init; }

    public static ClientGalleryDto FromEntity(Photo p) => new()
    {
        Id = p.Id,
        ProjectId = p.Projectid,
        MilestoneId = p.Milestoneid,
        MilestoneTitle = p.Milestone?.Title,
        FileUrl = p.Fileurl,
        Caption = p.Caption,
        TakenAt = p.Takenat,
        CreatedAt = p.Createdat
    };

    public static IReadOnlyCollection<ClientGalleryDto> FromEntities(IEnumerable<Photo> photos) =>
        photos.Select(FromEntity).ToList();
}