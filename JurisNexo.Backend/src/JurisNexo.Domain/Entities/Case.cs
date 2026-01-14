using JurisNexo.Domain.Common;

namespace JurisNexo.Domain.Entities;

public enum CaseStatus
{
    Active,
    Pending,
    Closed,
    Archived
}

public class Case : TenantEntity
{
    public string? CaseNumber { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public CaseStatus Status { get; set; }
    public string? PracticeArea { get; set; }
    public bool IsUrgent { get; set; }
    public Guid? ClientId { get; set; }
    public Guid? ResponsibleLawyerId { get; set; }
    public List<string> Tags { get; set; } = new();
    
    // Navigation properties
    public virtual Contact? Client { get; set; }
    public virtual User? ResponsibleLawyer { get; set; }
    public virtual ICollection<CaseEvent> Events { get; set; } = new List<CaseEvent>();
}
