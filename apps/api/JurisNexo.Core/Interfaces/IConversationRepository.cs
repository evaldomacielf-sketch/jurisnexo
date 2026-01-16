using JurisNexo.Core.Entities;

namespace JurisNexo.Core.Interfaces;

public interface IConversationRepository : ITenantRepository<Conversation>
{
    Task<Conversation?> GetByContactIdAsync(Guid tenantId, Guid contactId, CancellationToken cancellationToken = default);
    Task<int> GetUnreadCountAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<(IEnumerable<Conversation> Items, int Total)> SearchAsync(
        Guid tenantId,
        ConversationStatus? status,
        ConversationPriority? priority,
        Guid? assignedToUserId,
        string? search,
        int page,
        int limit,
        CancellationToken cancellationToken = default);
}
