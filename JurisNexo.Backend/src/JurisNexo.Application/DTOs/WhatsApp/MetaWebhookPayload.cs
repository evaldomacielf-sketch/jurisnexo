using System.Text.Json.Serialization;

namespace JurisNexo.Application.DTOs.WhatsApp;

public class MetaWebhookPayload
{
    [JsonPropertyName("object")]
    public string Object { get; set; } = string.Empty;

    [JsonPropertyName("entry")]
    public List<MetaWebhookEntry> Entry { get; set; } = new();
}

public class MetaWebhookEntry
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("changes")]
    public List<MetaWebhookChange> Changes { get; set; } = new();
}

public class MetaWebhookChange
{
    [JsonPropertyName("value")]
    public MetaWebhookValue Value { get; set; } = new();

    [JsonPropertyName("field")]
    public string Field { get; set; } = string.Empty;
}

public class MetaWebhookValue
{
    [JsonPropertyName("messaging_product")]
    public string MessagingProduct { get; set; } = "whatsapp";

    [JsonPropertyName("metadata")]
    public MetaWebhookMetadata? Metadata { get; set; }

    [JsonPropertyName("contacts")]
    public List<MetaWebhookContact>? Contacts { get; set; }

    [JsonPropertyName("messages")]
    public List<MetaWebhookMessage>? Messages { get; set; }

    [JsonPropertyName("statuses")]
    public List<MetaWebhookStatus>? Statuses { get; set; }
}

public class MetaWebhookMetadata
{
    [JsonPropertyName("display_phone_number")]
    public string DisplayPhoneNumber { get; set; } = string.Empty;

    [JsonPropertyName("phone_number_id")]
    public string PhoneNumberId { get; set; } = string.Empty;
}

public class MetaWebhookContact
{
    [JsonPropertyName("profile")]
    public MetaWebhookProfile Profile { get; set; } = new();

    [JsonPropertyName("wa_id")]
    public string WaId { get; set; } = string.Empty;
}

public class MetaWebhookProfile
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
}

public class MetaWebhookMessage
{
    [JsonPropertyName("from")]
    public string From { get; set; } = string.Empty;

    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("timestamp")]
    public string Timestamp { get; set; } = string.Empty;

    [JsonPropertyName("type")]
    public string Type { get; set; } = string.Empty;

    [JsonPropertyName("text")]
    public MetaWebhookText? Text { get; set; }

    [JsonPropertyName("image")]
    public MetaWebhookMedia? Image { get; set; }

    [JsonPropertyName("video")]
    public MetaWebhookMedia? Video { get; set; }

    [JsonPropertyName("audio")]
    public MetaWebhookMedia? Audio { get; set; }

    [JsonPropertyName("document")]
    public MetaWebhookMedia? Document { get; set; }
}

public class MetaWebhookText
{
    [JsonPropertyName("body")]
    public string Body { get; set; } = string.Empty;
}

public class MetaWebhookMedia
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("mime_type")]
    public string MimeType { get; set; } = string.Empty;

    [JsonPropertyName("sha256")]
    public string Sha256 { get; set; } = string.Empty;

    [JsonPropertyName("caption")]
    public string? Caption { get; set; }

    [JsonPropertyName("filename")]
    public string? FileName { get; set; }
}

public class MetaWebhookStatus
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty; // delivered, read, sent, failed

    [JsonPropertyName("recipient_id")]
    public string RecipientId { get; set; } = string.Empty;

    [JsonPropertyName("timestamp")]
    public string Timestamp { get; set; } = string.Empty;
}
