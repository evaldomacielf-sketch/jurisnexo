using JurisNexo.Core.Common;

namespace JurisNexo.Core.Entities;

public enum SenderType
{
    User,
    Contact
}

public enum MessageType
{
    Text,
    Image,
    Document,
    Audio,
    Video,
    Template
}

public class Message : BaseEntity
{
    public Guid ConversationId { get; set; }
    public SenderType SenderType { get; set; }
    public Guid SenderId { get; set; }
    public string Content { get; set; } = string.Empty;
    public MessageType MessageType { get; set; }
    public string? MediaUrl { get; set; }
    public bool IsRead { get; set; }
    public DateTime SentAt { get; set; }
    public string? WhatsappMessageId { get; set; }
    
    // Navigation properties
    public virtual Conversation Conversation { get; set; } = null!;
}
