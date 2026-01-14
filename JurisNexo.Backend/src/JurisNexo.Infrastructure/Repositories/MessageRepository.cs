using Microsoft.EntityFrameworkCore;
using JurisNexo.Domain.Entities;
using JurisNexo.Domain.Interfaces;
using JurisNexo.Infrastructure.Data;

namespace JurisNexo.Infrastructure.Repositories;

public class MessageRepository : Repository<Message>, IMessageRepository
{
    public MessageRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Message>> GetByConversationIdAsync(Guid conversationId, int page, int limit, CancellationToken cancellationToken = default)
    {
        return await _context.Set<Message>()
            .Where(m => m.ConversationId == conversationId)
            .OrderByDescending(m => m.SentAt) // Mais recentes primeiro
            .Skip((page - 1) * limit)
            .Take(limit)
            .OrderBy(m => m.SentAt) // Reordena para cronológico (antigo -> novo) na exibição
            .ToListAsync(cancellationToken);
    }
}
