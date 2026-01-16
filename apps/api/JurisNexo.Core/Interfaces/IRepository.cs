using JurisNexo.Core.Common;

namespace JurisNexo.Core.Interfaces;

public interface IRepository<T> where T : BaseEntity
{
    Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<T> AddAsync(T entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(T entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default);
}

public interface ITenantRepository<T> : IRepository<T> where T : TenantEntity
{
    Task<IEnumerable<T>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
}
