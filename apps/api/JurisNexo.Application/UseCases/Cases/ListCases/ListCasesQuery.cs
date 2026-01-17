using MediatR;
using JurisNexo.Application.DTOs;

namespace JurisNexo.Application.UseCases.Cases.ListCases;

public record ListCasesQuery(
    int Page = 1,
    int PageSize = 10,
    string? Search = null,
    string? Status = null,
    Guid? ClientId = null,
    Guid TenantId = default
) : IRequest<PaginatedResult<CaseDto>>;

public record PaginatedResult<T>(
    IEnumerable<T> Items,
    int TotalCount,
    int Page,
    int PageSize
)
{
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPreviousPage => Page > 1;
    public bool HasNextPage => Page < TotalPages;
}
