using System;
using JurisNexo.Domain.Common;

namespace JurisNexo.Domain.Entities
{
    public class AuditLog : BaseEntity
    {
        public string EntityType { get; set; } = string.Empty; // "WhatsAppMessage", "WhatsAppConversation", etc.
        public string EntityId { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty; // "MessageSent", "ConversationAssigned", etc.
        public Guid? UserId { get; set; }
        public string? Details { get; set; }
        public string? IpAddress { get; set; }
        public DateTime Timestamp { get; set; }
        public bool IsCritical { get; set; } // For sensitive actions
        public string? OldValue { get; set; } // For change tracking
        public string? NewValue { get; set; } // For change tracking
        public Guid? TenantId { get; set; }
        
        // Navigation properties
        public virtual User? User { get; set; }
    }
}
