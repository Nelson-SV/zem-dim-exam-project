using Application.Interfaces.Services;
using Application.Models.Dtos.Message;
using Microsoft.AspNetCore.Mvc;

namespace Api.Rest.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MessagesController : ControllerBase
{
    private readonly IMessageService _messageService;

    public MessagesController(IMessageService messageService)
    {
        _messageService = messageService;
    }

    [HttpPost("send")]
    public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
    {
        try
        {
            var dto = new SendMessageDto
            {
                ProjectId = request.ProjectId,
                ReceiverId = request.ReceiverId,
                Content = request.Content
            };

            var message = await _messageService.SendMessageAsync(request.SenderId, dto);
            return Ok(message);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("project/{projectId}")]
    public async Task<IActionResult> GetProjectMessages(Guid projectId)
    {
        var messages = await _messageService.GetProjectMessagesAsync(projectId);
        return Ok(messages);
    }
}

public class SendMessageRequest
{
    public Guid SenderId { get; set; }
    public Guid ProjectId { get; set; }
    public Guid ReceiverId { get; set; }
    public string Content { get; set; } = null!;
}