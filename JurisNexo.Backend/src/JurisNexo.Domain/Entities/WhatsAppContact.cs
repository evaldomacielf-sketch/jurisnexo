using JurisNexo.Domain.Common;

namespace JurisNexo.Domain.Entities;

public class WhatsAppContact : TenantEntity
{
    public string WhatsAppId { get; set; } = string.Empty; // Full phone number or internal ID
    public string? ProfileName { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public string? SyncStatus { get; set; } // e.g., "Synced", "Pending"
    
    // CRM Linking
    public Guid? ContactId { get; set; }
    public virtual Contact? Contact { get; set; }
    
    // Metadata & Tags
    public string? TagsJson { get; set; } // Stored as JSON string
    public string? BusinessCategory { get; set; }
    public string? Description { get; set; }

    public DateTime LastSyncedAt { get; set; } = DateTime.UtcNow;
}
