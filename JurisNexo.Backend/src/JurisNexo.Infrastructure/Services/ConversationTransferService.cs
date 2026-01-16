using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.SignalR;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Domain.Entities;
using JurisNexo.Infrastructure.Data;
using JurisNexo.Infrastructure.Hubs;

namespace JurisNexo.Infrastructure.Services
{
    public class ConversationTransferService : IConversationTransferService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<InboxHub> _hubContext;
        private readonly IWhatsAppQueueService _queueService;
        private readonly ILogger<ConversationTransferService> _logger;

        public ConversationTransferService(
            ApplicationDbContext context,
            IHubContext<InboxHub> hubContext,
            IWhatsAppQueueService queueService,
            ILogger<ConversationTransferService> logger)
        {
            _context = context;
            _hubContext = hubContext;
            _queueService = queueService;
            _logger = logger;
        }

        /// <summary>
        /// Transfer conversation to another lawyer
        /// </summary>
        public async Task<TransferResult> TransferConversationAsync(
            Guid conversationId,
            Guid fromUserId,
            Guid toUserId,
            string reason)
        {
            try
            {
                var conversation = await _context.WhatsAppConversations
                    .FirstOrDefaultAsync(c => c.Id == conversationId);

                if (conversation == null)
                {
                    return new TransferResult
                    {
                        Success = false,
                        Error = "Conversa não encontrada"
                    };
                }

                var fromUser = await _context.Users.FindAsync(fromUserId);
                var toUser = await _context.Users.FindAsync(toUserId);

                if (fromUser == null || toUser == null)
                {
                    return new TransferResult
                    {
                        Success = false,
                        Error = "Usuário não encontrado"
                    };
                }

                // Create transfer record
                var transfer = new ConversationTransfer
                {
                    Id = Guid.NewGuid(),
                    ConversationId = conversationId,
                    FromUserId = fromUserId,
                    ToUserId = toUserId,
                    Reason = reason,
                    TransferredAt = DateTime.UtcNow
                };

                _context.ConversationTransfers.Add(transfer);

                // Update conversation assignment
                conversation.AssignedToUserId = toUserId;
                conversation.LastMessageAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Update queue load tracking
                await _queueService.TransferConversationAsync(conversationId, toUserId);

                // Notify the new lawyer via SignalR
                await _hubContext.Clients.User(toUserId.ToString()).SendAsync("ConversationTransferred", new
                {
                    conversationId,
                    customerName = conversation.CustomerName,
                    customerPhone = conversation.CustomerPhone,
                    fromUserName = fromUser.Name,
                    reason,
                    transferredAt = transfer.TransferredAt,
                    message = $"📨 {fromUser.Name} transferiu uma conversa para você"
                });

                // Notify the previous lawyer
                await _hubContext.Clients.User(fromUserId.ToString()).SendAsync("ConversationRemoved", new
                {
                    conversationId,
                    reason = $"Transferido para {toUser.Name}"
                });

                // Add internal note to conversation
                var internalNote = new WhatsAppMessage
                {
                    Id = Guid.NewGuid(),
                    WhatsAppConversationId = conversationId,
                    WhatsAppMessageId = $"internal-{Guid.NewGuid()}",
                    ProviderMessageId = $"internal-{Guid.NewGuid()}",
                    Direction = WhatsAppDirection.Outbound,
                    Content = $"🔄 Conversa transferida de {fromUser.Name} para {toUser.Name}\nMotivo: {reason}",
                    Type = WhatsAppMessageType.Text,
                    Status = WhatsAppMessageStatus.Delivered,
                    SentAt = DateTime.UtcNow
                };
                
                _context.WhatsAppMessages.Add(internalNote);
                await _context.SaveChangesAsync();

                _logger.LogInformation(
                    "Conversation {ConversationId} transferred from {FromUser} to {ToUser}. Reason: {Reason}",
                    conversationId, fromUser.Name, toUser.Name, reason
                );

                return new TransferResult
                {
                    Success = true,
                    TransferId = transfer.Id
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error transferring conversation {ConversationId}", conversationId);
                return new TransferResult
                {
                    Success = false,
                    Error = ex.Message
                };
            }
        }

        /// <summary>
        /// Get transfer history for a conversation
        /// </summary>
        public async Task<IEnumerable<TransferHistoryDto>> GetTransferHistoryAsync(Guid conversationId)
        {
            var transfers = await _context.ConversationTransfers
                .Where(t => t.ConversationId == conversationId)
                .Include(t => t.FromUser)
                .Include(t => t.ToUser)
                .OrderByDescending(t => t.TransferredAt)
                .ToListAsync();

            return transfers.Select(t => new TransferHistoryDto
            {
                Id = t.Id,
                FromUserName = t.FromUser?.Name ?? "Desconhecido",
                ToUserName = t.ToUser?.Name ?? "Desconhecido",
                Reason = t.Reason,
                TransferredAt = t.TransferredAt
            });
        }

        /// <summary>
        /// Get available lawyers for transfer
        /// </summary>
        public async Task<IEnumerable<AvailableLawyerDto>> GetAvailableLawyersAsync(Guid currentUserId)
        {
            var lawyers = await _context.Users
                .Where(u => (u.Role == UserRole.Lawyer || u.Role == UserRole.Admin) && u.Id != currentUserId)
                .ToListAsync();

            var result = new List<AvailableLawyerDto>();

            foreach (var lawyer in lawyers)
            {
                var currentLoad = await _queueService.GetAdvogadoCurrentLoadAsync(lawyer.Id);
                var status = await _queueService.GetAdvogadoStatusAsync(lawyer.Id);

                result.Add(new AvailableLawyerDto
                {
                    Id = lawyer.Id,
                    Name = lawyer.Name,
                    AvatarUrl = lawyer.AvatarUrl,
                    CurrentLoad = currentLoad,
                    IsAvailable = status == Domain.Enums.AdvogadoStatus.Disponivel
                });
            }

            return result.OrderByDescending(l => l.IsAvailable).ThenBy(l => l.CurrentLoad);
        }
    }
}
