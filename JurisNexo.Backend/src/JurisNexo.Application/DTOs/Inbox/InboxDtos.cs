namespace JurisNexo.Application.DTOs.Inbox;

public record MessageDto(
    Guid Id,
    Guid ConversationId,
    string SenderType,
    Guid? SenderId,
    string Content,
    string MessageType,
    string? MediaUrl,
    bool IsRead,
    DateTime SentAt
);

public record ConversationDto(
    Guid Id,
    Guid TenantId,
    Guid ContactId,
    ContactInfoDto Contact,
    MessageDto? LastMessage,
    int UnreadCount,
    string Status,
    string Priority,
    UserInfoDto? AssignedToUser,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record ContactInfoDto(
    Guid Id,
    string Name,
    string Phone,
    string? AvatarUrl
);

public record UserInfoDto(
    Guid Id,
    string Name
);
