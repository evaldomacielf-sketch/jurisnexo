using JurisNexo.Core.Entities.Financial;
using JurisNexo.Core.Interfaces;
using JurisNexo.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JurisNexo.Infrastructure.Repositories;

public class TransactionRepository : Repository<Transaction>, ITransactionRepository
{
    private readonly ApplicationDbContext _context;

    public TransactionRepository(ApplicationDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Transaction>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        // Global filter handles tenantId usually, but explicit check ensures safety if filter disabled
        return await _dbSet.Where(t => t.TenantId == tenantId).ToListAsync(cancellationToken);
    }

    public async Task<(IEnumerable<Transaction> Items, int Total)> SearchAsync(
        Guid tenantId,
        DateTime? fromDate,
        DateTime? toDate,
        string? type,
        Guid? categoryId,
        Guid? bankAccountId,
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var query = _context.Transactions
            .Include(t => t.Category)
            .Include(t => t.BankAccount)
            .Where(t => t.TenantId == tenantId)
            .AsNoTracking();

        if (fromDate.HasValue)
            query = query.Where(t => t.Date >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(t => t.Date <= toDate.Value);

        if (!string.IsNullOrEmpty(type) && Enum.TryParse<TransactionType>(type, true, out var typeEnum))
            query = query.Where(t => t.Type == typeEnum);
            
        if (categoryId.HasValue)
            query = query.Where(t => t.CategoryId == categoryId.Value);
            
        if (bankAccountId.HasValue)
            query = query.Where(t => t.BankAccountId == bankAccountId.Value);

        // Sorting by newest first
        query = query.OrderByDescending(t => t.Date);

        var total = await query.CountAsync(cancellationToken);
        
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, total);
    }
    
    public async Task<FinancialDashboardStats> GetDashboardStatsAsync(
        Guid tenantId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken)
    {
        var transactions = await _context.Transactions
            .Where(t => t.TenantId == tenantId && 
                        t.Date >= startDate && 
                        t.Date <= endDate && 
                        t.Status != PaymentStatus.Cancelled &&
                        t.Status != PaymentStatus.Refunded)
            .Select(t => new { t.Type, t.Amount, t.Status })
            .ToListAsync(cancellationToken);
            
        var income = transactions.Where(t => t.Type == TransactionType.Income).Sum(t => t.Amount);
        var expense = transactions.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount);
        
        var overdue = await _context.Transactions
            .Where(t => t.TenantId == tenantId && 
                        t.Date < DateTime.UtcNow.Date && 
                        t.Status == PaymentStatus.Pending)
            .SumAsync(t => t.Amount, cancellationToken);
            
        return new FinancialDashboardStats(income, expense, income - expense, overdue);
    }
}
