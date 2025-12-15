namespace Application.Models.Dtos.Message;

public class SendMessageDto
{
    public Guid ProjectId { get; set; }
    public Guid ReceiverId { get; set; }
    public string Content { get; set; } = null!;
    public string? AttachmentUrl { get; set; }
    public string? AttachmentType { get; set; }
}