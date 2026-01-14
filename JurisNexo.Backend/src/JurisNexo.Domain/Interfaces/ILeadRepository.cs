using JurisNexo.Domain.Entities;

namespace JurisNexo.Domain.Interfaces;

public interface ILeadRepository : ITenantRepository<Lead>
{
    Task<(IEnumerable<Lead> Items, int Total)> SearchAsync(
        Guid tenantId,
        Guid? pipelineId,
        Guid? stageId,
        LeadStatus? status,
        LeadPriority? priority,
        Guid? assignedToUserId,
        string? search,
        int page,
        int limit,
        CancellationToken cancellationToken = default);
    
    Task<IEnumerable<Lead>> GetByStageAsync(
        Guid tenantId,
        Guid stageId,
        CancellationToken cancellationToken = default);
    
    Task<IEnumerable<Lead>> GetByPipelineAsync(
        Guid tenantId,
        Guid pipelineId,
        CancellationToken cancellationToken = default);
    
    Task UpdatePositionAsync(
        Guid leadId,
        int newPosition,
        CancellationToken cancellationToken = default);
    
    Task MoveToStageAsync(
        Guid leadId,
        Guid newStageId,
        int position,
        CancellationToken cancellationToken = default);
}
