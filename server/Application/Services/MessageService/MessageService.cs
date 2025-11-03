using Application.Interfaces.Infrastructure.Postgres;
using Application.Interfaces.Infrastructure.Postgres.Admin.UserManagement;
using Application.Interfaces.Services;
using Application.Models.Dtos.Message;
using Core.Domain.Entities;

namespace Application.Services.MessageService;

public class MessageService : IMessageService
{
    private readonly IMessageRepository _messageRepository;
    private readonly IUserManagementRepository _userRepository;

    public MessageService(IMessageRepository messageRepository, IUserManagementRepository userRepository)
    {
        _messageRepository = messageRepository;
        _userRepository = userRepository;
    }

    public async Task<MessageDto> SendMessageAsync(Guid senderId, SendMessageDto dto)
    {
        // Validate sender exists
        var sender = await _userRepository.GetByIdAsync(senderId);
        if (sender == null)
            throw new UnauthorizedAccessException("Sender not found");

        // Validate receiver exists
        var receiver = await _userRepository.GetByIdAsync(dto.ReceiverId);
        if (receiver == null)
            throw new ArgumentException("Receiver not found");

        var message = new Message
        {
            Id = Guid.NewGuid(),
            Projectid = dto.ProjectId,
            Senderid = senderId,
            Receiverid = dto.ReceiverId,
            Content = dto.Content,
            Isread = false,
            Attachmenturl = dto.AttachmentUrl,
            Attachmenttype = dto.AttachmentType,
            // ✅ Для timestamptz ПОТРІБНО UTC!
            Createdat = DateTime.UtcNow
        };

        var createdMessage = await _messageRepository.CreateMessageAsync(message);

        return MapToDto(createdMessage);
    }

    public async Task<List<MessageDto>> GetProjectMessagesAsync(Guid projectId)
    {
        var messages = await _messageRepository.GetMessagesByProjectIdAsync(projectId);
        return messages.Select(MapToDto).ToList();
    }

    public async Task<MessageDto> MarkMessageAsReadAsync(Guid userId, Guid messageId)
    {
        var message = await _messageRepository.GetMessageByIdAsync(messageId);
        
        if (message == null)
            throw new KeyNotFoundException("Message not found");

        if (message.Receiverid != userId)
            throw new UnauthorizedAccessException("You can only mark your own messages as read");

        var updatedMessage = await _messageRepository.MarkAsReadAsync(messageId);
        return MapToDto(updatedMessage);
    }

    public async Task<int> GetUnreadCountAsync(Guid userId, Guid projectId)
    {
        return await _messageRepository.GetUnreadCountAsync(userId, projectId);
    }
    public async Task<int> GetTotalUnreadCountAsync(Guid userId)
    {
        return await _messageRepository.GetTotalUnreadCountAsync(userId);
    }
    private MessageDto MapToDto(Message message)
    {
        return new MessageDto
        {
            Id = message.Id,
            ProjectId = message.Projectid,
            SenderId = message.Senderid,
            SenderName = $"{message.Sender.Firstname} {message.Sender.Lastname}",
            SenderRole = message.Sender.Role,
            ReceiverId = message.Receiverid,
            Content = message.Content,
            IsRead = message.Isread ?? false,
            ReadAt = message.Readat,
            AttachmentUrl = message.Attachmenturl,
            AttachmentType = message.Attachmenttype,
            CreatedAt = message.Createdat ?? DateTime.UtcNow
        };
    }
}