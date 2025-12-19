namespace Application.Interfaces.Services;

public interface IEmailSender
{
    Task SendTemplateEmailAsync(
        string to,
        string subject,
        string templateFileName,
        IDictionary<string, string> tokens,
        CancellationToken cancellationToken = default);
}
