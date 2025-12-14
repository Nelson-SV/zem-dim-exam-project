using System.ComponentModel.DataAnnotations;

namespace Application.Models.Dtos.Profile;

public class ChangePasswordDto
{
    [Required]
    public string CurrentPassword { get; set; } = null!;

    [Required, MinLength(8)]
    public string NewPassword { get; set; } = null!;

    [Required, Compare(nameof(NewPassword), ErrorMessage = "Passwords do not match")]
    public string ConfirmPassword { get; set; } = null!;
}
