using JurisNexo.Core.Entities.Financial;

namespace JurisNexo.Core.Interfaces;

public interface ITransactionRepository : ITenantRepository<Transaction>
{
    Task<(IEnumerable<Transaction> Items, int Total)> SearchAsync(
        Guid tenantId,
        DateTime? fromDate,
        DateTime? toDate,
        string? type,
        Guid? categoryId,
        Guid? bankAccountId,
        int page,
        int pageSize,
        CancellationToken cancellationToken);
        
    Task<FinancialDashboardStats> GetDashboardStatsAsync(
        Guid tenantId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken);
}

public record FinancialDashboardStats(decimal TotalIncome, decimal TotalExpense, decimal Balance, decimal Overdue);
