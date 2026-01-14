using JurisNexo.Application.DTOs.WhatsApp;

namespace JurisNexo.Application.Common.Interfaces;

public interface IWhatsAppWebhookHandler
{
    Task HandleAsync(WhatsAppWebhookPayload payload, CancellationToken cancellationToken = default);
}
