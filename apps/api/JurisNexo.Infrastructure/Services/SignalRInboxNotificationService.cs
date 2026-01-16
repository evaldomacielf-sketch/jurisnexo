using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Application.DTOs.Inbox;
using JurisNexo.Core.Entities;
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

    public async Task NotifyNewWhatsAppMessageAsync(Guid tenantId, WhatsAppMessage message, CancellationToken cancellationToken = default)
    {
        // Adapt WhatsAppMessage to MessageDto for unified inbox, or use "NewWhatsAppMessage" event
        // Using "NewWhatsAppMessage" allows frontend to handle it specifically if needed
        
        // Construct a DTO that fits the frontend expectation. 
        // Assuming frontend might reuse MessageDto or have a WhatsApp equivalent.
        // Let's use an anonymous object or a new DTO if needed, but for now I'll stick to a dynamic shape or standard DTO.
        // Since MessageDto expects specific enums (SenderType is string), we can map.
        
        var dto = new 
        {
            Id = message.Id,
            ConversationId = message.WhatsAppConversationId,
            SenderType = message.Direction == Core.Entities.WhatsAppDirection.Inbound ? "Customer" : "System", // Or "WhatsApp"
            SenderId = message.Direction == Core.Entities.WhatsAppDirection.Inbound ? (Guid?)null : Guid.Empty, // System
            Content = message.Content,
            MessageType = message.Type.ToString(),
            MediaUrl = message.MediaUrl,
            Status = message.Status.ToString(),
            SentAt = message.SentAt,
            IsWhatsApp = true
        };

        await _hubContext.Clients
            .Group($"tenant:{tenantId}")
            .SendAsync("NewWhatsAppMessage", dto, cancellationToken);
    }
}
