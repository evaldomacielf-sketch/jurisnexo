using MediatR;
using JurisNexo.Core.Entities.Financial;

namespace JurisNexo.Application.UseCases.Financial.Commands.CreateTransaction;

public record CreateTransactionCommand : IRequest<Guid>
{
    public string Description { get; init; } = string.Empty;
    public decimal Amount { get; init; }
    public string Type { get; init; } = string.Empty; // INCOME, EXPENSE
    public DateTime Date { get; init; }
    public Guid? CategoryId { get; init; }
    public Guid? BankAccountId { get; init; }
    public string Status { get; init; } = "Pending";
    public Guid TenantId { get; init; }
}
