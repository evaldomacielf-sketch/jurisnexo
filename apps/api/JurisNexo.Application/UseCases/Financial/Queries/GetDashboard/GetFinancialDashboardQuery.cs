using MediatR;
using JurisNexo.Core.Interfaces;

namespace JurisNexo.Application.UseCases.Financial.Queries.GetDashboard;

public record GetFinancialDashboardQuery(Guid TenantId, DateTime StartDate, DateTime EndDate) : IRequest<FinancialDashboardStats>;

public class GetFinancialDashboardQueryHandler : IRequestHandler<GetFinancialDashboardQuery, FinancialDashboardStats>
{
    private readonly ITransactionRepository _transactionRepository;

    public GetFinancialDashboardQueryHandler(ITransactionRepository transactionRepository)
    {
        _transactionRepository = transactionRepository;
    }

    public async Task<FinancialDashboardStats> Handle(GetFinancialDashboardQuery request, CancellationToken cancellationToken)
    {
        return await _transactionRepository.GetDashboardStatsAsync(
            request.TenantId, 
            request.StartDate, 
            request.EndDate, 
            cancellationToken);
    }
}
