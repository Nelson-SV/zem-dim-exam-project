using Application.Models.Dtos.Message;

namespace Application.Interfaces.Services;

public interface IMessageService
{
    Task<MessageDto> SendMessageAsync(Guid senderId, SendMessageDto dto);
    Task<List<MessageDto>> GetProjectMessagesAsync(Guid projectId);
    Task<MessageDto> MarkMessageAsReadAsync(Guid userId, Guid messageId);
    Task<int> GetUnreadCountAsync(Guid userId, Guid projectId);
}