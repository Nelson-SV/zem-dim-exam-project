using System.ComponentModel.DataAnnotations;

namespace Application.Models.Dtos.UserManagement;

public class UpdateUserResponseDto
{
    [Required] public string UserId { get; set; }
    [Required] public string Email { get; set; } = null!;
}