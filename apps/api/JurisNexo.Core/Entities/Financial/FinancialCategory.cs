using JurisNexo.Core.Common;

namespace JurisNexo.Core.Entities.Financial;

public class FinancialCategory : TenantEntity
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // INCOME or EXPENSE
    public string? Description { get; set; }
    public string Color { get; set; } = "#3b82f6"; // Hex color
    public string? Icon { get; set; }
    public bool IsActive { get; set; } = true;
    
    // Navigation
    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
