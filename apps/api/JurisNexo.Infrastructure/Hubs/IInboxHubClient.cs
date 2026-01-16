using JurisNexo.Application.DTOs.Inbox;

namespace JurisNexo.Infrastructure.Hubs;

/// <summary>
/// Interface para métodos que o servidor pode chamar no cliente
/// </summary>
public interface IInboxHubClient
{
    Task NewMessage(MessageDto message);
    Task MessageRead(MessageReadNotification notification);
    Task ConversationUpdate(ConversationDto conversation);
    Task TypingIndicator(TypingNotification notification);
    Task Error(ErrorNotification error);
}

public record MessageReadNotification(
    string ConversationId,
    List<string> MessageIds
);

public record TypingNotification(
    string ConversationId,
    string UserId,
    string UserName
);

public record ErrorNotification(
    string Message
);
