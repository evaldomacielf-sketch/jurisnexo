using System.Text.Json.Serialization;

namespace JurisNexo.Application.DTOs.WhatsApp;

public class TwilioWebhookData
{
    public string? From { get; set; }
    public string? To { get; set; }
    public string? Body { get; set; }
    public string? MessageSid { get; set; }
    public int NumMedia { get; set; }
    public string? MediaUrl0 { get; set; }
    public string? MediaContentType0 { get; set; }
}
