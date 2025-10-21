using System.ComponentModel.DataAnnotations;

namespace Application.Models.Dtos.Auth;

public class RegisterRequestDto
{
    [Required, EmailAddress]
    public string Email { get; set; } = null!;

    [Required, MinLength(2)]
    public string FirstName { get; set; } = null!;

    [Required, MinLength(2)]
    public string LastName { get; set; } = null!;

    public string? PhoneNumber { get; set; }
    public string? ProfileImageUrl { get; set; }
    public string? Language { get; set; }
}