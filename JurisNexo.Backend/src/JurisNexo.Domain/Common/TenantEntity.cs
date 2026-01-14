using JurisNexo.Domain.Entities;

namespace JurisNexo.Domain.Common;

public abstract class TenantEntity : BaseEntity
{
    public Guid TenantId { get; set; }
    public virtual Tenant Tenant { get; set; } = null!;
}
