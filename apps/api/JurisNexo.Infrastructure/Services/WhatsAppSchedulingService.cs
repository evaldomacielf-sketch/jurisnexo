using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Core.Entities;
using JurisNexo.Core.Enums;
using JurisNexo.Infrastructure.Data;

namespace JurisNexo.Infrastructure.Services
{
    public class WhatsAppSchedulingService : IWhatsAppSchedulingService
    {
        private readonly ApplicationDbContext _context;
        private readonly IWhatsAppClient _whatsAppClient;
        private readonly ILogger<WhatsAppSchedulingService> _logger;

        public WhatsAppSchedulingService(
            ApplicationDbContext context,
            IWhatsAppClient whatsAppClient,
            ILogger<WhatsAppSchedulingService> logger)
        {
            _context = context;
            _whatsAppClient = whatsAppClient;
            _logger = logger;
        }

        /// <summary>
        /// Create a scheduled message
        /// </summary>
        public async Task<Guid> CreateScheduledMessageAsync(
            Guid conversationId,
            string message,
            DateTime scheduledFor,
            Guid? createdByUserId = null,
            bool requestConfirmation = false)
        {
            var scheduled = new ScheduledMessage
            {
                Id = Guid.NewGuid(),
                ConversationId = conversationId,
                CreatedByUserId = createdByUserId,
                Message = message,
                ScheduledFor = scheduledFor,
                RequestConfirmation = requestConfirmation,
                Status = ScheduledMessageStatus.Pending
            };

            _context.ScheduledMessages.Add(scheduled);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Scheduled message {MessageId} created for conversation {ConversationId} at {ScheduledFor}",
                scheduled.Id, conversationId, scheduledFor
            );

            return scheduled.Id;
        }

        /// <summary>
        /// Cancel a scheduled message
        /// </summary>
        public async Task<bool> CancelScheduledMessageAsync(Guid scheduledMessageId)
        {
            var scheduled = await _context.ScheduledMessages.FindAsync(scheduledMessageId);
            
            if (scheduled == null)
            {
                return false;
            }

            if (scheduled.Status != ScheduledMessageStatus.Pending)
            {
                _logger.LogWarning(
                    "Cannot cancel scheduled message {MessageId} - status is {Status}",
                    scheduledMessageId, scheduled.Status
                );
                return false;
            }

            scheduled.Status = ScheduledMessageStatus.Cancelled;
            scheduled.CancelledAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Scheduled message {MessageId} cancelled", scheduledMessageId);
            return true;
        }

        /// <summary>
        /// Get scheduled messages for a conversation
        /// </summary>
        public async Task<IEnumerable<ScheduledMessageDto>> GetScheduledMessagesAsync(Guid conversationId)
        {
            var messages = await _context.ScheduledMessages
                .Where(s => s.ConversationId == conversationId)
                .Include(s => s.CreatedByUser)
                .OrderByDescending(s => s.ScheduledFor)
                .ToListAsync();

            return messages.Select(m => new ScheduledMessageDto
            {
                Id = m.Id,
                ConversationId = m.ConversationId,
                Message = m.Message,
                ScheduledFor = m.ScheduledFor,
                RequestConfirmation = m.RequestConfirmation,
                Status = m.Status.ToString(),
                SentAt = m.SentAt,
                ConfirmedAt = m.ConfirmedAt,
                CreatedByUserName = m.CreatedByUser?.Name
            });
        }

        /// <summary>
        /// Process confirmation response from customer
        /// </summary>
        public async Task<bool> ProcessConfirmationResponseAsync(Guid conversationId, string response)
        {
            var normalizedResponse = response.Trim().ToUpperInvariant();
            
            var pendingConfirmations = await _context.ScheduledMessages
                .Where(s => s.ConversationId == conversationId && 
                            s.Status == ScheduledMessageStatus.AwaitingConfirmation)
                .OrderBy(s => s.SentAt)
                .ToListAsync();

            if (!pendingConfirmations.Any())
            {
                return false;
            }

            // Get the oldest pending confirmation
            var pending = pendingConfirmations.First();

            // Check for confirmation keywords
            if (IsConfirmation(normalizedResponse))
            {
                pending.Status = ScheduledMessageStatus.Confirmed;
                pending.ConfirmedAt = DateTime.UtcNow;
                pending.ConfirmationResponse = response;
                await _context.SaveChangesAsync();

                _logger.LogInformation(
                    "Scheduled message {MessageId} confirmed by customer",
                    pending.Id
                );

                return true;
            }

            // Check for cancellation keywords
            if (IsCancellation(normalizedResponse))
            {
                pending.Status = ScheduledMessageStatus.Cancelled;
                pending.CancelledAt = DateTime.UtcNow;
                pending.ConfirmationResponse = response;
                await _context.SaveChangesAsync();

                _logger.LogInformation(
                    "Scheduled message {MessageId} cancelled by customer",
                    pending.Id
                );

                return true;
            }

            // Not a valid confirmation response
            return false;
        }

        /// <summary>
        /// Get pending confirmations for a conversation
        /// </summary>
        public async Task<IEnumerable<ScheduledMessageDto>> GetPendingConfirmationsAsync(Guid conversationId)
        {
            var messages = await _context.ScheduledMessages
                .Where(s => s.ConversationId == conversationId && 
                            s.Status == ScheduledMessageStatus.AwaitingConfirmation)
                .OrderBy(s => s.SentAt)
                .ToListAsync();

            return messages.Select(m => new ScheduledMessageDto
            {
                Id = m.Id,
                ConversationId = m.ConversationId,
                Message = m.Message,
                ScheduledFor = m.ScheduledFor,
                RequestConfirmation = m.RequestConfirmation,
                Status = m.Status.ToString(),
                SentAt = m.SentAt
            });
        }

        #region Helpers

        private bool IsConfirmation(string message)
        {
            var confirmTerms = new[] { "SIM", "CONFIRMO", "CONFIRMADO", "OK", "CERTO", "PODE", "CONFIRMAR", "TUDO BEM" };
            return confirmTerms.Any(t => message.Contains(t));
        }

        private bool IsCancellation(string message)
        {
            var cancelTerms = new[] { "NAO", "NÃO", "CANCELAR", "CANCELA", "DESISTO", "REMARCAR" };
            return cancelTerms.Any(t => message.Contains(t));
        }

        #endregion
    }
}
