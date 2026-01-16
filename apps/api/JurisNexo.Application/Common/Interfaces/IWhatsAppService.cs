using JurisNexo.Application.DTOs.WhatsApp;
using Microsoft.AspNetCore.Http;

namespace JurisNexo.Application.Common.Interfaces;

public interface IWhatsAppService
{
    Task<List<WhatsAppConversationDto>> GetConversationsAsync(Guid escritorioId, string? filter, string? search, int page, int pageSize);
    Task<List<WhatsAppMessageDto>> GetMessagesAsync(Guid conversationId, int limit, DateTime? before);
    Task<WhatsAppMessageDto> SendTextMessageAsync(Guid conversationId, string content, Guid userId);
    Task<WhatsAppMessageDto> SendMediaMessageAsync(Guid conversationId, IFormFile file, string? caption, Guid userId);
    Task<WhatsAppMessageDto> SendTemplateAsync(Guid conversationId, string templateId, Dictionary<string, string> variables, Guid userId);
    Task MarkConversationAsReadAsync(Guid conversationId);
    Task ArchiveConversationAsync(Guid conversationId);
    Task AddTagToConversationAsync(Guid conversationId, string tagName);
    Task<WhatsAppContactDetailsDto> GetContactDetailsAsync(Guid contactId);
    Task<List<WhatsAppTemplateDto>> GetTemplatesAsync(Guid escritorioId);
    Task<WhatsAppAnalyticsDto> GetAnalyticsAsync(Guid escritorioId, DateTime startDate, DateTime endDate);
    Task<bool> IsConnectedAsync(CancellationToken cancellationToken = default);
}
