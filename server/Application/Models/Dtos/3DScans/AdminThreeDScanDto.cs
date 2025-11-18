using Core.Domain.Entities;

namespace Application.Models.Dtos._3DScans;

public class AdminThreeDScanDto
{
    public Guid Id { get; init; }
    public Guid ProjectId { get; init; }
    public Guid? MilestoneId { get; init; }
    public string ProjectTitle { get; init; } = string.Empty;
    public string? MilestoneTitle { get; init; }
    public string RoomName { get; init; } = string.Empty;
    public decimal? RoomArea { get; init; }
    public DateTime? ScannedAt { get; init; }
    public string FileUrl { get; init; } = string.Empty;
    public string FileName { get; init; } = string.Empty;
    public long? FileSize { get; init; }
    public string FileFormat { get; init; } = ".glb";
    public string? Notes { get; init; }
    public Guid UploadedBy { get; init; }
    public DateTime? CreatedAt { get; init; }

    public static AdminThreeDScanDto FromEntity(Threedscan scan) => new()
    {
        Id = scan.Id,
        ProjectId = scan.Projectid,
        MilestoneId = scan.Milestoneid,
        ProjectTitle = scan.Project?.Title ?? string.Empty,
        MilestoneTitle = scan.Milestone?.Title,
        RoomName = scan.Roomname,
        RoomArea = scan.Roomarea,
        ScannedAt = scan.Scannedat,
        FileUrl = scan.Fileurl,
        FileName = scan.Filename,
        FileSize = scan.Filesize,
        FileFormat = scan.Fileformat ?? ".glb",
        Notes = scan.Notes,
        UploadedBy = scan.Uploadedbyid,
        CreatedAt = scan.Createdat
    };
}