namespace Common.Email.Configurations;

public class EmailSettings
{
    /// <summary>
    /// Selects the email provider used by the application.
    /// Supported values: "Resend" (default), "Mailgun".
    /// </summary>
    public string EmailProvider { get; set; } = "Resend";

    public string SmtpServer { get; set; }
    public int SmtpPort { get; set; }
    public bool SmtpEnableSsl { get; set; }
    public string SmtpSenderEmail { get; set; }
    public string SmtpSenderName { get; set; }
    public string EmailTemplatesPath { get; set; }

    public MailgunSettings Mailgun { get; set; } = new();
}
