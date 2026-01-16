using System;
using System.Collections.Generic;

namespace JurisNexo.Application.DTOs.Lead;

public record LeadDto(
    Guid Id,
    Guid TenantId,
    string Title,
    string? Description,
    Guid ContactId,
    ContactInfoDto Contact,
    Guid PipelineId,
    string PipelineName,
    Guid StageId,
    StageInfoDto Stage,
    decimal EstimatedValue,
    string Currency,
    int Probability,
    string Source,
    string Priority,
    string Status,
    Guid? AssignedToUserId,
    UserInfoDto? AssignedToUser,
    DateTime? ExpectedCloseDate,
    DateTime? ActualCloseDate,
    DateTime? LastContactDate,
    DateTime? NextFollowUpDate,
    List<string> Tags,
    int Position,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record ContactInfoDto(
    Guid Id,
    string Name,
    string Phone,
    string? Email
);

public record StageInfoDto(
    Guid Id,
    string Name,
    string Color,
    int Position
);

public record UserInfoDto(
    Guid Id,
    string Name,
    string Email,
    string? AvatarUrl
);

public record CreateLeadRequest(
    string Title,
    string? Description,
    Guid ContactId,
    Guid PipelineId,
    Guid StageId,
    decimal EstimatedValue,
    string Currency,
    int Probability,
    string Source,
    string Priority,
    Guid? AssignedToUserId,
    DateTime? ExpectedCloseDate,
    DateTime? NextFollowUpDate,
    List<string>? Tags
);

public record UpdateLeadRequest(
    string? Title,
    string? Description,
    decimal? EstimatedValue,
    int? Probability,
    string? Priority,
    Guid? AssignedToUserId,
    DateTime? ExpectedCloseDate,
    DateTime? NextFollowUpDate,
    List<string>? Tags
);

public record MoveLeadRequest(
    Guid SourceStageId,
    Guid TargetStageId,
    int Position
);

public record LeadActivityDto(
    Guid Id,
    string Type,
    string Title,
    string? Description,
    UserInfoDto CreatedBy,
    DateTime ActivityDate,
    int? DurationMinutes,
    DateTime CreatedAt
);

public record CreateLeadActivityRequest(
    string Type,
    string Title,
    string? Description,
    DateTime ActivityDate,
    int? DurationMinutes
);

public record MarkAsWonRequest(decimal ActualValue);
public record MarkAsLostRequest(string Reason);
