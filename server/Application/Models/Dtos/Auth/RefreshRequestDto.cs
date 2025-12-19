using System.ComponentModel.DataAnnotations;

namespace Application.Models.Dtos.Auth;

public class RefreshRequestDto
{
    [Required] public string RefreshToken { get; set; } = null!;
}
