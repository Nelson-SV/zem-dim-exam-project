using Application.Interfaces.Services;
using Common.Email.Configurations;
using Microsoft.Extensions.Options;

namespace Application.Services.Email;

/// <summary>
/// Dispatches email sending to the configured provider.
/// </summary>
public sealed class EmailSender : IEmailSender
{
    private readonly IOptionsMonitor<EmailSettings> _emailSettings;
    private readonly EmailService _resendEmailService;
    private readonly MailgunEmailService _mailgunEmailService;

    public EmailSender(
        IOptionsMonitor<EmailSettings> emailSettings,
        EmailService resendEmailService,
        MailgunEmailService mailgunEmailService)
    {
        _emailSettings = emailSettings;
        _resendEmailService = resendEmailService;
        _mailgunEmailService = mailgunEmailService;
    }

    public Task SendTemplateEmailAsync(
        string to,
        string subject,
        string templateFileName,
        IDictionary<string, string> tokens,
        CancellationToken cancellationToken = default)
    {
        var provider = (_emailSettings.CurrentValue.EmailProvider ?? "Resend").Trim();

        if (provider.Equals("mailgun", StringComparison.OrdinalIgnoreCase))
            return _mailgunEmailService.SendTemplateEmailAsync(to, subject, templateFileName, tokens, cancellationToken);

        // Default: Resend
        return _resendEmailService.SendTemplateEmailAsync(to, subject, templateFileName, tokens, cancellationToken);
    }
}

