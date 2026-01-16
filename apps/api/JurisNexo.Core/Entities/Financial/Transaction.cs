using JurisNexo.Core.Common;

namespace JurisNexo.Core.Entities.Financial;

public class Transaction : TenantEntity
{
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public TransactionType Type { get; set; }
    public DateTime Date { get; set; }
    public Guid? CaseId { get; set; }
    public Guid? ClientId { get; set; }
    public Guid? InvoiceId { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    
    // Navigation
    public virtual Case? Case { get; set; }
    public virtual Contact? Client { get; set; }
    public virtual Invoice? Invoice { get; set; }
}

public enum TransactionType
{
    Income,
    Expense
}

public enum PaymentStatus
{
    Pending,
    Paid,
    Cancelled,
    Refunded
}
