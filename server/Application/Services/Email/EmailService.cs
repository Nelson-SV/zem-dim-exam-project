using System.Net;
using System.Net.Mail;
using Common.Email.Configurations;
using Common.Email.TemplateReader;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Resend;
using SendGrid;
using SendGrid.Helpers.Mail;
using EmailAddress = SendGrid.Helpers.Mail.EmailAddress;

namespace Application.Services.Email;

public class EmailService
{
    private readonly EmailSettings _emailSettings;
    private readonly IResend _resend;
    private readonly TemplateReader _templateReader;

    public EmailService(
        IOptions<EmailSettings> emailSettings,
        IResend resend,
        TemplateReader templateReader)
    {
        _emailSettings = emailSettings.Value;
        _resend = resend;
        _templateReader = templateReader;
    }
    
    //Send email via Resend
    public async Task SendEmailViaResendAsync(
        string to,
        string subject,
        string templateFileName,
        IDictionary<string, string> tokens)
    {
        var template = _templateReader.LoadTemplate(templateFileName);
        var html = _templateReader.RenderValues(template, tokens);

        var message = new EmailMessage
        {
            //From = $"{_emailSettings.SmtpSenderName} <{_emailSettings.SmtpSenderEmail}>",
            Subject = subject,
            HtmlBody = html
        };
        
        message.From = "Acme <onboarding@resend.dev>";

        message.To.Add(to);

        var result = await _resend.EmailSendAsync(message);

        // Optional: check result / log (depends on the Resend SDK response type)
    }
}