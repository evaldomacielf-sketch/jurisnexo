using JurisNexo.Domain.Common;

namespace JurisNexo.Domain.Entities;

public enum WhatsAppSessionStatus
{
    Active,
    Expired,
    Closed
}

public class WhatsAppConversation : TenantEntity
{
    public string WhatsAppId { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public WhatsAppSessionStatus SessionStatus { get; set; }
    public DateTime? LastCustomerMessageAt { get; set; }
    public DateTime? LastMessageAt { get; set; }
    public DateTime? SessionExpiresAt { get; set; }
    public Guid? AssignedToUserId { get; set; }
    public bool IsBotEnabled { get; set; } = true;
    public string? LastMessage { get; set; }
    public int UnreadCount { get; set; }
    public bool IsArchived { get; set; }
    public bool IsMuted { get; set; }
    public string? TagsJson { get; set; }
    
    // Relationships
    public Guid? CaseId { get; set; }
    public virtual Case? Case { get; set; }

    // Navigation properties
    public virtual User? AssignedToUser { get; set; }
    public virtual ICollection<WhatsAppMessage> Messages { get; set; } = new List<WhatsAppMessage>();
}
