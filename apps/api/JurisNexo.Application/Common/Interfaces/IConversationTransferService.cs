using System;
using System.Threading.Tasks;

namespace JurisNexo.Application.Common.Interfaces
{
    public interface IConversationTransferService
    {
        /// <summary>
        /// Transfer conversation to another lawyer
        /// </summary>
        Task<TransferResult> TransferConversationAsync(
            Guid conversationId,
            Guid fromUserId,
            Guid toUserId,
            string reason);
        
        /// <summary>
        /// Get transfer history for a conversation
        /// </summary>
        Task<IEnumerable<TransferHistoryDto>> GetTransferHistoryAsync(Guid conversationId);
        
        /// <summary>
        /// Get available lawyers for transfer
        /// </summary>
        Task<IEnumerable<AvailableLawyerDto>> GetAvailableLawyersAsync(Guid currentUserId);
    }

    public class TransferResult
    {
        public bool Success { get; set; }
        public string? Error { get; set; }
        public Guid? TransferId { get; set; }
    }

    public class TransferHistoryDto
    {
        public Guid Id { get; set; }
        public string FromUserName { get; set; } = string.Empty;
        public string ToUserName { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public DateTime TransferredAt { get; set; }
    }

    public class AvailableLawyerDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public int CurrentLoad { get; set; }
        public bool IsAvailable { get; set; }
    }
}
