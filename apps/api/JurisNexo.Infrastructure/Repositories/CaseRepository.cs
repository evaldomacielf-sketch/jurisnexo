using Microsoft.EntityFrameworkCore;
using JurisNexo.Core.Entities;
using JurisNexo.Core.Interfaces;
using JurisNexo.Infrastructure.Data;

namespace JurisNexo.Infrastructure.Repositories;

public class CaseRepository : Repository<Case>, ICaseRepository
{
    public CaseRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Case>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await _context.Set<Case>()
            .Where(c => c.TenantId == tenantId)
            .ToListAsync(cancellationToken);
    }
    public async Task<(IEnumerable<Case> Items, int Total)> SearchAsync(
        Guid tenantId,
        string? search,
        CaseStatus? status,
        string? practiceArea,
        Guid? clientId,
        Guid? lawyerId,
        bool? isUrgent,
        int page,
        int limit,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Set<Case>()
            .Include(c => c.Client)
            .Include(c => c.ResponsibleLawyer)
            .Where(c => c.TenantId == tenantId);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(c => 
                c.Title.ToLower().Contains(searchLower) ||
                c.CaseNumber.Contains(searchLower) ||
                c.Description.ToLower().Contains(searchLower));
        }

        if (status.HasValue)
        {
            query = query.Where(c => c.Status == status.Value);
        }

        if (!string.IsNullOrWhiteSpace(practiceArea))
        {
            query = query.Where(c => c.PracticeArea == practiceArea);
        }

        if (clientId.HasValue)
        {
            query = query.Where(c => c.ClientId == clientId.Value);
        }

        if (lawyerId.HasValue)
        {
            query = query.Where(c => c.ResponsibleLawyerId == lawyerId.Value);
        }

        if (isUrgent.HasValue)
        {
            query = query.Where(c => c.IsUrgent == isUrgent.Value);
        }

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * limit)
            .Take(limit)
            .ToListAsync(cancellationToken);

        return (items, total);
    }

    public async Task<Case?> GetByCaseNumberAsync(Guid tenantId, string caseNumber, CancellationToken cancellationToken = default)
    {
        return await _context.Set<Case>()
            .Include(c => c.Client)
            .Include(c => c.ResponsibleLawyer)
            .FirstOrDefaultAsync(c => c.TenantId == tenantId && c.CaseNumber == caseNumber, cancellationToken);
    }
}
