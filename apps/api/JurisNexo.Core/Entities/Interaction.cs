using JurisNexo.Core.Common;

namespace JurisNexo.Core.Entities;

public enum InteractionType
{
    Whatsapp,
    Call,
    Email,
    Meeting,
    Note
}

public class Interaction : BaseEntity
{
    public Guid ContactId { get; set; }
    public InteractionType Type { get; set; }
    public string? Content { get; set; }
    public Guid? UserId { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }
    
    // Navigation properties
    public virtual Contact Contact { get; set; } = null!;
    public virtual User? User { get; set; }
}
