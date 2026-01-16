using System;
using System.Threading.Tasks;

namespace JurisNexo.Application.Common.Interfaces
{
    public interface ILGPDConsentService
    {
        /// <summary>
        /// Request consent from a contact (first interaction)
        /// </summary>
        Task<bool> RequestConsentAsync(Guid contactId);
        
        /// <summary>
        /// Process consent response from contact
        /// </summary>
        Task<ConsentResult> ProcessConsentResponseAsync(Guid contactId, string message);
        
        /// <summary>
        /// Revoke consent for a contact
        /// </summary>
        Task RevokeConsentAsync(Guid contactId);
        
        /// <summary>
        /// Export all contact data (LGPD right)
        /// </summary>
        Task<byte[]> ExportContactDataAsync(Guid contactId);
        
        /// <summary>
        /// Check if contact has valid consent
        /// </summary>
        Task<bool> HasValidConsentAsync(Guid contactId);
        
        /// <summary>
        /// Get consent status for a contact
        /// </summary>
        Task<ConsentStatusDto> GetConsentStatusAsync(Guid contactId);
    }

    public class ConsentResult
    {
        public bool Success { get; set; }
        public ConsentAction Action { get; set; }
        public string? Message { get; set; }
    }

    public enum ConsentAction
    {
        Granted,
        Denied,
        Revoked,
        Pending,
        InvalidResponse
    }

    public class ConsentStatusDto
    {
        public Domain.Enums.ConsentStatus Status { get; set; }
        public DateTime? RequestedAt { get; set; }
        public DateTime? GrantedAt { get; set; }
        public DateTime? DeniedAt { get; set; }
        public DateTime? RevokedAt { get; set; }
        public bool IsValid { get; set; }
    }
}
