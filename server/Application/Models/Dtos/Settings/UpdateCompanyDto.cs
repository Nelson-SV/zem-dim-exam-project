using System.ComponentModel.DataAnnotations;

namespace Application.Models.Dtos.Settings;

public class UpdateCompanyDto
{
    [Required, MinLength(2)]
    public string Name { get; set; } = null!;

    [Required, EmailAddress]
    public string Email { get; set; } = null!;

    [Phone]
    public string? Phone { get; set; }

    public string? Website { get; set; }

    public string? Address { get; set; }

    [RegularExpression("^(UAH|USD|EUR)$", ErrorMessage = "Currency must be UAH, USD, or EUR")]
    public string? Currency { get; set; }
}
