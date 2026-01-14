using Microsoft.AspNetCore.Http;
using JurisNexo.Application.DTOs.Inbox;
using JurisNexo.Application.DTOs.Common;
using JurisNexo.Domain.Entities;

namespace JurisNexo.Application.Services;

public interface IInboxService
{
    Task<PaginatedResponse<ConversationDto>> GetConversationsAsync(
        Guid tenantId,
        ConversationStatus? status,
        ConversationPriority? priority,
        Guid? assignedToUserId,
        string? search,
        int page,
        int limit,
        CancellationToken cancellationToken = default);

    Task<ConversationDto?> GetConversationAsync(Guid conversationId, CancellationToken cancellationToken = default);
    Task<int> GetUnreadCountAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<PaginatedResponse<MessageDto>> GetMessagesAsync(Guid conversationId, int page, int limit, CancellationToken cancellationToken = default);
    Task<MessageDto> SendMessageAsync(Guid conversationId, SendMessageRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task<ConversationDto> UpdateConversationStatusAsync(Guid conversationId, ConversationStatus status, CancellationToken cancellationToken = default);
    Task<ConversationDto> AssignConversationAsync(Guid conversationId, Guid userId, CancellationToken cancellationToken = default);
    Task<string> UploadMediaAsync(IFormFile file, CancellationToken cancellationToken = default);
}
