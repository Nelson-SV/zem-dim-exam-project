using System.Security.Claims;
using Application.Interfaces.Services;
using Application.Models.Dtos.Message;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Rest.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class MessagesController : ControllerBase
{
    private readonly IMessageService _messageService;

    public MessagesController(IMessageService messageService)
    {
        _messageService = messageService;
    }

    // GET: /api/Messages/project/{projectId}/unread-count
    [HttpGet("project/{projectId:guid}/unread-count")]
    public async Task<ActionResult<int>> GetProjectUnreadCount(Guid projectId)
    {
        try
        {
            var userId = GetUserId();
            var count = await _messageService.GetUnreadCountAsync(userId, projectId);
            return Ok(count);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    // GET: /api/Messages/unread-count
    [HttpGet("unread-count")]
    public async Task<ActionResult<int>> GetTotalUnreadCount()
    {
        try
        {
            var userId = GetUserId();
            var count = await _messageService.GetTotalUnreadCountAsync(userId);
            return Ok(count);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    // POST: /api/Messages/{messageId}/mark-read
    [HttpPost("{messageId:guid}/mark-read")]
    public async Task<ActionResult<MessageDto>> MarkAsRead(Guid messageId)
    {
        try
        {
            var userId = GetUserId();
            var message = await _messageService.MarkMessageAsReadAsync(userId, messageId);
            return Ok(message);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    // POST: /api/Messages/send
    [HttpPost("send")]
    public async Task<ActionResult<MessageDto>> SendMessage([FromBody] SendMessageRequest request)
    {
        try
        {
            var senderId = GetUserId(); // ✅ беремо з токена, не з тіла
            var dto = new SendMessageDto
            {
                ProjectId = request.ProjectId,
                ReceiverId = request.ReceiverId,
                Content = request.Content
            };

            var message = await _messageService.SendMessageAsync(senderId, dto);
            return Ok(message);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    // GET: /api/Messages/project/{projectId}
    [HttpGet("project/{projectId:guid}")]
    public async Task<ActionResult<List<MessageDto>>> GetProjectMessages(Guid projectId)
    {
        var messages = await _messageService.GetProjectMessagesAsync(projectId);
        return Ok(messages);
    }

    
    private Guid GetUserId()
    {
#if DEBUG
        Console.WriteLine("Claims received:");
        foreach (var c in User?.Claims ?? Enumerable.Empty<Claim>())
            Console.WriteLine($"{c.Type}: {c.Value}");
#endif
        var userIdClaim =
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? // ← у твоїх логах це є
            User.FindFirst("Id")?.Value ??
            User.FindFirst("sub")?.Value ??
            User.FindFirst("nameid")?.Value;

        if (string.IsNullOrWhiteSpace(userIdClaim))
            throw new UnauthorizedAccessException("User ID not found in token");

        return Guid.Parse(userIdClaim);
    }
}

public class SendMessageRequest
{
    
    public Guid SenderId { get; set; }
    public Guid ProjectId { get; set; }
    public Guid ReceiverId { get; set; }
    public string Content { get; set; } = null!;
}
