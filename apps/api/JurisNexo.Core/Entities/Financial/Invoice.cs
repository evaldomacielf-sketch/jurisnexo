using JurisNexo.Core.Common;

namespace JurisNexo.Core.Entities.Financial;

public class Invoice : TenantEntity
{
    public string Number { get; set; } = string.Empty;
    public Guid ClientId { get; set; }
    public Guid? CaseId { get; set; }
    public decimal Amount { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount => Amount + TaxAmount;
    public DateTime IssueDate { get; set; }
    public DateTime DueDate { get; set; }
    public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;
    public string? Notes { get; set; }
    
    // Navigation
    public virtual Contact Client { get; set; } = null!;
    public virtual Case? Case { get; set; }
    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}

public enum InvoiceStatus
{
    Draft,
    Sent,
    Paid,
    Overdue,
    Cancelled
}
