using JurisNexo.Domain.Entities;
using JurisNexo.Domain.Interfaces;
using JurisNexo.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JurisNexo.Infrastructure.Repositories;

public class PipelineRepository : Repository<Pipeline>, IPipelineRepository
{
    public PipelineRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Pipeline?> GetBoardAsync(Guid tenantId, Guid pipelineId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(p => p.Stages)
                .ThenInclude(s => s.Leads)
                    .ThenInclude(l => l.Contact)
            .Include(p => p.Stages)
                .ThenInclude(s => s.Leads)
                    .ThenInclude(l => l.AssignedToUser)
            .FirstOrDefaultAsync(p => p.Id == pipelineId && p.TenantId == tenantId, cancellationToken);
    }

    public async Task<IEnumerable<Pipeline>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(p => p.TenantId == tenantId)
            .OrderBy(p => p.Position)
            .ToListAsync(cancellationToken);
    }

    public async Task<Pipeline?> GetWithStagesAsync(Guid pipelineId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(p => p.Stages.OrderBy(s => s.Position))
            .FirstOrDefaultAsync(p => p.Id == pipelineId, cancellationToken);
    }

    public async Task<Pipeline?> GetDefaultPipelineAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(p => p.Stages.OrderBy(s => s.Position))
            .FirstOrDefaultAsync(p => p.TenantId == tenantId && p.IsDefault, cancellationToken);
    }
}
