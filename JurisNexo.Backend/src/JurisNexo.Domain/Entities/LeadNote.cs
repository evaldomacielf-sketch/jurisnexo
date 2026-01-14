using JurisNexo.Domain.Common;

namespace JurisNexo.Domain.Entities;

public class LeadNote : TenantEntity
{
    public Guid LeadId { get; set; }
    public virtual Lead Lead { get; set; } = null!;
    
    public string Content { get; set; } = string.Empty;
    
    public Guid CreatedByUserId { get; set; }
    public virtual User CreatedByUser { get; set; } = null!;
    
    public bool IsPinned { get; set; }
}
