using System.ComponentModel.DataAnnotations;
using Core.Domain.Entities;

namespace Application.Models.Dtos.Project;

public class PhotoDto
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public Guid? MilestoneId { get; set; }
    public string? MilestoneTitle { get; set; }
    public string FileName { get; set; } = null!;
    public string FileUrl { get; set; } = null!;
    public string? MimeType { get; set; }
    public string? Caption { get; set; }
    public DateTime? TakenAt { get; set; }
    public Guid UploadedBy { get; set; }
    public string? UploadedByName { get; set; }
    public DateTime? CreatedAt { get; set; }

    public static PhotoDto FromEntity(Photo entity) => new()
    {
        Id = entity.Id,
        ProjectId = entity.Projectid,
        MilestoneId = entity.Milestoneid,
        MilestoneTitle = entity.Milestone?.Title,
        FileName = entity.Filename,
        FileUrl = entity.Fileurl,
        MimeType = entity.Filetype,
        Caption = entity.Caption,
        TakenAt = entity.Takenat,
        UploadedBy = entity.Uploadedbyid,
        UploadedByName = entity.Uploadedby != null
            ? $"{entity.Uploadedby.Firstname} {entity.Uploadedby.Lastname}".Trim()
            : null,
        CreatedAt = entity.Createdat
    };

    public static IReadOnlyCollection<PhotoDto> FromEntities(IEnumerable<Photo> photos) =>
        photos.Select(FromEntity).ToList();
}

public class CreatePhotoDto
{
    public Guid? MilestoneId { get; set; }
    [MaxLength(300)] public string Caption { get; set; } = null!;
    public DateTime TakenAt { get; set; }
}

public class UpdatePhotoDto
{
    public Guid? MilestoneId { get; set; }
    [MaxLength(300)]
    public string? Caption { get; set; }
    public DateTime? TakenAt { get; set; }
    public string? ThumbnailUrl { get; set; }
}
