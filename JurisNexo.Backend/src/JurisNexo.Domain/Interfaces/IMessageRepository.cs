using JurisNexo.Domain.Entities;

namespace JurisNexo.Domain.Interfaces;

public interface IMessageRepository : IRepository<Message>
{
    Task<IEnumerable<Message>> GetByConversationIdAsync(Guid conversationId, int page, int limit, CancellationToken cancellationToken = default);
}
