using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using JurisNexo.Core.Interfaces;
using JurisNexo.Core.Entities;
using Microsoft.Extensions.Logging;

namespace JurisNexo.Infrastructure.Hubs;

[Authorize]
public class InboxHub : Hub
{
    private readonly IConversationRepository _conversationRepository;
    private readonly IRepository<Message> _messageRepository;
    private readonly ILogger<InboxHub> _logger;

    public InboxHub(
        IConversationRepository conversationRepository,
        IRepository<Message> messageRepository,
        ILogger<InboxHub> logger)
    {
        _conversationRepository = conversationRepository;
        _messageRepository = messageRepository;
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var tenantId = Context.User?.FindFirst("tenant_id")?.Value;
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(tenantId) || string.IsNullOrEmpty(userId))
        {
            Context.Abort();
            return;
        }

        // Adiciona à sala do tenant
        await Groups.AddToGroupAsync(Context.ConnectionId, $"tenant:{tenantId}");
        
        _logger.LogInformation(
            "User {UserId} connected to InboxHub with connection {ConnectionId}",
            userId,
            Context.ConnectionId);

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var tenantId = Context.User?.FindFirst("tenant_id")?.Value;
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!string.IsNullOrEmpty(tenantId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"tenant:{tenantId}");
        }

        _logger.LogInformation(
            "User {UserId} disconnected from InboxHub",
            userId);

        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Entra em uma sala de conversa específica
    /// </summary>
    public async Task JoinConversation(string conversationId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"conversation:{conversationId}");
        _logger.LogInformation("Connection {ConnectionId} joined conversation {ConversationId}",
            Context.ConnectionId, conversationId);
    }

    /// <summary>
    /// Sai de uma sala de conversa
    /// </summary>
    public async Task LeaveConversation(string conversationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"conversation:{conversationId}");
        _logger.LogInformation("Connection {ConnectionId} left conversation {ConversationId}",
            Context.ConnectionId, conversationId);
    }

    /// <summary>
    /// Notifica que o usuário está digitando
    /// </summary>
    public async Task SendTypingIndicator(string conversationId)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userName = Context.User?.FindFirst(ClaimTypes.Name)?.Value;

        await Clients.GroupExcept($"conversation:{conversationId}", Context.ConnectionId)
            .SendAsync("inbox:typing", new
            {
                conversation_id = conversationId,
                user_id = userId,
                user_name = userName
            });
    }

    /// <summary>
    /// Marca mensagens como lidas
    /// </summary>
    public async Task MarkMessagesAsRead(string conversationId, List<string> messageIds)
    {
        try
        {
            var tenantId = Guid.Parse(Context.User?.FindFirst("tenant_id")?.Value!);
            var conversation = await _conversationRepository.GetByIdAsync(Guid.Parse(conversationId));

            if (conversation == null || conversation.TenantId != tenantId)
            {
                await Clients.Caller.SendAsync("inbox:error", new { message = "Conversa não encontrada" });
                return;
            }

            // Atualiza mensagens como lidas
            foreach (var messageId in messageIds)
            {
                var message = await _messageRepository.GetByIdAsync(Guid.Parse(messageId));
                if (message != null && !message.IsRead)
                {
                    message.IsRead = true;
                    await _messageRepository.UpdateAsync(message);
                }
            }

            // Decrementa contador de não lidas
            conversation.UnreadCount = Math.Max(0, conversation.UnreadCount - messageIds.Count);
            await _conversationRepository.UpdateAsync(conversation);

            // Notifica outros clientes
            await Clients.Group($"tenant:{tenantId}")
                .SendAsync("inbox:message_read", new
                {
                    conversation_id = conversationId,
                    message_ids = messageIds
                });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao marcar mensagens como lidas");
            await Clients.Caller.SendAsync("inbox:error", new { message = "Erro ao marcar mensagens como lidas" });
        }
    }
}
