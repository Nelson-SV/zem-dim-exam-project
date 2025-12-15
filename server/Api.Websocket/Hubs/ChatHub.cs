using Application.Interfaces.Services;
using Application.Models.Dtos.Message;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace Api.Websocket.Hubs;

[Authorize] 
public class ChatHub : Hub
{
    private readonly IMessageService _messageService;

    public ChatHub(IMessageService messageService)
    {
        _messageService = messageService;
    }

    public async Task JoinProject(string projectId)
    {
        var group = $"Project_{projectId}";
        await Groups.AddToGroupAsync(Context.ConnectionId, group);
        Console.WriteLine($"✅ {GetUserName()} ({GetUserId()}) joined {group}");
    }

    public async Task SendRaw(string projectId, string text)
    {
        var group = $"Project_{projectId}";
        await Clients.Group(group).SendAsync("ReceiveRaw", new
        {
            projectId,
            text,
            from = GetUserName(),
            fromId = GetUserId().ToString(),
            // ✅ UTC is REQUIRED for timestamptz!
            at = DateTime.UtcNow
        });
        Console.WriteLine($"📨 RAW by {GetUserName()} to {group}: {text}");
    }

    public Task WhoAmI()
        => Clients.Caller.SendAsync("WhoAmIResponse", new {
            name = GetUserName(),
            id = GetUserId().ToString(),
            role = GetUserRole()
        });

    public async Task LeaveProject(string projectId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Project_{projectId}");
        Console.WriteLine($"❌ User {GetUserName()} left project {projectId}");
    }

    public async Task SendMessage(SendMessageDto dto)
    {
        try
        {
            var senderId = GetUserId();
            
            var message = await _messageService.SendMessageAsync(senderId, dto);
            
            await Clients.Group($"Project_{dto.ProjectId}")
                .SendAsync("ReceiveMessage", message);
            
            Console.WriteLine($"📨 {GetUserName()} sent message in project {dto.ProjectId}");
        }
        catch (Exception ex)
        {
            await Clients.Caller.SendAsync("Error", ex.Message);
            Console.WriteLine($"❌ Error: {ex.Message}");
        }
    }

    public async Task MarkAsRead(string messageId)
    {
        try
        {
            var userId = GetUserId();
            var message = await _messageService.MarkMessageAsReadAsync(userId, Guid.Parse(messageId));
            
            await Clients.User(message.SenderId.ToString())
                .SendAsync("MessageRead", messageId);
        }
        catch (Exception ex)
        {
            await Clients.Caller.SendAsync("Error", ex.Message);
        }
    }

    public async Task Typing(string projectId)
    {
        await Clients.OthersInGroup($"Project_{projectId}")
            .SendAsync("UserTyping", GetUserId().ToString(), GetUserName());
    }

    public async Task StopTyping(string projectId)
    {
        await Clients.OthersInGroup($"Project_{projectId}")
            .SendAsync("UserStoppedTyping", GetUserId().ToString());
    }

    public override async Task OnConnectedAsync()
    {
        Console.WriteLine($"✅ WebSocket connected: {GetUserName()} (ID: {GetUserId()})");
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        Console.WriteLine($"❌ WebSocket disconnected: {GetUserName()}");
        await base.OnDisconnectedAsync(exception);
    }

    private Guid GetUserId()
    {
        var userIdClaim = Context.User?.FindFirst("Id")?.Value          
                          ?? Context.User?.FindFirst("sub")?.Value         
                          ?? Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    
        if (Context.User?.Claims != null)
        {
            Console.WriteLine("🔍 Available claims:");
            foreach (var claim in Context.User.Claims)
            {
                Console.WriteLine($"   {claim.Type}: {claim.Value}");
            }
        }
    
        if (string.IsNullOrEmpty(userIdClaim))
            throw new UnauthorizedAccessException("User ID not found in token");
    
        return Guid.Parse(userIdClaim);
    }

    private string GetUserName()
    {
        return Context.User?.Identity?.Name               
               ?? Context.User?.FindFirst("email")?.Value 
               ?? "Unknown User";
    }

    private string GetUserRole()
    {
        return Context.User?.FindFirst("Role")?.Value 
               ?? Context.User?.FindFirst(ClaimTypes.Role)?.Value 
               ?? "Client";
    }
}
