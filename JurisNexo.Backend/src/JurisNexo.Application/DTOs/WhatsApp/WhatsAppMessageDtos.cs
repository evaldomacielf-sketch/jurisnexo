using System.Text.Json.Serialization;

namespace JurisNexo.Application.DTOs.WhatsApp;

public record WhatsAppMessageData(
    [property: JsonPropertyName("key")] WhatsAppKey? Key,
    [property: JsonPropertyName("pushName")] string? PushName,
    [property: JsonPropertyName("message")] WhatsAppMessageContent? Message,
    [property: JsonPropertyName("messageTimestamp")] long? MessageTimestamp
);

public record WhatsAppKey(
    [property: JsonPropertyName("remoteJid")] string? RemoteJid,
    [property: JsonPropertyName("fromMe")] bool FromMe,
    [property: JsonPropertyName("id")] string? Id
);

public record WhatsAppMessageContent(
    [property: JsonPropertyName("conversation")] string? Conversation,
    [property: JsonPropertyName("extendedTextMessage")] ExtendedTextMessage? ExtendedTextMessage,
    [property: JsonPropertyName("imageMessage")] ImageMessage? ImageMessage,
    [property: JsonPropertyName("videoMessage")] VideoMessage? VideoMessage,
    [property: JsonPropertyName("documentMessage")] DocumentMessage? DocumentMessage,
    [property: JsonPropertyName("audioMessage")] AudioMessage? AudioMessage
);

public record ExtendedTextMessage(
    [property: JsonPropertyName("text")] string? Text
);

public record ImageMessage(
    [property: JsonPropertyName("caption")] string? Caption,
    [property: JsonPropertyName("url")] string? Url
);

public record VideoMessage(
    [property: JsonPropertyName("caption")] string? Caption,
    [property: JsonPropertyName("url")] string? Url
);

public record DocumentMessage(
    [property: JsonPropertyName("caption")] string? Caption,
    [property: JsonPropertyName("url")] string? Url
);

public record AudioMessage(
    [property: JsonPropertyName("url")] string? Url
);
