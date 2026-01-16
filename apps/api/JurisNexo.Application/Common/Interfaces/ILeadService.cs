using JurisNexo.Application.Common.Models;
using JurisNexo.Application.DTOs.Lead;

namespace JurisNexo.Application.Common.Interfaces;

public interface ILeadService
{
    Task<PaginatedResponse<LeadDto>> GetLeadsAsync(
        Guid tenantId,
        Guid? pipelineId,
        Guid? stageId,
        string? status,
        string? priority,
        Guid? assignedToUserId,
        string? search,
        int page,
        int limit,
        CancellationToken cancellationToken = default);
    
    Task<LeadDto?> GetLeadAsync(Guid leadId, CancellationToken cancellationToken = default);
    
    Task<LeadDto> CreateLeadAsync(
        Guid tenantId,
        CreateLeadRequest request,
        Guid createdByUserId,
        CancellationToken cancellationToken = default);
    
    Task<LeadDto> UpdateLeadAsync(
        Guid leadId,
        UpdateLeadRequest request,
        CancellationToken cancellationToken = default);
    
    Task DeleteLeadAsync(Guid leadId, CancellationToken cancellationToken = default);
    
    Task<LeadDto> MoveLeadAsync(
        Guid leadId,
        MoveLeadRequest request,
        Guid movedByUserId,
        CancellationToken cancellationToken = default);
    
    Task<List<LeadActivityDto>> GetLeadActivitiesAsync(
        Guid leadId,
        CancellationToken cancellationToken = default);
    
    Task<LeadActivityDto> AddActivityAsync(
        Guid leadId,
        CreateLeadActivityRequest request,
        Guid createdByUserId,
        CancellationToken cancellationToken = default);
    
    Task<LeadDto> MarkAsWonAsync(
        Guid leadId,
        decimal actualValue,
        Guid updatedByUserId,
        CancellationToken cancellationToken = default);
    
    Task<LeadDto> MarkAsLostAsync(
        Guid leadId,
        string reason,
        Guid updatedByUserId,
        CancellationToken cancellationToken = default);
}
