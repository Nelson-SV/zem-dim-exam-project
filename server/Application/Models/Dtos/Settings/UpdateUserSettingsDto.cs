using System.ComponentModel.DataAnnotations;

namespace Application.Models.Dtos.Settings;

public class UpdateUserSettingsDto
{
    public bool EmailAlerts { get; set; }

    [Required]
    [RegularExpression("^(Daily|Weekly|Monthly)$", ErrorMessage = "Report frequency must be Daily, Weekly, or Monthly")]
    public string ReportFrequency { get; set; } = "Weekly";

    public bool ClientUpdates { get; set; }
}
