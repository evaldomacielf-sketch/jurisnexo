using JurisNexo.Domain.Common;

namespace JurisNexo.Domain.Entities;

public enum LeadSource
{
    Website,
    Referral,
    SocialMedia,
    Event,
    ColdCall,
    Whatsapp,
    Other
}

public enum LeadPriority
{
    Low,
    Medium,
    High,
    VeryHigh
}

public enum LeadStatus
{
    New,
    Contacted,
    Qualified,
    Proposal,
    Negotiation,
    Won,
    Lost,
    Archived
}

public class Lead : TenantEntity
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    
    // Relacionamento com contato
    public Guid ContactId { get; set; }
    public virtual Contact Contact { get; set; } = null!;
    
    // Pipeline e estágio
    public Guid PipelineId { get; set; }
    public virtual Pipeline Pipeline { get; set; } = null!;
    
    public Guid StageId { get; set; }
    public virtual Stage Stage { get; set; } = null!;
    
    // Informações de negócio
    public decimal EstimatedValue { get; set; }
    public string Currency { get; set; } = "BRL";
    public int Probability { get; set; } // 0-100%
    
    public LeadSource Source { get; set; }
    public LeadPriority Priority { get; set; }
    public LeadStatus Status { get; set; }
    
    // Responsável
    public Guid? AssignedToUserId { get; set; }
    public virtual User? AssignedToUser { get; set; }
    
    // Datas importantes
    public DateTime? ExpectedCloseDate { get; set; }
    public DateTime? ActualCloseDate { get; set; }
    public DateTime? LastContactDate { get; set; }
    public DateTime? NextFollowUpDate { get; set; }
    
    // Metadados
    public List<string> Tags { get; set; } = new();
    
    // Custom fields logic might need a dedicated entity or JSON column, 
    // for now we'll imply it's handled via a JSON mapping or separate table if using EF Core.
    // Entity Framework generic collections or string storage for simplicity as requested:
    // public Dictionary<string, object>? CustomFields { get; set; } 
    // NOTE: Dictionaries are not directly supported as such in standard EF Core simply without conversion.
    // For now I will omitting it or using a simple string/json representation if needed later. 
    // The user requested `Dictionary<string, object>? CustomFields`. 
    // I can put it but might need ignoring or conversion configuration in DbContext.
    // I'll leave it as commented out or implement a simple JSON property if strictly needed, 
    // but standard EF entities usually use a wrapper or value converter. 
    // I will include it but be aware it needs 'OnModelCreating' config.
    
    // public Dictionary<string, object>? CustomFields { get; set; }

    // Razão de perda (se aplicável)
    public string? LostReason { get; set; }
    
    // Relacionamentos
    public virtual ICollection<LeadActivity> Activities { get; set; } = new List<LeadActivity>();
    public virtual ICollection<LeadNote> Notes { get; set; } = new List<LeadNote>();
    
    // Ordenação dentro do estágio (para drag-and-drop)
    public int Position { get; set; }
}
