using JurisNexo.Core.Common;

namespace JurisNexo.Core.Entities;

public class WhatsAppMedia : TenantEntity
{
    public string WhatsAppMediaId { get; set; } = string.Empty;
    public string BlobStorageUrl { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string? FileName { get; set; }
    
    // Metadata JSON for flexibility (original dimensions, durations, etc.)
    public string? MetadataJson { get; set; }
    
    public DateTime? ExpiresAt { get; set; } // Temporary URL expiry
    public Guid? MessageId { get; set; }
    public virtual WhatsAppMessage? Message { get; set; }
    
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}
