using System.ComponentModel.DataAnnotations;

namespace Application.Models.Dtos.Profile;

public class UpdateProfileDto
{
    [Required, MinLength(2)]
    public string FirstName { get; set; } = null!;

    [Required, MinLength(2)]
    public string LastName { get; set; } = null!;

    [Required, EmailAddress]
    public string Email { get; set; } = null!;

    [Phone]
    public string? PhoneNumber { get; set; }
}
