using Microsoft.AspNetCore.Http;

namespace Application.Models.Dtos._3DScans;

public class UploadThreeDScanForm : UploadThreeDScanRequestDto
{
    public IFormFile File { get; set; } = default!;
    public UploadThreeDScanRequestDto ToDto() => new()
    {
        ProjectId = ProjectId,
        MilestoneId = MilestoneId,
        RoomName = RoomName,
        RoomArea = RoomArea,
        ScannedAt = ScannedAt,
        Notes = Notes
    };
}