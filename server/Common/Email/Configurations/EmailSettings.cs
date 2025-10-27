namespace Common.Email.Configurations;

public class EmailSettings
{
    public string SmtpServer { get; set; }
    public int SmtpPort { get; set; }
    public bool SmtpEnableSsl { get; set; }
    public string SmtpSenderEmail { get; set; }
    public string SmtpSenderName { get; set; }
    public string EmailTemplatesPath { get; set; }
}