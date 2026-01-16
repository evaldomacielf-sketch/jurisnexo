using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using JurisNexo.Application.Services;
using JurisNexo.Application.DTOs.Inbox;
using JurisNexo.Core.Entities;

namespace JurisNexo.API.Controllers;

[Authorize]
[ApiController]
[Route("api/inbox")]
public class InboxController : BaseApiController
{
    private readonly IInboxService _inboxService;

    public InboxController(IInboxService inboxService)
    {
        _inboxService = inboxService;
    }

    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations(
        [FromQuery] string? status,
        [FromQuery] string? priority,
        [FromQuery] Guid? assignedTo,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 20,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var tenantId = GetCurrentTenantId();
            
            ConversationStatus? statusEnum = status != null ? Enum.Parse<ConversationStatus>(status, true) : null;
            ConversationPriority? priorityEnum = priority != null ? Enum.Parse<ConversationPriority>(priority, true) : null;

            var result = await _inboxService.GetConversationsAsync(
                tenantId,
                statusEnum,
                priorityEnum,
                assignedTo,
                search,
                page,
                limit,
                cancellationToken);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    [HttpGet("conversations/{id:guid}")]
    public async Task<IActionResult> GetConversation(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var conversation = await _inboxService.GetConversationAsync(id, cancellationToken);
            if (conversation == null)
                return NotFound();

            return Ok(conversation);
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount(CancellationToken cancellationToken)
    {
        try
        {
            var tenantId = GetCurrentTenantId();
            var count = await _inboxService.GetUnreadCountAsync(tenantId, cancellationToken);
            return Ok(new { count });
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    [HttpGet("conversations/{id:guid}/messages")]
    public async Task<IActionResult> GetMessages(
        Guid id,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 50,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var result = await _inboxService.GetMessagesAsync(id, page, limit, cancellationToken);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    [HttpPost("conversations/{id:guid}/messages")]
    public async Task<IActionResult> SendMessage(
        Guid id,
        [FromBody] SendMessageRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetCurrentUserId();
            var message = await _inboxService.SendMessageAsync(id, request, userId, cancellationToken);
            return Ok(message);
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    [HttpPost("conversations/{id:guid}/mark-read")]
    public async Task<IActionResult> MarkAsRead(Guid id, CancellationToken cancellationToken)
    {
        // Lógica implementada via SignalR Hub
        return NoContent();
    }

    [HttpPost("conversations/{id:guid}/assign")]
    public async Task<IActionResult> AssignConversation(
        Guid id,
        [FromBody] AssignConversationRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var conversation = await _inboxService.AssignConversationAsync(id, request.UserId, cancellationToken);
            return Ok(conversation);
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    [HttpPatch("conversations/{id:guid}")]
    public async Task<IActionResult> UpdateConversation(
        Guid id,
        [FromBody] UpdateConversationRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var conversation = await _inboxService.UpdateConversationStatusAsync(
                id,
                request.Status,
                cancellationToken);
            return Ok(conversation);
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    [HttpPost("upload-media")]
    public async Task<IActionResult> UploadMedia(
        [FromForm] IFormFile file,
        CancellationToken cancellationToken)
    {
        try
        {
            var url = await _inboxService.UploadMediaAsync(file, cancellationToken);
            return Ok(new { url });
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }
}
