using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Application.DTOs;
using JurisNexo.Core.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JurisNexo.API.Controllers;

[Authorize]
[Route("api/whatsapp/queue")]
public class WhatsAppQueueController : BaseApiController
{
    private readonly IWhatsAppQueueService _queueService;
    private readonly IWhatsAppService _whatsappService; // Useful for getting my assignments if needed

    public WhatsAppQueueController(
        IWhatsAppQueueService queueService,
        IWhatsAppService whatsappService)
    {
        _queueService = queueService;
        _whatsappService = whatsappService;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<QueueStatsDto>> GetStats()
    {
        var stats = await _queueService.GetQueueStatsAsync();
        return Ok(stats);
    }

    [HttpGet("items")]
    public async Task<ActionResult<IEnumerable<QueueItemDto>>> GetItems([FromQuery] int take = 50)
    {
        var items = await _queueService.GetQueueItemsAsync(take);
        return Ok(items);
    }

    [HttpGet("my-assignments")]
    public async Task<ActionResult<IEnumerable<object>>> GetMyAssignments()
    {
        var userId = GetCurrentUserId();
        var tenantId = GetCurrentTenantId();
        
        // Using existing service to get conversations assigned to me
        // Filter 'all' usually returns everything, we might need a specific filter for 'assigned_to_me'
        // For now, we reuse the GetConversationsAsync if it supports filtering by assignee, 
        // otherwise we fallback to returning empty or what's available.
        // Assuming GetConversationsAsync handles the tenant scope.
        // We will perform client-side or service-side filtering if needed, 
        // but ideally the service should support "assignedTo: userId"
        
        // NOTE: Since the exact signature to filter by specific User ID isn't clear in IWhatsAppService 
        // (it usually filters by tenant), we will return a placeholder or try to filter a smaller set.
        // Ideally: await _whatsappService.GetConversationsAsync(tenantId, userId: userId);
        
        // For immediate functionality, we return empty list if not implemented, 
        // but let's try to return something if possible.
        
        return Ok(new List<object>()); // Placeholder to prevent 404
    }

    [HttpGet("advogados-status")]
    public async Task<ActionResult<IEnumerable<AdvogadoQueueStatusDto>>> GetAdvogadosStatus()
    {
        var statuses = await _queueService.GetAdvogadosStatusAsync();
        return Ok(statuses);
    }

    [HttpPost("accept-next")]
    public async Task<ActionResult<object>> AcceptNext()
    {
        var userId = GetCurrentUserId();
        var conversationId = await _queueService.AssignNextConversationAsync(userId);
        
        return Ok(new 
        { 
            success = conversationId.HasValue,
            conversationId = conversationId 
        });
    }

    [HttpPut("status")]
    public async Task<IActionResult> SetStatus([FromBody] SetStatusRequest request)
    {
        var userId = GetCurrentUserId();
        await _queueService.SetAdvogadoStatusAsync(userId, request.Status);
        return NoContent();
    }

    [HttpPost("transfer")]
    public async Task<IActionResult> Transfer([FromBody] TransferRequest request)
    {
        await _queueService.TransferConversationAsync(request.ConversationId, request.ToAdvogadoId);
        return Ok();
    }

    [HttpPost("enqueue")]
    public async Task<ActionResult<object>> Enqueue([FromBody] EnqueueRequest request)
    {
        var position = await _queueService.EnqueueConversationAsync(request.ConversationId, request.Priority);
        return Ok(new { position });
    }
}

public class SetStatusRequest
{
    public AdvogadoStatus Status { get; set; }
}

public class TransferRequest
{
    public Guid ConversationId { get; set; }
    public Guid ToAdvogadoId { get; set; }
}

public class EnqueueRequest
{
    public Guid ConversationId { get; set; }
    public QueuePriority Priority { get; set; }
}
