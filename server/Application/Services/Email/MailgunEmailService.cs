using System.Net.Http.Headers;
using System.Text;
using Application.Interfaces.Services;
using Common.Email.Configurations;
using Common.Email.TemplateReader;
using Microsoft.Extensions.Options;

namespace Application.Services.Email;

/// <summary>
/// Mailgun-backed email sender using the Messages API.
/// </summary>
public sealed class MailgunEmailService : IEmailSender
{
    private readonly HttpClient _httpClient;
    private readonly IOptionsMonitor<EmailSettings> _emailSettings;
    private readonly TemplateReader _templateReader;

    public MailgunEmailService(
        HttpClient httpClient,
        IOptionsMonitor<EmailSettings> emailSettings,
        TemplateReader templateReader)
    {
        _httpClient = httpClient;
        _emailSettings = emailSettings;
        _templateReader = templateReader;
    }

    public async Task SendTemplateEmailAsync(
        string to,
        string subject,
        string templateFileName,
        IDictionary<string, string> tokens,
        CancellationToken cancellationToken = default)
    {
        var template = _templateReader.LoadTemplate(templateFileName);
        var html = _templateReader.RenderValues(template, tokens);

        var settings = _emailSettings.CurrentValue;
        var mailgun = settings.Mailgun ?? new MailgunSettings();

        if (string.IsNullOrWhiteSpace(mailgun.ApiKey))
            throw new InvalidOperationException("Mailgun is selected but AppOptions:Mailgun:ApiKey is not configured.");
        if (string.IsNullOrWhiteSpace(mailgun.Domain))
            throw new InvalidOperationException("Mailgun is selected but AppOptions:Mailgun:Domain is not configured.");

        var apiBaseUrl = (mailgun.ApiBaseUrl ?? "https://api.mailgun.net").TrimEnd('/');

        var fromEmail = string.IsNullOrWhiteSpace(mailgun.FromEmail)
            ? $"noreply@{mailgun.Domain}"
            : mailgun.FromEmail.Trim();

        var fromName = string.IsNullOrWhiteSpace(mailgun.FromName)
            ? settings.SmtpSenderName
            : mailgun.FromName.Trim();

        var from = string.IsNullOrWhiteSpace(fromName) ? fromEmail : $"{fromName} <{fromEmail}>";

        using var form = new MultipartFormDataContent
        {
            { new StringContent(from), "from" },
            { new StringContent(to), "to" },
            { new StringContent(subject), "subject" },
            { new StringContent(html), "html" },
        };

        if (mailgun.TestMode)
            form.Add(new StringContent("yes"), "o:testmode");

        var requestUri = new Uri($"{apiBaseUrl}/v3/{mailgun.Domain}/messages");

        using var request = new HttpRequestMessage(HttpMethod.Post, requestUri)
        {
            Content = form
        };

        var basic = Convert.ToBase64String(Encoding.ASCII.GetBytes($"api:{mailgun.ApiKey}"));
        request.Headers.Authorization = new AuthenticationHeaderValue("Basic", basic);

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        if (response.IsSuccessStatusCode)
            return;

        var body = await response.Content.ReadAsStringAsync(cancellationToken);
        throw new InvalidOperationException(
            $"Mailgun send failed with HTTP {(int)response.StatusCode} ({response.ReasonPhrase}). Response: {body}");
    }
}

