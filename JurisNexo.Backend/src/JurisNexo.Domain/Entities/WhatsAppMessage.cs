using JurisNexo.Domain.Common;

namespace JurisNexo.Domain.Entities;

public enum WhatsAppMessageStatus
{
    Sent,
    Delivered,
    Read,
    Failed
}

public enum WhatsAppDirection
{
    Inbound,
    Outbound
}

public enum WhatsAppMessageType
{
    Text,
    Image,
    Video,
    Audio,
    Document,
    Location,
    Template,
    Interactive,
    Button,
    Unknown
}

public class WhatsAppMessage : BaseEntity
{
    public Guid WhatsAppConversationId { get; set; }
    public string WhatsAppMessageId { get; set; } = string.Empty;
    public string ProviderMessageId { get; set; } = string.Empty; // Alias for WhatsAppMessageId if needed, or replace
    // Handler uses ProviderMessageId. Existing entity has WhatsAppMessageId.
    // I'll add ProviderMessageId property or map it.
    // Let's add ProviderMessageId just in case, or rename WhatsAppMessageId to ProviderMessageId?
    // Handler sets `ProviderMessageId = ...`.
    // I'll add ProviderMessageId property.
    public WhatsAppDirection Direction { get; set; }
    public string Content { get; set; } = string.Empty;
    public WhatsAppMessageType Type { get; set; }
    public string? MediaUrl { get; set; }
    public string? MediaType { get; set; } // MIME type
    public string? MetadataJson { get; set; }
    public WhatsAppMessageStatus Status { get; set; }
    public DateTime SentAt { get; set; }

    // Navigation properties
    public virtual WhatsAppConversation WhatsAppConversation { get; set; } = null!;
}
