using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Application.DTOs.Inbox;
using JurisNexo.Domain.Entities;
using JurisNexo.Infrastructure.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace JurisNexo.Infrastructure.Services;

public class SignalRInboxNotificationService : IInboxNotificationService
{
    private readonly IHubContext<InboxHub> _hubContext;

    public SignalRInboxNotificationService(IHubContext<InboxHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotifyNewMessageAsync(Guid tenantId, Message message, CancellationToken cancellationToken = default)
    {
        var dto = new MessageDto(
            message.Id,
            message.ConversationId,
            message.SenderType.ToString(),
            message.SenderId,
            message.Content,
            message.MessageType.ToString(),
            message.MediaUrl,
            message.IsRead,
            message.SentAt
        );

        await _hubContext.Clients
            .Group($"tenant:{tenantId}")
            .SendAsync("NewMessage", dto, cancellationToken);
    }
}
