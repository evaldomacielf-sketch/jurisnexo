namespace JurisNexo.Application.DTOs.Case;

public record CreateCaseRequest(
    string? CaseNumber,
    string Title,
    string? Description,
    string Status,
    string? PracticeArea,
    bool IsUrgent,
    Guid? ClientId,
    Guid? ResponsibleLawyerId,
    List<string>? Tags
);
