namespace Application.Models.Dtos.Message;

public class MessageDto
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public Guid SenderId { get; set; }
    public string SenderName { get; set; } = null!;
    public string SenderRole { get; set; } = null!;
    public Guid ReceiverId { get; set; }
    public string Content { get; set; } = null!;
    public bool IsRead { get; set; }
    // public DateTime? ReadAt { get; set; }
    public string? AttachmentUrl { get; set; }
    public string? AttachmentType { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? ReadAt { get; set; }
}