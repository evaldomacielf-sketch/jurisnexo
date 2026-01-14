using JurisNexo.Domain.Common;

namespace JurisNexo.Domain.Entities;

public enum ContactSource
{
    Whatsapp,
    Website,
    Referral,
    Other
}

public class Contact : TenantEntity
{
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Cpf { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public ContactSource Source { get; set; }
    public List<string> Tags { get; set; } = new();
    public string? Notes { get; set; }
    public bool IsLead { get; set; }
    
    // Navigation properties
    public virtual ICollection<Interaction> Interactions { get; set; } = new List<Interaction>();
    public virtual ICollection<ContactDocument> Documents { get; set; } = new List<ContactDocument>();
    public virtual ICollection<Case> Cases { get; set; } = new List<Case>();
    public virtual ICollection<Conversation> Conversations { get; set; } = new List<Conversation>();
}
