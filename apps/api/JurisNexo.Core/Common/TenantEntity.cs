using JurisNexo.Core.Entities;

namespace JurisNexo.Core.Common;

public abstract class TenantEntity : BaseEntity
{
    public Guid TenantId { get; set; }
    public virtual Tenant Tenant { get; set; } = null!;
}
