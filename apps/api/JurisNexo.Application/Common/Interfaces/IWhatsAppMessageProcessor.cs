using JurisNexo.Application.DTOs.WhatsApp;

namespace JurisNexo.Application.Common.Interfaces;

public interface IWhatsAppMessageProcessor
{
    Task ProcessIncomingMessageAsync(TwilioWebhookData data);
    Task ProcessIncomingMessageAsync(MetaWebhookMessage message);
    Task ProcessMessageStatusAsync(MetaWebhookStatus status);
}
