using JurisNexo.Core.Common;

namespace JurisNexo.Core.Entities.Financial;

public class PaymentMethod : TenantEntity
{
    public string Name { get; set; } = string.Empty;
    public PaymentMethodType Type { get; set; }
    public bool IsActive { get; set; } = true;
    public string? GatewayId { get; set; }
    public string? GatewayConfig { get; set; }
}

public enum PaymentMethodType
{
    Cash,
    BankTransfer,
    CreditCard,
    DebitCard,
    Pix,
    Boleto
}
