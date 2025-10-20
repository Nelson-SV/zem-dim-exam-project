using Core.Domain.Entities;

namespace Application.Interfaces.Infrastructure.Postgres;

public interface IMessageRepository
{
    Task<Message> CreateMessageAsync(Message message);
    Task<Message?> GetMessageByIdAsync(Guid messageId);
    Task<List<Message>> GetMessagesByProjectIdAsync(Guid projectId);
    Task<List<Message>> GetMessagesBetweenUsersAsync(Guid senderId, Guid receiverId, Guid projectId);
    Task<int> GetUnreadCountAsync(Guid userId, Guid projectId);
    Task<Message> MarkAsReadAsync(Guid messageId);
    Task<List<Message>> GetRecentMessagesAsync(Guid userId, int count = 50);
}