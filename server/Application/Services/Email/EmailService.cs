using System.Net;
using System.Net.Mail;
using Common.Email.Configurations;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace Application.Services.Email;

public class EmailService
{
    private readonly EmailSettings _emailSettings;
    private readonly string _sendGridApiKey;
    //private readonly bool _isProduction;
    private readonly IHostEnvironment _env;

    public EmailService(IOptions<EmailSettings> emailSettings, IOptions<AppOptions> appOptions, IHostEnvironment env)
    {
        _emailSettings = emailSettings.Value;
        _sendGridApiKey = appOptions.Value.SendGridApiKey;
        _env = env;
        //_isProduction = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Production";
    }

    // Send email asynchronously either via SMTP (MailCatcher) or SendGrid (Production)
    public async Task SendEmailAsync(string to, string subject, string body, bool isHtml = true)
    {
        if (_env.IsProduction() && !string.IsNullOrEmpty(_sendGridApiKey))
        {
            await SendEmailUsingSendGrid(to, subject, body, isHtml);
        }
        else
        {
            await SendEmailUsingSmtpClient(to, subject, body, isHtml);
        }
    }

    // Method to send email via SendGrid
    private async Task SendEmailUsingSendGrid(string to, string subject, string body, bool isHtml)
    {
        var client = new SendGridClient(_sendGridApiKey);
        var from = new EmailAddress(_emailSettings.SmtpSenderEmail, _emailSettings.SmtpSenderName);
        var toEmail = new EmailAddress(to);
        var msg = isHtml
            ? MailHelper.CreateSingleEmail(from, toEmail, subject, null, body)
            : MailHelper.CreateSingleEmail(from, toEmail, subject, body, null);
        
        try
        {
            var response = await client.SendEmailAsync(msg);
        }
        catch (Exception ex)
        {
            throw new ApplicationException($"Failed to send email to {to}", ex);
        }
        
        // You can log or handle the response here if needed
        // response ?? Are we going to use an online service?
    }

    // Method to send email via MailCatcher (SMTP)
    private async Task SendEmailUsingSmtpClient(string to, string subject, string body, bool isHtml)
    {
        using var smtpClient = new SmtpClient(_emailSettings.SmtpServer, _emailSettings.SmtpPort)
        {
            Credentials = new NetworkCredential(_emailSettings.SmtpSenderEmail, ""),
            EnableSsl = _emailSettings.SmtpEnableSsl
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress(_emailSettings.SmtpSenderEmail, _emailSettings.SmtpSenderName),
            Subject = subject,
            Body = body,
            IsBodyHtml = isHtml
        };

        mailMessage.To.Add(to);
        
        try
        {
            await smtpClient.SendMailAsync(mailMessage);
        }
        catch (Exception ex)
        {
            throw new ApplicationException($"Failed to send email to {to}", ex);
        }
        
    }
}