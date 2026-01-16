using System;
using System.Collections.Generic;

namespace JurisNexo.Application.DTOs.Pipeline;

public record PipelineDto(
    Guid Id,
    Guid TenantId,
    string Name,
    string? Description,
    string Color,
    bool IsActive,
    bool IsDefault,
    List<StageDto> Stages,
    int Position,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record StageDto(
    Guid Id,
    string Name,
    string? Description,
    string Color,
    int DefaultProbability,
    int Position,
    bool IsInitialStage,
    bool IsWonStage,
    bool IsLostStage,
    int LeadCount,
    decimal TotalValue
);

public record CreatePipelineRequest(
    string Name,
    string? Description,
    string Color,
    bool IsDefault,
    List<CreateStageRequest> Stages
);

public record CreateStageRequest(
    string Name,
    string? Description,
    string Color,
    int DefaultProbability,
    bool IsInitialStage,
    bool IsWonStage,
    bool IsLostStage
);

public record UpdatePipelineRequest(
    string Name,
    string? Description,
    string Color,
    bool IsActive,
    bool IsDefault
);

public record PipelineMetricsDto(
    Guid PipelineId,
    string PipelineName,
    int TotalLeads,
    decimal TotalValue,
    int WonLeads,
    decimal WonValue,
    int LostLeads,
    decimal LostValue,
    decimal ConversionRate,
    decimal AverageDealSize,
    int AverageDaysToClose,
    List<StageMetricsDto> StageMetrics
);

public record StageMetricsDto(
    Guid StageId,
    string StageName,
    int LeadCount,
    decimal TotalValue,
    decimal ConversionToNextStage,
    int AverageDaysInStage
);
