using Microsoft.EntityFrameworkCore;
using JurisNexo.Domain.Entities;
using JurisNexo.Domain.Interfaces;
using JurisNexo.Infrastructure.Data;

namespace JurisNexo.Infrastructure.Repositories;

public class ContactRepository : Repository<Contact>, IContactRepository
{
    public ContactRepository(ApplicationDbContext context) : base(context) { }

    public async Task<Contact?> GetByPhoneAsync(Guid tenantId, string phone, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(c => c.TenantId == tenantId && c.Phone == phone, cancellationToken);
    }

    public async Task<(IEnumerable<Contact> Items, int Total)> SearchAsync(
        Guid tenantId,
        string? search,
        ContactSource? source,
        bool? isLead,
        int page,
        int limit,
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet.Where(c => c.TenantId == tenantId);

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(c =>
                c.Name.Contains(search) ||
                c.Phone.Contains(search) ||
                (c.Email != null && c.Email.Contains(search)));
        }

        if (source.HasValue)
        {
            query = query.Where(c => c.Source == source.Value);
        }

        if (isLead.HasValue)
        {
            query = query.Where(c => c.IsLead == isLead.Value);
        }

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * limit)
            .Take(limit)
            .ToListAsync(cancellationToken);

        return (items, total);
    }

    public async Task<IEnumerable<Contact>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(c => c.TenantId == tenantId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync(cancellationToken);
    }
}
