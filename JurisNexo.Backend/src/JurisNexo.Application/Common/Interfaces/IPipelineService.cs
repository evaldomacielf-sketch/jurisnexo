using JurisNexo.Application.DTOs.Pipeline;
using JurisNexo.Application.DTOs.Lead;

namespace JurisNexo.Application.Common.Interfaces;

public interface IPipelineService
{
    Task<IEnumerable<PipelineDto>> GetPipelinesAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<PipelineDto?> GetPipelineBoardAsync(Guid tenantId, Guid pipelineId, CancellationToken cancellationToken = default);
    
    // Alias/Overload for Controller convenience if needed, essentially GetPipelineBoardAsync or GetById basic
    Task<PipelineDto?> GetPipelineAsync(Guid tenantId, Guid pipelineId, CancellationToken cancellationToken = default); 
    
    Task<PipelineMetricsDto> GetPipelineMetricsAsync(Guid tenantId, Guid pipelineId, CancellationToken cancellationToken = default);
    
    Task<PipelineDto> CreatePipelineAsync(Guid tenantId, CreatePipelineRequest request, CancellationToken cancellationToken = default);
    Task<PipelineDto> UpdatePipelineAsync(Guid tenantId, Guid pipelineId, UpdatePipelineRequest request, CancellationToken cancellationToken = default);
    Task DeletePipelineAsync(Guid tenantId, Guid pipelineId, CancellationToken cancellationToken = default);
    
    // Lead Management inside Pipeline context
    Task<LeadDto> CreateLeadAsync(Guid tenantId, Guid userId, CreateLeadRequest request, CancellationToken cancellationToken = default);
    Task MoveLeadAsync(Guid tenantId, Guid leadId, MoveLeadRequest request, CancellationToken cancellationToken = default);
}
