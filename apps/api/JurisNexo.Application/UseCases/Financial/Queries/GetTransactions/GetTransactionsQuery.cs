using MediatR;
using JurisNexo.Application.Common.Models;

namespace JurisNexo.Application.UseCases.Financial.Queries.GetTransactions;

public record GetTransactionsQuery : IRequest<PaginatedResponse<TransactionDto>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
    public string? Type { get; init; } // INCOME, EXPENSE
    public Guid? CategoryId { get; init; }
    public Guid? BankAccountId { get; init; }
    public Guid TenantId { get; init; }
}
