using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Core.Entities;
using JurisNexo.Infrastructure.Data;

namespace JurisNexo.Infrastructure.Services
{
    public class SendMessageResult
    {
        public bool Success { get; set; }
        public string? Error { get; set; }
        public string? MessageId { get; set; }
        public bool RequiresTemplate { get; set; }
    }

    public interface IWhatsApp24HourWindowService
    {
        Task<bool> IsWithin24HourWindowAsync(Guid conversationId);
        Task<SendMessageResult> SendMessageAsync(Guid conversationId, string content, Guid userId);
        Task<SendMessageResult> SendTemplateMessageAsync(Guid conversationId, Guid templateId, Dictionary<string, string> variables, Guid userId);
        Task<TimeSpan?> GetWindowTimeRemainingAsync(Guid conversationId);
        Task<WindowStatusDto> GetWindowStatusAsync(Guid conversationId);
    }

    public class WindowStatusDto
    {
        public bool IsOpen { get; set; }
        public double? HoursRemaining { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public DateTime? LastCustomerMessageAt { get; set; }
        public bool RequiresTemplate { get; set; }
    }

    public class WhatsApp24HourWindowService : IWhatsApp24HourWindowService
    {
        private readonly ApplicationDbContext _context;
        private readonly IWhatsAppClient _whatsAppClient;
        private readonly ILogger<WhatsApp24HourWindowService> _logger;

        public WhatsApp24HourWindowService(
            ApplicationDbContext context,
            IWhatsAppClient whatsAppClient,
            ILogger<WhatsApp24HourWindowService> logger)
        {
            _context = context;
            _whatsAppClient = whatsAppClient;
            _logger = logger;
        }

        /// <summary>
        /// Check if conversation is within 24-hour messaging window
        /// </summary>
        public async Task<bool> IsWithin24HourWindowAsync(Guid conversationId)
        {
            var conversation = await _context.WhatsAppConversations
                .FirstOrDefaultAsync(c => c.Id == conversationId);

            if (conversation == null)
                return false;

            // Check last customer message time
            var lastCustomerMessage = conversation.LastCustomerMessageAt;
            
            if (lastCustomerMessage == null)
            {
                // Never received a message from customer - need template
                return false;
            }

            var elapsed = DateTime.UtcNow - lastCustomerMessage.Value;
            return elapsed.TotalHours < 24;
        }

        /// <summary>
        /// Send message with 24h window validation
        /// </summary>
        public async Task<SendMessageResult> SendMessageAsync(
            Guid conversationId,
            string content,
            Guid userId)
        {
            var withinWindow = await IsWithin24HourWindowAsync(conversationId);

            if (!withinWindow)
            {
                _logger.LogWarning(
                    "Message blocked - 24h window expired for conversation {ConversationId}",
                    conversationId
                );

                return new SendMessageResult
                {
                    Success = false,
                    Error = "Janela de 24h expirada. Use um template pré-aprovado.",
                    RequiresTemplate = true
                };
            }

            // Get conversation details
            var conversation = await _context.WhatsAppConversations.FindAsync(conversationId);
            if (conversation == null)
            {
                return new SendMessageResult
                {
                    Success = false,
                    Error = "Conversa não encontrada"
                };
            }

            try
            {
                // Send via WhatsApp API
                var messageId = await _whatsAppClient.SendMessageAsync(
                    conversation.CustomerPhone,
                    content
                );

                // Update conversation
                conversation.LastMessageAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                _logger.LogInformation(
                    "Message sent successfully to conversation {ConversationId}",
                    conversationId
                );

                return new SendMessageResult
                {
                    Success = true,
                    MessageId = messageId
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send message to conversation {ConversationId}", conversationId);
                return new SendMessageResult
                {
                    Success = false,
                    Error = ex.Message
                };
            }
        }

        /// <summary>
        /// Send template message (always allowed, even outside window)
        /// </summary>
        public async Task<SendMessageResult> SendTemplateMessageAsync(
            Guid conversationId,
            Guid templateId,
            Dictionary<string, string> variables,
            Guid userId)
        {
            var template = await _context.WhatsAppTemplates
                .FirstOrDefaultAsync(t => t.Id == templateId && t.Status == WhatsAppTemplateStatus.Approved);

            if (template == null)
            {
                return new SendMessageResult
                {
                    Success = false,
                    Error = "Template não encontrado ou não aprovado"
                };
            }

            var conversation = await _context.WhatsAppConversations.FindAsync(conversationId);
            if (conversation == null)
            {
                return new SendMessageResult
                {
                    Success = false,
                    Error = "Conversa não encontrada"
                };
            }

            try
            {
                // Send template via WhatsApp API
                var messageId = await _whatsAppClient.SendTemplateAsync(
                    conversation.CustomerPhone,
                    template.Name,
                    template.Language,
                    variables.Values.ToArray()
                );

                // Update conversation - sending template re-opens the window when customer responds
                conversation.LastMessageAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                _logger.LogInformation(
                    "Template {TemplateName} sent to conversation {ConversationId}",
                    template.Name, conversationId
                );

                return new SendMessageResult
                {
                    Success = true,
                    MessageId = messageId
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send template to conversation {ConversationId}", conversationId);
                return new SendMessageResult
                {
                    Success = false,
                    Error = ex.Message
                };
            }
        }

        /// <summary>
        /// Get remaining time in 24h window
        /// </summary>
        public async Task<TimeSpan?> GetWindowTimeRemainingAsync(Guid conversationId)
        {
            var conversation = await _context.WhatsAppConversations.FindAsync(conversationId);
            var lastCustomerMessage = conversation?.LastCustomerMessageAt;

            if (lastCustomerMessage == null)
                return null;

            var elapsed = DateTime.UtcNow - lastCustomerMessage.Value;
            var remaining = TimeSpan.FromHours(24) - elapsed;

            return remaining > TimeSpan.Zero ? remaining : TimeSpan.Zero;
        }

        /// <summary>
        /// Get complete window status DTO
        /// </summary>
        public async Task<WindowStatusDto> GetWindowStatusAsync(Guid conversationId)
        {
            var conversation = await _context.WhatsAppConversations.FindAsync(conversationId);
            
            if (conversation == null)
            {
                return new WindowStatusDto
                {
                    IsOpen = false,
                    RequiresTemplate = true
                };
            }

            var lastCustomerMessage = conversation.LastCustomerMessageAt;
            
            if (lastCustomerMessage == null)
            {
                return new WindowStatusDto
                {
                    IsOpen = false,
                    RequiresTemplate = true,
                    LastCustomerMessageAt = null
                };
            }

            var elapsed = DateTime.UtcNow - lastCustomerMessage.Value;
            var isOpen = elapsed.TotalHours < 24;
            var remaining = TimeSpan.FromHours(24) - elapsed;

            return new WindowStatusDto
            {
                IsOpen = isOpen,
                HoursRemaining = isOpen ? remaining.TotalHours : 0,
                ExpiresAt = isOpen ? lastCustomerMessage.Value.AddHours(24) : null,
                LastCustomerMessageAt = lastCustomerMessage,
                RequiresTemplate = !isOpen
            };
        }
    }
}
