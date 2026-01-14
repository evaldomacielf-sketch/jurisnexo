using JurisNexo.Domain.Common;

namespace JurisNexo.Domain.Entities;

public enum ConversationStatus
{
    Open,
    Pending,
    Closed
}

public enum ConversationPriority
{
    Urgent,
    High,
    Normal,
    Low
}

public class Conversation : TenantEntity
{
    public Guid ContactId { get; set; }
    public int UnreadCount { get; set; }
    public ConversationStatus Status { get; set; }
    public ConversationPriority Priority { get; set; }
    public Guid? AssignedToUserId { get; set; }
    public string? WhatsappChatId { get; set; }
    public DateTime? LastMessageAt { get; set; }
    
    // Navigation properties
    public virtual Contact Contact { get; set; } = null!;
    public virtual User? AssignedToUser { get; set; }
    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();
}
