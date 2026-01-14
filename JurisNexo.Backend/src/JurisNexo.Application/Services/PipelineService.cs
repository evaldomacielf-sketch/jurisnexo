using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Application.Common.Exceptions;
using JurisNexo.Application.DTOs.Pipeline;
using JurisNexo.Application.DTOs.Lead;
using JurisNexo.Domain.Entities;
using JurisNexo.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JurisNexo.Application.Services;

public class PipelineService : IPipelineService
{
    private readonly IPipelineRepository _pipelineRepository;
    private readonly ILeadRepository _leadRepository;
    private readonly IRepository<Stage> _stageRepository;
    private readonly IUnitOfWork _unitOfWork;

    public PipelineService(
        IPipelineRepository pipelineRepository,
        ILeadRepository leadRepository,
        IRepository<Stage> stageRepository,
        IUnitOfWork unitOfWork)
    {
        _pipelineRepository = pipelineRepository;
        _leadRepository = leadRepository;
        _stageRepository = stageRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<PipelineDto>> GetPipelinesAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var pipelines = await _pipelineRepository.GetByTenantIdAsync(tenantId, cancellationToken);
        // Map basic info
        return pipelines.Select(p => MapToPipelineDto(p)).ToList();
    }

    public async Task<PipelineDto?> GetPipelineAsync(Guid tenantId, Guid pipelineId, CancellationToken cancellationToken = default)
    {
        // Reusing GetPipelineBoardAsync logic to include stages/leads as requested by controller usage "Busca pipeline por ID com seus estágios"
        return await GetPipelineBoardAsync(tenantId, pipelineId, cancellationToken);
    }

    public async Task<PipelineDto?> GetPipelineBoardAsync(Guid tenantId, Guid pipelineId, CancellationToken cancellationToken = default)
    {
        var pipeline = await _pipelineRepository.GetBoardAsync(tenantId, pipelineId, cancellationToken);
        
        if (pipeline == null || pipeline.TenantId != tenantId) return null;

        return MapToPipelineDto(pipeline, includeLeads: true);
    }

    public async Task<PipelineMetricsDto> GetPipelineMetricsAsync(Guid tenantId, Guid pipelineId, CancellationToken cancellationToken = default)
    {
         var pipeline = await _pipelineRepository.GetBoardAsync(tenantId, pipelineId, cancellationToken)
            ?? throw new NotFoundException("Pipeline not found");

        if (pipeline.TenantId != tenantId) throw new NotFoundException("Pipeline not found");

        var allLeads = pipeline.Stages.SelectMany(s => s.Leads).ToList();
        
        var totalLeads = allLeads.Count;
        var totalValue = allLeads.Sum(l => l.EstimatedValue);
        
        var wonLeads = allLeads.Count(l => l.Status == LeadStatus.Won);
        var wonValue = allLeads.Where(l => l.Status == LeadStatus.Won).Sum(l => l.EstimatedValue);
        
        var lostLeads = allLeads.Count(l => l.Status == LeadStatus.Lost);
        var lostValue = allLeads.Where(l => l.Status == LeadStatus.Lost).Sum(l => l.EstimatedValue);
        
        var conversionRate = totalLeads > 0 ? (decimal)wonLeads / totalLeads * 100 : 0;
        var avgDealSize = wonLeads > 0 ? wonValue / wonLeads : 0;
        
        // Mocking days calculation for now as we don't track historical stage entry times deeply in this MVP
        // In real app, we'd query LeadActivity or history table.
        var avgDaysToClose = 0; 

        var stageMetrics = pipeline.Stages.OrderBy(s => s.Position).Select(s => new StageMetricsDto(
            s.Id,
            s.Name,
            s.Leads.Count,
            s.Leads.Sum(l => l.EstimatedValue),
            0, // Conversion to next stage needs history/funnel analysis
            0 // Avg days in stage needs history
        )).ToList();

        return new PipelineMetricsDto(
            pipeline.Id,
            pipeline.Name,
            totalLeads,
            totalValue,
            wonLeads,
            wonValue,
            lostLeads,
            lostValue,
            conversionRate,
            avgDealSize,
            avgDaysToClose,
            stageMetrics
        );
    }
    
    // ... Existing methods (MapToPipelineDto, CreatePipelineAsync etc) below ...
    // RE-INCLUDED FOR COMPLETENESS because I am overwriting the file.

    private PipelineDto MapToPipelineDto(Pipeline pipeline, bool includeLeads = false)
    {
        var stages = pipeline.Stages?.OrderBy(s => s.Position)
            .Select(s => MapStageDto(s, pipeline, includeLeads))
            .ToList() ?? new List<StageDto>();

        return new PipelineDto(
            pipeline.Id,
            pipeline.TenantId,
            pipeline.Name,
            pipeline.Description,
            pipeline.Color,
            pipeline.IsActive,
            pipeline.IsDefault,
            stages,
            pipeline.Position,
            pipeline.CreatedAt,
            pipeline.UpdatedAt
        );
    }
    
