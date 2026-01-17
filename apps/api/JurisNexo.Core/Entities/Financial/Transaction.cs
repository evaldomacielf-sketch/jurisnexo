using JurisNexo.Core.Common;

namespace JurisNexo.Core.Entities.Financial;

public class Transaction : TenantEntity
{
    // Core fields
    public string Description { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "BRL";
    public TransactionType Type { get; set; }
    public DateTime Date { get; set; }
    
    // Relationships
    public Guid? CaseId { get; set; }
    public Guid? ClientId { get; set; }
    public Guid? InvoiceId { get; set; }
    public Guid? CategoryId { get; set; }
    public Guid? BankAccountId { get; set; }
    public Guid? CreatedByUserId { get; set; }
    
    // Payment details
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public PaymentMethodType? PaymentMethod { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? PaidDate { get; set; }
    
    // Invoice info
    public string? InvoiceNumber { get; set; }
    public string? InvoiceUrl { get; set; }
    
    // Tags (stored as JSON)
    public string TagsJson { get; set; } = "[]";
    
    [System.ComponentModel.DataAnnotations.Schema.NotMapped]
    public List<string> Tags => 
        string.IsNullOrEmpty(TagsJson) 
            ? new List<string>() 
            : System.Text.Json.JsonSerializer.Deserialize<List<string>>(TagsJson) ?? new List<string>();
    
    // Navigation properties
    public virtual FinancialCategory? Category { get; set; }
    public virtual BankAccount? BankAccount { get; set; }
    public virtual Case? Case { get; set; }
    public virtual Contact? Client { get; set; }
    public virtual Invoice? Invoice { get; set; }
    public virtual User? CreatedByUser { get; set; }
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
    Overdue,
    Cancelled,
    Refunded
}

