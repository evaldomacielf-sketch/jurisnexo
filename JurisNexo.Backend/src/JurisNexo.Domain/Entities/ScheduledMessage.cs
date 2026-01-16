using System;
using JurisNexo.Domain.Common;
using JurisNexo.Domain.Enums;

namespace JurisNexo.Domain.Entities
{
    public class ScheduledMessage : BaseEntity
    {
        public Guid ConversationId { get; set; }
        public Guid? CreatedByUserId { get; set; }
        public string Message { get; set; } = string.Empty;
        public DateTime ScheduledFor { get; set; }
        public bool RequestConfirmation { get; set; }
        public ScheduledMessageStatus Status { get; set; } = ScheduledMessageStatus.Pending;
        public DateTime? SentAt { get; set; }
        public DateTime? ConfirmedAt { get; set; }
        public DateTime? CancelledAt { get; set; }
        public string? ConfirmationResponse { get; set; }
        public string? ErrorMessage { get; set; }
        public string? Notes { get; set; }
        public int RetryCount { get; set; } = 0;
        public DateTime? NextRetryAt { get; set; }
        
        // Navigation properties
        public virtual WhatsAppConversation Conversation { get; set; } = null!;
        public virtual User? CreatedByUser { get; set; }
    }
}
