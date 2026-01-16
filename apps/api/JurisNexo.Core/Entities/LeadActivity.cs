using JurisNexo.Core.Common;

namespace JurisNexo.Core.Entities;

public enum ActivityType
{
    Call,
    Email,
    Meeting,
    Task,
    Note,
    StatusChange,
    StageChange,
    ValueChange,
    AssignmentChange
}

public class LeadActivity : TenantEntity
{
    public Guid LeadId { get; set; }
    public virtual Lead Lead { get; set; } = null!;
    
    public ActivityType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    
    public Guid CreatedByUserId { get; set; }
    public virtual User CreatedByUser { get; set; } = null!;
    
    public DateTime ActivityDate { get; set; }
    public int? DurationMinutes { get; set; }
    
    public DateTime? DueDate { get; set; }
    public bool Completed { get; set; }
    
    public Guid? AssignedToUserId { get; set; }
    public virtual User? AssignedToUser { get; set; }
    
    // Metadados específicos por tipo
    public Dictionary<string, object>? Metadata { get; set; }
}
