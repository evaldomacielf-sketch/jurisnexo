using MediatR;
using JurisNexo.Application.DTOs;

namespace JurisNexo.Application.UseCases.Cases.CreateCase;

public record CreateCaseCommand(
    string Title,
    string Number,
    string Description,
    Guid ClientId,
    Guid? ResponsibleUserId,
    string? Court,
    DateTime? DistributionDate
) : IRequest<CaseDto>;
