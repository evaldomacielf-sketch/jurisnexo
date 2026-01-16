using JurisNexo.Core.Common;

namespace JurisNexo.Core.Entities;

public class Pipeline : TenantEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Color { get; set; } = "#3b82f6";
    public bool IsActive { get; set; } = true;
    public bool IsDefault { get; set; }
    
    // Relacionamentos
    public virtual ICollection<Stage> Stages { get; set; } = new List<Stage>();
    public virtual ICollection<Lead> Leads { get; set; } = new List<Lead>();
    
    // Ordenação
    public int Position { get; set; }
}
