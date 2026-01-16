using MediatR;
using JurisNexo.Application.DTOs;

namespace JurisNexo.Application.UseCases.Cases.CreateCase;

public record CreateCaseCommand(
    string Title,
    string? CaseNumber,
    string? Description,
    Guid? ClientId,
    Guid? ResponsibleLawyerId,
    string? PracticeArea,
    bool IsUrgent = false,
    List<string>? Tags = null
) : IRequest<CaseDto>;
