using JurisNexo.Domain.Entities;

namespace JurisNexo.Domain.Interfaces;

public interface IPipelineRepository : ITenantRepository<Pipeline>
{
    Task<Pipeline?> GetBoardAsync(Guid tenantId, Guid pipelineId, CancellationToken cancellationToken = default);
    Task<Pipeline?> GetWithStagesAsync(Guid pipelineId, CancellationToken cancellationToken = default);
    Task<Pipeline?> GetDefaultPipelineAsync(Guid tenantId, CancellationToken cancellationToken = default);
}
