namespace Application.Models.Dtos._3DScans;

public class UploadThreeDScanRequestDto
{
    public Guid ProjectId { get; set; }
    public Guid? MilestoneId { get; set; }
    public string RoomName { get; set; } = string.Empty;
    public decimal RoomArea { get; set; }
    public DateTime? ScannedAt { get; set; }
    public string? Notes { get; set; }
    
    public record UploadedFileDescriptor(Stream Content, string FileName, string ContentType, long Length);

    public record UploadThreeDScanCommand(UploadThreeDScanRequestDto Request, UploadedFileDescriptor File);
    
}