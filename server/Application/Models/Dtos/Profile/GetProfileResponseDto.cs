using Core.Domain.Entities;

namespace Application.Models.Dtos.Profile;

public class GetProfileResponseDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string? PhoneNumber { get; set; }
    public string? ProfileImageUrl { get; set; }
    public string Role { get; set; } = null!;
    public DateTime? CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }

    public static GetProfileResponseDto FromEntity(User user)
    {
        return new GetProfileResponseDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.Firstname,
            LastName = user.Lastname,
            PhoneNumber = user.Phonenumber,
            ProfileImageUrl = user.Profileimageurl,
            Role = user.Role,
            CreatedAt = user.Createdat,
            LastLoginAt = user.Lastloginat
        };
    }
}
