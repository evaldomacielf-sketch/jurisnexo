using JurisNexo.Domain.Enums;

namespace JurisNexo.Application.DTOs.Inbox;

public record SendMessageRequest(
    string Content,
    MessageType MessageType,
    string? MediaUrl
);

public record AssignConversationRequest(Guid UserId);

public record UpdateConversationRequest(ConversationStatus Status);
