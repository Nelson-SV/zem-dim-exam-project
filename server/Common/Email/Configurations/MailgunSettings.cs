namespace Common.Email.Configurations;

public sealed class MailgunSettings
{
    /// <summary>
    /// Mailgun Private API key (starts with "key-..."). Prefer providing via environment variables / secrets.
    /// </summary>
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>
    /// Mailgun domain used to send messages, e.g. "sandbox123.mailgun.org" or your verified domain.
    /// </summary>
    public string Domain { get; set; } = string.Empty;

    /// <summary>
    /// Mailgun API base URL. Use "https://api.mailgun.net" (US) or "https://api.eu.mailgun.net" (EU).
    /// </summary>
    public string ApiBaseUrl { get; set; } = "https://api.mailgun.net";

    /// <summary>
    /// Optional: explicit From email (must be a valid sender for the configured domain).
    /// If empty, "noreply@{Domain}" is used.
    /// </summary>
    public string FromEmail { get; set; } = string.Empty;

    /// <summary>
    /// Optional: friendly From name.
    /// </summary>
    public string FromName { get; set; } = string.Empty;

    /// <summary>
    /// If true, Mailgun processes the request but does not deliver the email.
    /// </summary>
    public bool TestMode { get; set; }
}
