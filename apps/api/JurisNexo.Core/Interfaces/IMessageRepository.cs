using JurisNexo.Core.Entities;

namespace JurisNexo.Core.Interfaces;

public interface IMessageRepository : IRepository<Message>
{
    Task<IEnumerable<Message>> GetByConversationIdAsync(Guid conversationId, int page, int limit, CancellationToken cancellationToken = default);
}
