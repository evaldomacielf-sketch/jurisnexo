using JurisNexo.Domain.Common;

namespace JurisNexo.Domain.Entities;

public enum CaseEventType
{
    Hearing,
    Deadline,
    DocumentFiled,
    StatusChange,
    Note,
    Other
}

public class CaseEvent : BaseEntity
{
    public Guid CaseId { get; set; }
    public CaseEventType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime EventDate { get; set; }
    public Guid CreatedBy { get; set; }
    
    // Navigation properties
    public virtual Case Case { get; set; } = null!;
    public virtual User CreatedByUser { get; set; } = null!;
}
