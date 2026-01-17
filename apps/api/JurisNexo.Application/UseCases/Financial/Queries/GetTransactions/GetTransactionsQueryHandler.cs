using MediatR;
using JurisNexo.Application.DTOs;
using JurisNexo.Core.Interfaces;
using JurisNexo.Application.Common.Models;
using JurisNexo.Core.Interfaces;

namespace JurisNexo.Application.UseCases.Financial.Queries.GetTransactions;

public class GetTransactionsQueryHandler : IRequestHandler<GetTransactionsQuery, PaginatedResponse<TransactionDto>>
{
    private readonly ITransactionRepository _transactionRepository;

    public GetTransactionsQueryHandler(ITransactionRepository transactionRepository)
    {
        _transactionRepository = transactionRepository;
    }

    public async Task<PaginatedResponse<TransactionDto>> Handle(GetTransactionsQuery request, CancellationToken cancellationToken)
    {
        var (items, total) = await _transactionRepository.SearchAsync(
            request.TenantId,
            request.FromDate,
            request.ToDate,
            request.Type,
            request.CategoryId,
            request.BankAccountId,
            request.PageNumber,
            request.PageSize,
            cancellationToken
        );

        var dtos = items.Select(t => new TransactionDto
        {
            Id = t.Id,
            Description = t.Description,
            Amount = t.Amount,
            Type = t.Type.ToString(),
            Date = t.Date,
            Status = t.Status.ToString(),
            CategoryName = t.Category?.Name,
            CategoryColor = t.Category?.Color, // Assuming Color exists on Category
            BankAccountName = t.BankAccount?.Name
        });

        var totalPages = (int)Math.Ceiling(total / (double)request.PageSize);
        var metadata = new PaginationMetadata(request.PageNumber, request.PageSize, total, totalPages);
        
        return new PaginatedResponse<TransactionDto>(dtos, metadata);
    }
}
