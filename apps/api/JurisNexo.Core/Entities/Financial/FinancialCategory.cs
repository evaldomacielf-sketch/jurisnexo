using JurisNexo.Core.Common;

namespace JurisNexo.Core.Entities.Financial;

public class FinancialCategory : TenantEntity
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // INCOME or EXPENSE
    public string Color { get; set; } = "blue";
    public string? Description { get; set; }
}
