using System.Text.Json.Serialization;

namespace JurisNexo.Application.DTOs.WhatsApp;

public record WhatsAppWebhookPayload(
    [property: JsonPropertyName("event")] string Event,
    [property: JsonPropertyName("instance")] string Instance,
    [property: JsonPropertyName("data")] WhatsAppMessageData Data,
    [property: JsonPropertyName("sender")] string Sender
);
