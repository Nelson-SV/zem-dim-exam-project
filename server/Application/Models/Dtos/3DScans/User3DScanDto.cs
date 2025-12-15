using Core.Domain.Entities;

namespace Application.Models.Dtos._3DScans;

public class User3DScanDto
{
    public Guid Id { get; set; }
    public string RoomName { get; set; } = string.Empty;
    public decimal? RoomArea { get; set; }
    public DateTime? ScannedAt { get; set; }
    public string FileUrl { get; set; } = string.Empty;
    public string? Notes { get; set; }

    public static User3DScanDto FromEntity(Threedscan scan)
    {
        return new User3DScanDto
        {
            Id = scan.Id,
            RoomName = scan.Roomname,
            RoomArea = scan.Roomarea,
            ScannedAt = scan.Scannedat,
            FileUrl = scan.Fileurl,
            Notes = scan.Notes
        };
    }
}