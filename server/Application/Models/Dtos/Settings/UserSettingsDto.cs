using Core.Domain.Entities;

namespace Application.Models.Dtos.Settings;

public class UserSettingsDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public bool EmailAlerts { get; set; }
    public string ReportFrequency { get; set; } = "Weekly";
    public bool ClientUpdates { get; set; }

    public static UserSettingsDto FromEntity(Usersetting settings)
    {
        return new UserSettingsDto
        {
            Id = settings.Id,
            UserId = settings.Userid,
            EmailAlerts = settings.Emailalerts ?? true,
            ReportFrequency = settings.Reportfrequency ?? "Weekly",
            ClientUpdates = settings.Clientupdates ?? true
        };
    }
}