    private StageDto MapStageDto(Stage stage, Pipeline pipeline, bool includeLeads)
    {
        var leads = stage.Leads ?? new List<Lead>();
        var leadCount = leads.Count;
        var totalValue = leads.Sum(l => l.EstimatedValue);
        
        return new StageDto(
            stage.Id,
            stage.Name,
            stage.Description,
            stage.Color,
            stage.DefaultProbability,
            stage.Position,
            stage.IsInitialStage,
            stage.IsWonStage,
            stage.IsLostStage,
            leadCount,
            totalValue
        );
    }

    private LeadDto MapLeadToDto(Lead lead, Pipeline pipeline, Stage stage)
    {
         return new LeadDto(
            lead.Id,
            lead.TenantId,
            lead.Title,
            lead.Description,
            lead.ContactId,
            new ContactInfoDto(lead.ContactId, lead.Contact?.Name ?? "Unknown", lead.Contact?.Phone ?? "", lead.Contact?.Email), 
            lead.PipelineId,
            pipeline.Name,
            lead.StageId,
            new StageInfoDto(stage.Id, stage.Name, stage.Color, stage.Position),
            lead.EstimatedValue,
            "BRL",
            stage.DefaultProbability,
            "Manual",
            lead.Priority.ToString(),
            lead.Status.ToString(),
            lead.AssignedToUserId,
            lead.AssignedToUser != null ? new UserInfoDto(lead.AssignedToUser.Id, lead.AssignedToUser.Name, lead.AssignedToUser.Email, null) : null,
            null, null, null, null,
            lead.Tags ?? new List<string>(),
            lead.Position,
            lead.CreatedAt,
            lead.UpdatedAt
        );
    }

    public async Task<PipelineDto> CreatePipelineAsync(Guid tenantId, CreatePipelineRequest request, CancellationToken cancellationToken = default)
    {
        var pipeline = new Pipeline
        {
            TenantId = tenantId,
            Name = request.Name,
            Description = request.Description,
            Color = request.Color,
            IsDefault = request.IsDefault,
            IsActive = true
        };
        
        if (request.Stages != null && request.Stages.Any())
        {
            foreach (var stageReq in request.Stages)
            {
                pipeline.Stages.Add(new Stage
                {
                    Name = stageReq.Name,
                    Description = stageReq.Description,
                    Color = stageReq.Color,
                    DefaultProbability = stageReq.DefaultProbability,
                    IsInitialStage = stageReq.IsInitialStage,
                    IsWonStage = stageReq.IsWonStage,
                    IsLostStage = stageReq.IsLostStage,
                    TenantId = tenantId
                });
            }
        }

        await _pipelineRepository.AddAsync(pipeline, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToPipelineDto(pipeline);
    }

    public async Task<PipelineDto> UpdatePipelineAsync(Guid tenantId, Guid pipelineId, UpdatePipelineRequest request, CancellationToken cancellationToken = default)
    {
        var pipeline = await _pipelineRepository.GetByIdAsync(pipelineId, cancellationToken);
        if (pipeline == null || pipeline.TenantId != tenantId)
            throw new NotFoundException("Pipeline not found");

        pipeline.Name = request.Name;
        pipeline.Description = request.Description;
        pipeline.Color = request.Color;
        pipeline.IsActive = request.IsActive;
        pipeline.IsDefault = request.IsDefault;

        await _pipelineRepository.UpdateAsync(pipeline, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToPipelineDto(pipeline);
    }

    public async Task DeletePipelineAsync(Guid tenantId, Guid pipelineId, CancellationToken cancellationToken = default)
    {
        var pipeline = await _pipelineRepository.GetByIdAsync(pipelineId, cancellationToken);
        if (pipeline == null || pipeline.TenantId != tenantId)
            throw new NotFoundException("Pipeline not found");

        await _pipelineRepository.DeleteAsync(pipelineId, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<LeadDto> CreateLeadAsync(Guid tenantId, Guid userId, CreateLeadRequest request, CancellationToken cancellationToken = default)
    {
        // Re-implementing logic or delegating... 
        // NOTE: Usage of ILeadService might be preferred for specialized Lead logic, 
        // but User requested this in PipelineService previously.
        // It duplicates some logic from LeadService. 
        // Given I am overwriting PipelineService, I will keep it functional.
        
        var lead = new Lead
        {
            TenantId = tenantId,
            Title = request.Title,
            EstimatedValue = request.EstimatedValue,
            PipelineId = request.PipelineId,
            StageId = request.StageId,
            ContactId = request.ContactId,
            AssignedToUserId = request.AssignedToUserId ?? userId,
            Tags = request.Tags ?? new List<string>(),
            Priority = request.Priority != null ? Enum.Parse<LeadPriority>(request.Priority) : LeadPriority.Medium
        };

        if (lead.Tags == null) lead.Tags = new List<string>();

        await _leadRepository.AddAsync(lead, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        
        var pipeline = await _pipelineRepository.GetByIdAsync(request.PipelineId, cancellationToken);
        var stage = await _stageRepository.GetByIdAsync(request.StageId, cancellationToken); 
        
        if (pipeline == null) return null!; 
        if (stage == null) return null!;

        return MapLeadToDto(lead, pipeline, stage);
    }

    public async Task MoveLeadAsync(Guid tenantId, Guid leadId, MoveLeadRequest request, CancellationToken cancellationToken = default)
    {
         await _leadRepository.MoveToStageAsync(leadId, request.TargetStageId, request.Position, cancellationToken);
         await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
