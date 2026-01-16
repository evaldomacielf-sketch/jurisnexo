using JurisNexo.Core.Common;

namespace JurisNexo.Core.Entities;

public class Stage : TenantEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Color { get; set; } = "#3b82f6";
    
    // Probabilidade padrão para leads neste estágio
    public int DefaultProbability { get; set; } = 50;
    
    // Pipeline associado
    public Guid PipelineId { get; set; }
    public virtual Pipeline Pipeline { get; set; } = null!;
    
    // Leads neste estágio
    public virtual ICollection<Lead> Leads { get; set; } = new List<Lead>();
    
    // Ordenação
    public int Position { get; set; }
    
    // Indicadores de estágio especial
    public bool IsInitialStage { get; set; }
    public bool IsWonStage { get; set; }
    public bool IsLostStage { get; set; }
}
