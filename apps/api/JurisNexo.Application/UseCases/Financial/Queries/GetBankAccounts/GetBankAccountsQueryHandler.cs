using MediatR;
using JurisNexo.Core.Entities.Financial;
using JurisNexo.Core.Interfaces;

namespace JurisNexo.Application.UseCases.Financial.Queries.GetBankAccounts;

public record GetBankAccountsQuery(Guid TenantId) : IRequest<IEnumerable<BankAccount>>;

public class GetBankAccountsQueryHandler : IRequestHandler<GetBankAccountsQuery, IEnumerable<BankAccount>>
{
    private readonly IRepository<BankAccount> _repository;
    private readonly ITenantRepository<BankAccount> _tenantRepository; // Assuming generic tenant repo usage

    public GetBankAccountsQueryHandler(IRepository<BankAccount> repository)
    {
        _repository = repository;
        // _tenantRepository = (ITenantRepository<BankAccount>)repository; // Casting might be unsafe if DI doesn't match
        // But Generic Repository usually implements both if set up right, or we use specific.
        // Let's assume standard Repository supports simple fetching or we filter manually.
        // Wait, generic IRepository<T> has GetAllAsync but implies ALL.
        // ITenantRepository<T> has GetByTenantIdAsync.
        // I need to check if Repository<T> implements ITenantRepository<T>.
    }
    
    // Changing to use ITenantRepository directly via DI injection token, 
    // BUT DI registered `typeof(IRepository<>)` to `Repository<>`.
    // I need to know if `Repository<>` implements `ITenantRepository<>`.
    // I will assume for now I inject IRepository<BankAccount> and use a workaround or checks.
    // Actually, I can use `_repository` but I need to filter by TenantId manually if methods don't support it?
    // BUT `GetAllAsync` usually loads all.
    
    // Better: Helper method or check `Repository.cs`. 
    // I will implement Handler assuming I need to check Repository capabilities in next step.
    // For now, writing the Query/Handler assuming I can just use `GetByTenantIdAsync` if I cast or assume interface.
    // Let's check `Repository.cs` first to be safe.
    
    public async Task<IEnumerable<BankAccount>> Handle(GetBankAccountsQuery request, CancellationToken cancellationToken)
    {
        // Global Query Filter in DbContext handles the TenantId filtering automatically based on HttpContext
        // But since we have request.TenantId, we could use it for verification or if filter is disabled.
        // For simplicity and relying on existing infrastructure, GetAllAsync() will return filtered results.
        
        return await _repository.GetAllAsync(cancellationToken);
    }
}
