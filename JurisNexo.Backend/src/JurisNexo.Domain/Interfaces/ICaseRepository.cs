using JurisNexo.Domain.Entities;

namespace JurisNexo.Domain.Interfaces;

public interface ICaseRepository : ITenantRepository<Case>
{
    Task<(IEnumerable<Case> Items, int Total)> SearchAsync(
        Guid tenantId,
        string? search,
        CaseStatus? status,
        string? practiceArea,
        Guid? clientId,
        Guid? lawyerId,
        bool? isUrgent,
        int page,
        int limit,
        CancellationToken cancellationToken = default);

    Task<Case?> GetByCaseNumberAsync(Guid tenantId, string caseNumber, CancellationToken cancellationToken = default);
}
