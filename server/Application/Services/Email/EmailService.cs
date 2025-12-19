using Application.Interfaces.Services;
using Common.Email.TemplateReader;
using Resend;

namespace Application.Services.Email;

/// <summary>
/// Resend-backed email sender.
/// </summary>
public class EmailService : IEmailSender
{
    private readonly IResend _resend;
    private readonly TemplateReader _templateReader;

    public EmailService(
        IResend resend,
        TemplateReader templateReader)
    {
        _resend = resend;
        _templateReader = templateReader;
    }
    
    //Send email via Resend
    public async Task SendEmailViaResendAsync(
        string to,
        string subject,
        string templateFileName,
        IDictionary<string, string> tokens,
        CancellationToken cancellationToken = default)
    {
        var template = _templateReader.LoadTemplate(templateFileName);
        var html = _templateReader.RenderValues(template, tokens);

        var message = new EmailMessage
        {
            Subject = subject,
            HtmlBody = html
        };
        
        message.From = "Acme <onboarding@resend.dev>";

        message.To.Add(to);

        var result = await _resend.EmailSendAsync(message);

        // Optional: check result / log (depends on the Resend SDK response type)
    }

    public Task SendTemplateEmailAsync(
        string to,
        string subject,
        string templateFileName,
        IDictionary<string, string> tokens,
        CancellationToken cancellationToken = default)
        => SendEmailViaResendAsync(to, subject, templateFileName, tokens, cancellationToken);
}
