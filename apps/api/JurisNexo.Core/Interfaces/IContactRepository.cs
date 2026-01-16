using JurisNexo.Core.Entities;

namespace JurisNexo.Core.Interfaces;

public interface IContactRepository : ITenantRepository<Contact>
{
    Task<Contact?> GetByPhoneAsync(Guid tenantId, string phone, CancellationToken cancellationToken = default);
    Task<(IEnumerable<Contact> Items, int Total)> SearchAsync(
        Guid tenantId,
        string? search,
        ContactSource? source,
        bool? isLead,
        int page,
        int limit,
        CancellationToken cancellationToken = default);
}
