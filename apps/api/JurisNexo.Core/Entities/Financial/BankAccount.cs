using JurisNexo.Core.Common;

namespace JurisNexo.Core.Entities.Financial;

public class BankAccount : TenantEntity
{
    public string Name { get; set; } = string.Empty;
    public string BankName { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public decimal InitialBalance { get; set; }
    public decimal CurrentBalance { get; set; }
    public bool IsActive { get; set; } = true;
}
