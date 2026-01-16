using System;
using JurisNexo.Core.Common;

namespace JurisNexo.Core.Entities
{
    public class ConversationTransfer : BaseEntity
    {
        public Guid ConversationId { get; set; }
        public Guid FromUserId { get; set; }
        public Guid ToUserId { get; set; }
        public string Reason { get; set; } = string.Empty;
        public DateTime TransferredAt { get; set; }
        public string? Notes { get; set; }
        
        // Navigation properties
        public virtual WhatsAppConversation Conversation { get; set; } = null!;
        public virtual User FromUser { get; set; } = null!;
        public virtual User ToUser { get; set; } = null!;
    }
}
