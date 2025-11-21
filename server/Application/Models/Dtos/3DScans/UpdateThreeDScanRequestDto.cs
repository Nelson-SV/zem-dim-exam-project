namespace Application.Models.Dtos._3DScans;

public class UpdateThreeDScanRequestDto
{
    public string? RoomName { get; set; }
    public Guid? MilestoneId { get; set; }
    public decimal? RoomArea { get; set; }
    public DateTime? ScannedAt { get; set; }
    public string? Notes { get; set; }
}