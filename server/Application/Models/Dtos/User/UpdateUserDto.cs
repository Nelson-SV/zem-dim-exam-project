using System.ComponentModel.DataAnnotations;

namespace Application.Models.Dtos.User;

public class UpdateUserDto
{
    [Required] public string UserId { get; set; }
    [Required] public string Jwt { get; set; } = null!;
    [Required] public string Email { get; set; } = null!;
}