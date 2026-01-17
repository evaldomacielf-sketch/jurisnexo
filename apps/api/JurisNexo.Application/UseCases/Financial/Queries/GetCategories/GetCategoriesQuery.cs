using MediatR;
using JurisNexo.Core.Entities.Financial;
using JurisNexo.Core.Interfaces;

namespace JurisNexo.Application.UseCases.Financial.Queries.GetCategories;

public record GetCategoriesQuery : IRequest<IEnumerable<FinancialCategory>>;

public class GetCategoriesQueryHandler : IRequestHandler<GetCategoriesQuery, IEnumerable<FinancialCategory>>
{
    private readonly IRepository<FinancialCategory> _repository;

    public GetCategoriesQueryHandler(IRepository<FinancialCategory> repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<FinancialCategory>> Handle(GetCategoriesQuery request, CancellationToken cancellationToken)
    {
        return await _repository.GetAllAsync(cancellationToken);
    }
}
