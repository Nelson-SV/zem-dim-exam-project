namespace Application.Models.Dtos._3DScans;

public class User3DScanProjectDto
{
    public Guid ProjectId { get; set; }
    public string ProjectTitle { get; set; } = string.Empty;
    public int ScanCount { get; set; }
    public List<User3DScanDto> Scans { get; set; } = new();
}