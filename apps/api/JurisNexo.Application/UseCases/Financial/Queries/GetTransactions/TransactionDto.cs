using JurisNexo.Core.Entities.Financial;

namespace JurisNexo.Application.UseCases.Financial.Queries.GetTransactions;

public class TransactionDto
{
    public Guid Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Type { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? CategoryName { get; set; }
    public string? CategoryColor { get; set; }
    public string? BankAccountName { get; set; }
}
