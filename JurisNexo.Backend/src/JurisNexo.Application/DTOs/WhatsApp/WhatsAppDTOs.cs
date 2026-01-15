using Microsoft.AspNetCore.Http;
using System.Text.Json.Serialization;

namespace JurisNexo.Application.DTOs.WhatsApp;

public class WhatsAppConversationDto
{
    public Guid Id { get; set; }
    public string CustomerPhone { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? LastMessage { get; set; }
    public DateTime? LastMessageAt { get; set; }
    public int UnreadCount { get; set; }
    public bool IsArchived { get; set; }
    public List<string> Tags { get; set; } = new();
    public bool IsBotEnabled { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class WhatsAppMessageDto
{
    public Guid Id { get; set; }
    public Guid ConversationId { get; set; }
    public string Content { get; set; } = string.Empty;
    public string Direction { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public string? MediaUrl { get; set; }
    public string? MediaType { get; set; }
}

public class WhatsAppTemplateDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Language { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
}

public class WhatsAppContactDetailsDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public List<string> Tags { get; set; } = new();
    public Dictionary<string, string> CustomFields { get; set; } = new();
}

public class WhatsAppAnalyticsDto
{
    public int ActiveConversations { get; set; }
    public int MessagesSent { get; set; }
    public int MessagesReceived { get; set; }
    public double ResponseRate { get; set; }
    public TimeSpan AvgResponseTime { get; set; }
    public List<TemplateStatDto> TopTemplates { get; set; } = new();
    public List<TimeSeriesDataDto> MessageVolume { get; set; } = new();
}

public class TemplateStatDto
{
    public string Name { get; set; } = string.Empty;
    public int UsageCount { get; set; }
}

public class TimeSeriesDataDto
{
    public DateTime Date { get; set; }
    public int Count { get; set; }
}

public record SendMessageRequest(string Content);
public record SendMediaMessageRequest(IFormFile File, string? Caption);
public record SendTemplateRequest(string TemplateId, Dictionary<string, string> Variables);
public record AddTagRequest(string TagName);
