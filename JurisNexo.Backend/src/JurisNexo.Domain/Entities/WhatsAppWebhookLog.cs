using JurisNexo.Domain.Common;

namespace JurisNexo.Domain.Entities;

public class WhatsAppWebhookLog : TenantEntity
{
    public string Provider { get; set; } = string.Empty; // Twilio, Meta
    public string EventType { get; set; } = string.Empty;
    public string Payload { get; set; } = string.Empty;
    public DateTime ReceivedAt { get; set; } = DateTime.UtcNow;
    public bool Processed { get; set; }
    public string? ErrorMessage { get; set; }
}
