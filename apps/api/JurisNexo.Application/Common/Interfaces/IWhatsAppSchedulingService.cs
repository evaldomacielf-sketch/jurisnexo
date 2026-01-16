using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace JurisNexo.Application.Common.Interfaces
{
    public interface IWhatsAppSchedulingService
    {
        /// <summary>
        /// Create a scheduled message
        /// </summary>
        Task<Guid> CreateScheduledMessageAsync(
            Guid conversationId,
            string message,
            DateTime scheduledFor,
            Guid? createdByUserId = null,
            bool requestConfirmation = false);
        
        /// <summary>
        /// Cancel a scheduled message
        /// </summary>
        Task<bool> CancelScheduledMessageAsync(Guid scheduledMessageId);
        
        /// <summary>
        /// Get scheduled messages for a conversation
        /// </summary>
        Task<IEnumerable<ScheduledMessageDto>> GetScheduledMessagesAsync(Guid conversationId);
        
        /// <summary>
        /// Process a confirmation response
        /// </summary>
        Task<bool> ProcessConfirmationResponseAsync(Guid conversationId, string response);
        
        /// <summary>
        /// Get pending confirmations for a conversation
        /// </summary>
        Task<IEnumerable<ScheduledMessageDto>> GetPendingConfirmationsAsync(Guid conversationId);

        /// <summary>
        /// Process due messages and send them
        /// </summary>
        Task ProcessDueMessagesAsync(CancellationToken cancellationToken);
    }

    public class ScheduledMessageDto
    {
        public Guid Id { get; set; }
        public Guid ConversationId { get; set; }
        public string Message { get; set; } = string.Empty;
        public DateTime ScheduledFor { get; set; }
        public bool RequestConfirmation { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? SentAt { get; set; }
        public DateTime? ConfirmedAt { get; set; }
        public string? CreatedByUserName { get; set; }
    }
}
