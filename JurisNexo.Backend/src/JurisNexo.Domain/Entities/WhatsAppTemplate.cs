using JurisNexo.Domain.Common;

namespace JurisNexo.Domain.Entities;

public enum WhatsAppTemplateStatus
{
    Pending,
    Approved,
    Rejected
}

public class WhatsAppTemplate : TenantEntity
{
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Language { get; set; } = "pt_BR";
    public string Content { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public WhatsAppTemplateStatus Status { get; set; }
    public string? ExternalId { get; set; } // ID in Twilio/Meta
    public string? ComponentsJson { get; set; } // Body, Buttons, Header with variables
}
