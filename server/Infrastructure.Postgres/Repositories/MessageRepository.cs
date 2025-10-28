using Application.Interfaces.Infrastructure.Postgres;
using Core.Domain.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Postgres.Repositories;

public class MessageRepository : IMessageRepository
{
    private readonly AppDbContext _context;

    public MessageRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Message> CreateMessageAsync(Message message)
    {
        await _context.Messages.AddAsync(message);
        await _context.SaveChangesAsync();
        
        // Load navigation properties
        await _context.Entry(message)
            .Reference(m => m.Sender)
            .LoadAsync();
        
        await _context.Entry(message)
            .Reference(m => m.Receiver)
            .LoadAsync();
        
        return message;
    }

    public async Task<Message?> GetMessageByIdAsync(Guid messageId)
    {
        return await _context.Messages
            .Include(m => m.Sender)
            .Include(m => m.Receiver)
            .FirstOrDefaultAsync(m => m.Id == messageId);
    }

    public async Task<List<Message>> GetMessagesByProjectIdAsync(Guid projectId)
    {
        return await _context.Messages
            .Include(m => m.Sender)
            .Include(m => m.Receiver)
            .Where(m => m.Projectid == projectId)
            .OrderBy(m => m.Createdat)
            .ToListAsync();
    }

    public async Task<List<Message>> GetMessagesBetweenUsersAsync(Guid senderId, Guid receiverId, Guid projectId)
    {
        return await _context.Messages
            .Include(m => m.Sender)
            .Include(m => m.Receiver)
            .Where(m => m.Projectid == projectId &&
                       ((m.Senderid == senderId && m.Receiverid == receiverId) ||
                        (m.Senderid == receiverId && m.Receiverid == senderId)))
            .OrderBy(m => m.Createdat)
            .ToListAsync();
    }

    public async Task<int> GetUnreadCountAsync(Guid userId, Guid projectId)
    {
        return await _context.Messages
            .Where(m => m.Receiverid == userId && 
                       m.Projectid == projectId && 
                       m.Isread == false)
            .CountAsync();
    }

    public async Task<Message> MarkAsReadAsync(Guid messageId)
    {
        var message = await GetMessageByIdAsync(messageId);
        if (message == null)
            throw new KeyNotFoundException($"Message with ID {messageId} not found");

        message.Isread = true;
        message.Readat = DateTime.UtcNow;
        
        await _context.SaveChangesAsync();
        return message;
    }

    public async Task<List<Message>> GetRecentMessagesAsync(Guid userId, int count = 50)
    {
        return await _context.Messages
            .Include(m => m.Sender)
            .Include(m => m.Receiver)
            .Where(m => m.Senderid == userId || m.Receiverid == userId)
            .OrderByDescending(m => m.Createdat)
            .Take(count)
            .ToListAsync();
    }
}