using JurisNexo.Core.Entities;
using JurisNexo.Core.Interfaces;
using JurisNexo.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JurisNexo.Infrastructure.Repositories;

public class LeadRepository : Repository<Lead>, ILeadRepository
{
    public LeadRepository(ApplicationDbContext context) : base(context) { }

    public async Task<IEnumerable<Lead>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(l => l.TenantId == tenantId)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<(IEnumerable<Lead> Items, int Total)> SearchAsync(
        Guid tenantId,
        Guid? pipelineId,
        Guid? stageId,
        LeadStatus? status,
        LeadPriority? priority,
        Guid? assignedToUserId,
        string? search,
        int page,
        int limit,
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet
            .Include(l => l.Contact)
            .Include(l => l.Pipeline)
            .Include(l => l.Stage)
            .Include(l => l.AssignedToUser)
            .Where(l => l.TenantId == tenantId);

        if (pipelineId.HasValue)
        {
            query = query.Where(l => l.PipelineId == pipelineId.Value);
        }

        if (stageId.HasValue)
        {
            query = query.Where(l => l.StageId == stageId.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(l => l.Status == status.Value);
        }

        if (priority.HasValue)
        {
            query = query.Where(l => l.Urgency == priority.Value);
        }

        if (assignedToUserId.HasValue)
        {
            query = query.Where(l => l.AssignedToUserId == assignedToUserId.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(l =>
                l.Title.Contains(search) ||
                l.Description!.Contains(search) ||
                l.Contact.Name.Contains(search));
        }

        var total = await query.CountAsync(cancellationToken);
        
        var items = await query
            .OrderBy(l => l.Stage.Position)
            .ThenBy(l => l.Position)
            .Skip((page - 1) * limit)
            .Take(limit)
            .ToListAsync(cancellationToken);

        return (items, total);
    }

    public async Task<IEnumerable<Lead>> GetByStageAsync(
        Guid tenantId,
        Guid stageId,
        CancellationToken cancellationToken = default)
    {
        // Add Position property check in Stage later if needed, assuming Stage has Position.
        // Lead has Position.
        return await _dbSet
            .Include(l => l.Contact)
            .Include(l => l.AssignedToUser)
            .Where(l => l.TenantId == tenantId && l.StageId == stageId)
            .OrderBy(l => l.Position)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Lead>> GetByPipelineAsync(
        Guid tenantId,
        Guid pipelineId,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(l => l.Contact)
            .Include(l => l.Stage)
            .Include(l => l.AssignedToUser)
            .Where(l => l.TenantId == tenantId && l.PipelineId == pipelineId)
            .OrderBy(l => l.Stage.Position)
            .ThenBy(l => l.Position)
            .ToListAsync(cancellationToken);
    }

    public async Task UpdatePositionAsync(
        Guid leadId,
        int newPosition,
        CancellationToken cancellationToken = default)
    {
        var lead = await _dbSet.FindAsync(new object[] { leadId }, cancellationToken);
        if (lead != null)
        {
            lead.Position = newPosition;
            _dbSet.Update(lead);
        }
    }

    public async Task MoveToStageAsync(
        Guid leadId,
        Guid newStageId,
        int position,
        CancellationToken cancellationToken = default)
    {
        var lead = await _dbSet.FindAsync(new object[] { leadId }, cancellationToken);
        if (lead != null)
        {
            lead.StageId = newStageId;
            lead.Position = position;
            // lead.UpdatedAt = DateTime.UtcNow; // BaseEntity might handle this or database trigger, usually managed by context or interceptor.
            // Leaving explicit update if necessary, but checks if UpdatedAt exists on BaseEntity.
            // Checking BaseEntity via ILeadRepository -> ITenantRepository -> IRepository -> BaseEntity
            // Assuming it exists or Context handles it.
            // User code had it. I will keep it but verify properties.
            lead.UpdatedAt = DateTime.UtcNow;
            _dbSet.Update(lead);
        }
    }
}
