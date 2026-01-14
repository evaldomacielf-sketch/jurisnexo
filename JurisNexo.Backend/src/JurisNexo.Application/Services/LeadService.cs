using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using JurisNexo.Application.Common.Exceptions;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Application.Common.Models;
using JurisNexo.Application.DTOs.Lead;
using JurisNexo.Domain.Entities;
using JurisNexo.Domain.Interfaces;

namespace JurisNexo.Application.Services;

public class LeadService : ILeadService
{
    private readonly ILeadRepository _leadRepository;
    private readonly IPipelineRepository _pipelineRepository;
    private readonly IContactRepository _contactRepository;
    private readonly IRepository<LeadActivity> _activityRepository;
    private readonly IRepository<Stage> _stageRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<LeadService> _logger;

    public LeadService(
        ILeadRepository leadRepository,
        IPipelineRepository pipelineRepository,
        IContactRepository contactRepository,
        IRepository<LeadActivity> activityRepository,
        IRepository<Stage> stageRepository,
        IUnitOfWork unitOfWork,
        ILogger<LeadService> logger)
    {
        _leadRepository = leadRepository;
        _pipelineRepository = pipelineRepository;
        _contactRepository = contactRepository;
        _activityRepository = activityRepository;
        _stageRepository = stageRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<PaginatedResponse<LeadDto>> GetLeadsAsync(
        Guid tenantId,
        Guid? pipelineId,
        Guid? stageId,
        string? status,
        string? priority,
        Guid? assignedToUserId,
        string? search,
        int page,
        int limit,
        CancellationToken cancellationToken = default)
    {
        LeadStatus? statusEnum = status != null ? Enum.Parse<LeadStatus>(status, true) : null;
        LeadPriority? priorityEnum = priority != null ? Enum.Parse<LeadPriority>(priority, true) : null;

        var (items, total) = await _leadRepository.SearchAsync(
            tenantId,
            pipelineId,
            stageId,
            statusEnum,
            priorityEnum,
            assignedToUserId,
            search,
            page,
            limit,
            cancellationToken);

        var dtos = items.Select(MapToLeadDto).ToList();
        var totalPages = (int)Math.Ceiling(total / (double)limit);

        return new PaginatedResponse<LeadDto>(
            dtos,
            new PaginationMetadata(page, limit, total, totalPages)
        );
    }

    public async Task<LeadDto?> GetLeadAsync(Guid leadId, CancellationToken cancellationToken = default)
    {
        var lead = await _leadRepository.GetByIdAsync(leadId, cancellationToken);
        if (lead == null) return null; // Or throw

        return MapToLeadDto(lead);
    }

    public async Task<LeadDto> CreateLeadAsync(
        Guid tenantId,
        CreateLeadRequest request,
        Guid createdByUserId,
        CancellationToken cancellationToken = default)
    {
        // Validar contato
        var contact = await _contactRepository.GetByIdAsync(request.ContactId, cancellationToken)
            ?? throw new NotFoundException("Contato não encontrado");

        // Validar pipeline e stage
        var pipeline = await _pipelineRepository.GetWithStagesAsync(request.PipelineId, cancellationToken)
            ?? throw new NotFoundException("Pipeline não encontrado");

        var stage = pipeline.Stages.FirstOrDefault(s => s.Id == request.StageId)
            ?? throw new NotFoundException("Estágio não encontrado");

        // Obter posição máxima no estágio
        var leadsInStage = await _leadRepository.GetByStageAsync(tenantId, request.StageId, cancellationToken);
        var maxPosition = leadsInStage.Any() ? leadsInStage.Max(l => l.Position) : 0;

        // Criar lead
        var lead = new Lead
        {
            TenantId = tenantId,
            Title = request.Title,
            Description = request.Description,
            ContactId = request.ContactId,
            PipelineId = request.PipelineId,
            StageId = request.StageId,
            EstimatedValue = request.EstimatedValue,
            Currency = request.Currency,
            Probability = request.Probability,
            Source = Enum.Parse<LeadSource>(request.Source, true),
            Priority = Enum.Parse<LeadPriority>(request.Priority, true),
            Status = LeadStatus.New,
            AssignedToUserId = request.AssignedToUserId,
            ExpectedCloseDate = request.ExpectedCloseDate,
            NextFollowUpDate = request.NextFollowUpDate,
            Tags = request.Tags ?? new List<string>(),
            Position = maxPosition + 1
        };

        await _leadRepository.AddAsync(lead, cancellationToken);
        
        // Registrar atividade de criação
        var activity = new LeadActivity
        {
            LeadId = lead.Id,
            Type = ActivityType.StatusChange,
            Title = "Lead criado",
            Description = $"Lead criado no estágio {stage.Name}",
            CreatedByUserId = createdByUserId,
            ActivityDate = DateTime.UtcNow
        };
        await _activityRepository.AddAsync(activity, cancellationToken);
        
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToLeadDto(lead);
    }

    public async Task<LeadDto> UpdateLeadAsync(
        Guid leadId,
        UpdateLeadRequest request,
        CancellationToken cancellationToken = default)
    {
        var lead = await _leadRepository.GetByIdAsync(leadId, cancellationToken)
            ?? throw new NotFoundException("Lead não encontrado");

        if (request.Title != null) lead.Title = request.Title;
        if (request.Description != null) lead.Description = request.Description;
        if (request.EstimatedValue.HasValue) lead.EstimatedValue = request.EstimatedValue.Value;
        if (request.Probability.HasValue) lead.Probability = request.Probability.Value;
        if (request.Priority != null) lead.Priority = Enum.Parse<LeadPriority>(request.Priority, true);
        if (request.AssignedToUserId.HasValue) lead.AssignedToUserId = request.AssignedToUserId.Value;
        if (request.ExpectedCloseDate.HasValue) lead.ExpectedCloseDate = request.ExpectedCloseDate.Value;
        if (request.NextFollowUpDate.HasValue) lead.NextFollowUpDate = request.NextFollowUpDate.Value;
        if (request.Tags != null) lead.Tags = request.Tags;

        await _leadRepository.UpdateAsync(lead, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToLeadDto(lead);
    }

    public async Task DeleteLeadAsync(Guid leadId, CancellationToken cancellationToken = default)
    {
        await _leadRepository.DeleteAsync(leadId, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<LeadDto> MoveLeadAsync(
        Guid leadId,
        MoveLeadRequest request,
        Guid movedByUserId,
        CancellationToken cancellationToken = default)
    {
        var lead = await _leadRepository.GetByIdAsync(leadId, cancellationToken)
            ?? throw new NotFoundException("Lead não encontrado");

        var oldStageId = lead.StageId;
        var oldStage = await _stageRepository.GetByIdAsync(oldStageId, cancellationToken);
        var newStage = await _stageRepository.GetByIdAsync(request.TargetStageId, cancellationToken)
            ?? throw new NotFoundException("Estágio de destino não encontrado");

        // Mover lead
        await _leadRepository.MoveToStageAsync(leadId, request.TargetStageId, request.Position, cancellationToken);
        
        // Refresh local entity stage for mapping/logic if needed, though MoveToStageAsync generally handles DB.
        // But we need to update memory object to return correct DTO if not reloading.
        lead.StageId = request.TargetStageId;
        lead.Position = request.Position;

        // Atualizar probabilidade baseada no estágio
        lead.Probability = newStage.DefaultProbability;

        // Registrar atividade
        var activity = new LeadActivity
        {
            LeadId = leadId,
            Type = ActivityType.StageChange,
            Title = "Lead movido",
            Description = $"Lead movido de {oldStage?.Name ?? "Unknown"} para {newStage.Name}",
            CreatedByUserId = movedByUserId,
            ActivityDate = DateTime.UtcNow
        };
        await _activityRepository.AddAsync(activity, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToLeadDto(lead);
    }

    public async Task<List<LeadActivityDto>> GetLeadActivitiesAsync(
        Guid leadId,
        CancellationToken cancellationToken = default)
    {
        var lead = await _leadRepository.GetByIdAsync(leadId, cancellationToken)
            ?? throw new NotFoundException("Lead não encontrado");

        // TODO: Implementar query específica para activities
        return lead.Activities.Select(MapToActivityDto).ToList();
    }

    public async Task<LeadActivityDto> AddActivityAsync(
        Guid leadId,
        CreateLeadActivityRequest request,
        Guid createdByUserId,
        CancellationToken cancellationToken = default)
    {
        var lead = await _leadRepository.GetByIdAsync(leadId, cancellationToken)
            ?? throw new NotFoundException("Lead não encontrado");

        var activity = new LeadActivity
        {
            LeadId = leadId,
            Type = Enum.Parse<ActivityType>(request.Type, true),
            Title = request.Title,
            Description = request.Description,
            CreatedByUserId = createdByUserId,
            ActivityDate = request.ActivityDate,
            DurationMinutes = request.DurationMinutes
        };

        await _activityRepository.AddAsync(activity, cancellationToken);
        
        // Atualizar última data de contato
        lead.LastContactDate = DateTime.UtcNow;
        await _leadRepository.UpdateAsync(lead, cancellationToken);
        
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToActivityDto(activity);
    }

    public async Task<LeadDto> MarkAsWonAsync(
        Guid leadId,
        decimal actualValue,
        Guid updatedByUserId,
        CancellationToken cancellationToken = default)
    {
        var lead = await _leadRepository.GetByIdAsync(leadId, cancellationToken)
            ?? throw new NotFoundException("Lead não encontrado");

        var pipeline = await _pipelineRepository.GetWithStagesAsync(lead.PipelineId, cancellationToken);
        var wonStage = pipeline?.Stages.FirstOrDefault(s => s.IsWonStage)
            ?? throw new NotFoundException("Estágio 'Ganho' não encontrado");

        lead.Status = LeadStatus.Won;
        lead.StageId = wonStage.Id;
        lead.ActualCloseDate = DateTime.UtcNow;
        lead.EstimatedValue = actualValue;
        lead.Probability = 100;

        var activity = new LeadActivity
        {
            LeadId = leadId,
            Type = ActivityType.StatusChange,
            Title = "Lead ganho",
            Description = $"Lead marcado como ganho com valor de {actualValue:C}",
            CreatedByUserId = updatedByUserId,
            ActivityDate = DateTime.UtcNow
        };
        await _activityRepository.AddAsync(activity, cancellationToken);

        await _leadRepository.UpdateAsync(lead, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToLeadDto(lead);
    }

    public async Task<LeadDto> MarkAsLostAsync(
        Guid leadId,
        string reason,
        Guid updatedByUserId,
        CancellationToken cancellationToken = default)
    {
        var lead = await _leadRepository.GetByIdAsync(leadId, cancellationToken)
            ?? throw new NotFoundException("Lead não encontrado");

        var pipeline = await _pipelineRepository.GetWithStagesAsync(lead.PipelineId, cancellationToken);
        var lostStage = pipeline?.Stages.FirstOrDefault(s => s.IsLostStage)
            ?? throw new NotFoundException("Estágio 'Perdido' não encontrado");

        lead.Status = LeadStatus.Lost;
        lead.StageId = lostStage.Id;
        lead.ActualCloseDate = DateTime.UtcNow;
        lead.LostReason = reason;
        lead.Probability = 0;

        var activity = new LeadActivity
        {
            LeadId = leadId,
            Type = ActivityType.StatusChange,
            Title = "Lead perdido",
            Description = $"Lead marcado como perdido. Razão: {reason}",
            CreatedByUserId = updatedByUserId,
            ActivityDate = DateTime.UtcNow
        };
        await _activityRepository.AddAsync(activity, cancellationToken);

        await _leadRepository.UpdateAsync(lead, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToLeadDto(lead);
    }

    // Mapping methods
    private static LeadDto MapToLeadDto(Lead lead)
    {
        return new LeadDto(
            lead.Id,
            lead.TenantId,
            lead.Title,
            lead.Description,
            lead.ContactId,
            new ContactInfoDto(
                lead.Contact?.Id ?? Guid.Empty,
                lead.Contact?.Name ?? "Unknown",
                lead.Contact?.Phone ?? "",
                lead.Contact?.Email
            ),
            lead.PipelineId,
            lead.Pipeline?.Name ?? "Unknown",
            lead.StageId,
            new StageInfoDto(
                lead.Stage?.Id ?? Guid.Empty,
                lead.Stage?.Name ?? "Unknown",
                lead.Stage?.Color ?? "#000000",
                lead.Stage?.Position ?? 0
            ),
            lead.EstimatedValue,
            lead.Currency,
            lead.Probability,
            lead.Source.ToString(),
            lead.Priority.ToString(),
            lead.Status.ToString(),
            lead.AssignedToUserId,
            lead.AssignedToUser != null ? new UserInfoDto(
                lead.AssignedToUser.Id,
                lead.AssignedToUser.Name,
                lead.AssignedToUser.Email,
                lead.AssignedToUser.AvatarUrl
            ) : null,
            lead.ExpectedCloseDate,
            lead.ActualCloseDate,
            lead.LastContactDate,
            lead.NextFollowUpDate,
            lead.Tags,
            lead.Position,
            lead.CreatedAt,
            lead.UpdatedAt
        );
    }

    private static LeadActivityDto MapToActivityDto(LeadActivity activity)
    {
        return new LeadActivityDto(
            activity.Id,
            activity.Type.ToString(),
            activity.Title,
            activity.Description,
            new UserInfoDto(
                activity.CreatedByUser?.Id ?? Guid.Empty,
                activity.CreatedByUser?.Name ?? "System",
                activity.CreatedByUser?.Email ?? "",
                activity.CreatedByUser?.AvatarUrl
            ),
            activity.ActivityDate,
            activity.DurationMinutes,
            activity.CreatedAt
        );
    }
}
