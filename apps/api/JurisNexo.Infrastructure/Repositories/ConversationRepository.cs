using Microsoft.EntityFrameworkCore;
using JurisNexo.Core.Entities;
using JurisNexo.Core.Interfaces;
using JurisNexo.Infrastructure.Data;

namespace JurisNexo.Infrastructure.Repositories;

public class ConversationRepository : Repository<Conversation>, IConversationRepository
{
    public ConversationRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Conversation?> GetByContactIdAsync(Guid tenantId, Guid contactId, CancellationToken cancellationToken = default)
    {
        return await _context.Set<Conversation>()
            .Include(c => c.Contact)
            .Include(c => c.AssignedToUser)
            .Include(c => c.Messages.OrderByDescending(m => m.SentAt).Take(1)) // Preview da última mensagem
            .FirstOrDefaultAsync(c => c.TenantId == tenantId && c.ContactId == contactId, cancellationToken);
    }


    public async Task<IEnumerable<Conversation>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await _context.Set<Conversation>()
            .Where(c => c.TenantId == tenantId)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> GetUnreadCountAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        // Conta conversas que têm mensagens não lidas ou status específico se aplicável
        // Aqui assumindo contagem por métrica de "UnreadCount" desnivelizada na conversa
        return await _context.Set<Conversation>()
            .Where(c => c.TenantId == tenantId && c.UnreadCount > 0)
            .CountAsync(cancellationToken);
    }

    public async Task<(IEnumerable<Conversation> Items, int Total)> SearchAsync(
        Guid tenantId,
        ConversationStatus? status,
        ConversationPriority? priority,
        Guid? assignedToUserId,
        string? search,
        int page,
        int limit,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Set<Conversation>()
            .Include(c => c.Contact)
            .Include(c => c.AssignedToUser)
            .Where(c => c.TenantId == tenantId);

        if (status.HasValue)
        {
            query = query.Where(c => c.Status == status.Value);
        }

        if (priority.HasValue)
        {
            query = query.Where(c => c.Priority == priority.Value);
        }

        if (assignedToUserId.HasValue)
        {
            query = query.Where(c => c.AssignedToUserId == assignedToUserId.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(c => 
                c.Contact.Name.ToLower().Contains(searchLower) ||
                (c.Contact.Phone != null && c.Contact.Phone.Contains(searchLower)));
        }

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(c => c.LastMessageAt) // Ordena por atividade recente
            .Skip((page - 1) * limit)
            .Take(limit)
            // Carrega últimas mensagens para preview se necessário, mas CUIDADO com performance
            // Vamos carregar a última mensagem apenas para o snippet
            .Include(c => c.Messages.OrderByDescending(m => m.SentAt).Take(1))
            .ToListAsync(cancellationToken);

        return (items, total);
    }
}
