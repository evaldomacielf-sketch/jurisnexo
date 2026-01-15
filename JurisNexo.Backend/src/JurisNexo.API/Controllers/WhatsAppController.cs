using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Application.DTOs.WhatsApp;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JurisNexo.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WhatsAppController : ControllerBase
{
    private readonly IWhatsAppService _whatsappService;
    
    public WhatsAppController(IWhatsAppService whatsappService)
    {
        _whatsappService = whatsappService;
    }
    
    // 1. Listar conversas
    [HttpGet("conversations")]
    public async Task<ActionResult<List<WhatsAppConversationDto>>> GetConversations(
        [FromQuery] string? filter = null, // "all", "unread", "archived"
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var escritorioId = GetTenantId();

        var conversations = await _whatsappService.GetConversationsAsync(
            escritorioId, filter, search, page, pageSize);
        return Ok(conversations);
    }
    
    // 2. Obter mensagens de uma conversa
    [HttpGet("conversations/{conversationId}/messages")]
    public async Task<ActionResult<List<WhatsAppMessageDto>>> GetMessages(
        Guid conversationId,
        [FromQuery] int limit = 50,
        [FromQuery] DateTime? before = null)
    {
        var messages = await _whatsappService.GetMessagesAsync(
            conversationId, limit, before);
        return Ok(messages);
    }
    
    // 3. Enviar mensagem de texto
    [HttpPost("conversations/{conversationId}/messages")]
    public async Task<ActionResult<WhatsAppMessageDto>> SendMessage(
        Guid conversationId,
        [FromBody] SendMessageRequest request)
    {
        var userId = GetUserId();
        var message = await _whatsappService.SendTextMessageAsync(
            conversationId, request.Content, userId);
        return Ok(message);
    }
    
    // 4. Enviar mensagem com mídia
    [HttpPost("conversations/{conversationId}/messages/media")]
    public async Task<ActionResult<WhatsAppMessageDto>> SendMediaMessage(
        Guid conversationId,
        [FromForm] SendMediaMessageRequest request)
    {
        var userId = GetUserId();
        var message = await _whatsappService.SendMediaMessageAsync(
            conversationId, request.File, request.Caption, userId);
        return Ok(message);
    }
    
    // 5. Enviar template
    [HttpPost("conversations/{conversationId}/messages/template")]
    public async Task<ActionResult<WhatsAppMessageDto>> SendTemplate(
        Guid conversationId,
        [FromBody] SendTemplateRequest request)
    {
        var userId = GetUserId();
        var message = await _whatsappService.SendTemplateAsync(
            conversationId, request.TemplateId, request.Variables, userId);
        return Ok(message);
    }
    
    // 6. Marcar mensagens como lidas
    [HttpPost("conversations/{conversationId}/mark-read")]
    public async Task<IActionResult> MarkAsRead(Guid conversationId)
    {
        await _whatsappService.MarkConversationAsReadAsync(conversationId);
        return NoContent();
    }
    
    // 7. Arquivar conversa
    [HttpPost("conversations/{conversationId}/archive")]
    public async Task<IActionResult> ArchiveConversation(Guid conversationId)
    {
        await _whatsappService.ArchiveConversationAsync(conversationId);
        return NoContent();
    }
    
    // 8. Adicionar tag
    [HttpPost("conversations/{conversationId}/tags")]
    public async Task<IActionResult> AddTag(
        Guid conversationId,
        [FromBody] AddTagRequest request)
    {
        await _whatsappService.AddTagToConversationAsync(
            conversationId, request.TagName);
        return NoContent();
    }
    
    // 9. Obter detalhes do contato
    [HttpGet("contacts/{contactId}")]
    public async Task<ActionResult<WhatsAppContactDetailsDto>> GetContactDetails(
        Guid contactId)
    {
        var details = await _whatsappService.GetContactDetailsAsync(contactId);
        return Ok(details);
    }
    
    // 10. Listar templates
    [HttpGet("templates")]
    public async Task<ActionResult<List<WhatsAppTemplateDto>>> GetTemplates()
    {
        var escritorioId = GetTenantId();
        var templates = await _whatsappService.GetTemplatesAsync(escritorioId);
        return Ok(templates);
    }
    
    // 11. Analytics
    [HttpGet("analytics")]
    public async Task<ActionResult<WhatsAppAnalyticsDto>> GetAnalytics(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate)
    {
        var escritorioId = GetTenantId();
        var analytics = await _whatsappService.GetAnalyticsAsync(
            escritorioId, startDate, endDate);
        return Ok(analytics);
    }
    
    private Guid GetUserId() 
    {
        var claim = User.FindFirst("id") ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (claim != null && Guid.TryParse(claim.Value, out Guid id)) return id;
        return Guid.Empty;
    }

    private Guid GetTenantId()
    {
         var claim = User.FindFirst("EscritorioId") ?? User.FindFirst("TenantId") ?? User.FindFirst("tenant_id");
         if (claim != null && Guid.TryParse(claim.Value, out Guid id)) return id;
         return Guid.Empty;
    }
}
