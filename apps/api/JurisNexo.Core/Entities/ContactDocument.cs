using JurisNexo.Core.Common;

namespace JurisNexo.Core.Entities;

public class ContactDocument : BaseEntity
{
    public Guid ContactId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public long Size { get; set; }
    public string MimeType { get; set; } = string.Empty;
    public Guid UploadedBy { get; set; }
    
    // Navigation properties
    public virtual Contact Contact { get; set; } = null!;
    public virtual User UploadedByUser { get; set; } = null!;
}
