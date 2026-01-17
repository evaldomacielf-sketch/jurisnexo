using MediatR;
using JurisNexo.Application.DTOs;
using JurisNexo.Core.Interfaces;
using JurisNexo.Core.Entities;

namespace JurisNexo.Application.UseCases.Cases.ListCases;

public class ListCasesQueryHandler : IRequestHandler<ListCasesQuery, PaginatedResult<CaseDto>>
{
    private readonly ICaseRepository _caseRepository;

    public ListCasesQueryHandler(ICaseRepository caseRepository)
    {
        _caseRepository = caseRepository;
    }

    public async Task<PaginatedResult<CaseDto>> Handle(ListCasesQuery request, CancellationToken cancellationToken)
    {
        CaseStatus? statusEnum = null;
        if (!string.IsNullOrEmpty(request.Status) && Enum.TryParse<CaseStatus>(request.Status, true, out var parsedStatus))
        {
            statusEnum = parsedStatus;
        }

        var (items, total) = await _caseRepository.SearchAsync(
            request.TenantId,
            request.Search,
            statusEnum,
            null, // practiceArea
            request.ClientId,
            null, // lawyerId
            null, // isUrgent
            request.Page,
            request.PageSize,
            cancellationToken
        );

        var dtos = items.Select(c => new CaseDto(
            c.Id,
            c.Title,
            c.CaseNumber ?? string.Empty,
            c.Description,
            c.Status.ToString(),
            c.ClientId ?? Guid.Empty,
            c.Client?.Name ?? "Sem Cliente",
            c.ResponsibleLawyerId,
            c.ResponsibleLawyer?.Name,
            c.PracticeArea, // Mapping PracticeArea to Court
            null, // DistributionDate missing in Entity
            c.CreatedAt,
            c.UpdatedAt
        ));

        return new PaginatedResult<CaseDto>(dtos, total, request.Page, request.PageSize);
    }
}
