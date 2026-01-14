namespace JurisNexo.Application.DTOs.Case;

public record CaseDto(
    Guid Id,
    Guid TenantId,
    string? CaseNumber,
    string Title,
    string? Description,
    string Status,
    string? PracticeArea,
    bool IsUrgent,
    ClientInfoDto? Client,
    LawyerInfoDto? ResponsibleLawyer,
    List<string> Tags,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record ClientInfoDto(
    Guid Id,
    string Name,
    string? Phone
);

public record LawyerInfoDto(
    Guid Id,
    string Name,
    string Email
);
