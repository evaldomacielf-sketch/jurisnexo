using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Application.DTOs.WhatsApp;
using JurisNexo.Core.Entities;
using JurisNexo.Core.Interfaces;
using JurisNexo.Core.Enums;

namespace JurisNexo.Infrastructure.Services
{
    public class WhatsAppMessageProcessor : IWhatsAppMessageProcessor
    {
        private readonly IInboxNotificationService _notificationService;
        private readonly IRepository<WhatsAppConversation> _conversationRepository;
        private readonly IRepository<WhatsAppMessage> _messageRepository;
        private readonly IContactRepository _contactRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IWhatsAppChatbotService _chatbotService;
        private readonly ILogger<WhatsAppMessageProcessor> _logger;

        public WhatsAppMessageProcessor(
            IRepository<WhatsAppConversation> conversationRepository,
            IRepository<WhatsAppMessage> messageRepository,
            IContactRepository contactRepository,
            IUnitOfWork unitOfWork,
            IWhatsAppChatbotService chatbotService,
            IInboxNotificationService notificationService,
            ILogger<WhatsAppMessageProcessor> logger)
        {
            _conversationRepository = conversationRepository;
            _messageRepository = messageRepository;
            _contactRepository = contactRepository;
            _unitOfWork = unitOfWork;
            _chatbotService = chatbotService;
            _notificationService = notificationService;
            _logger = logger;
        }

        public async Task ProcessIncomingMessageAsync(TwilioWebhookData data)
        {
            // Simple mapping for Twilio
            var phone = data.From.Replace("whatsapp:", "");
            var content = data.Body;
            _logger.LogInformation("Processing Twilio Message from {Phone}: {Content}", phone, content);
            await Task.CompletedTask;
        }

        public async Task ProcessIncomingMessageAsync(MetaWebhookMessage message)
        {
            try 
            {
                var tenantId = Guid.Empty; // Should be resolved
                var phone = message.From;
                var text = message.Text?.Body ?? "";
                
                // Determine Message Type and Content
                var msgType = WhatsAppMessageType.Text;
                string? mediaUrl = null;
                string? mediaType = null;
                string? caption = null;

                if (message.Image != null)
                {
                    msgType = WhatsAppMessageType.Image;
                    mediaUrl = message.Image.Id; // In reality, need to fetch URL from ID
                    mediaType = message.Image.MimeType;
                    caption = message.Image.Caption;
                    text = caption ?? "[Image]";
                }
                else if (message.Document != null)
                {
                    msgType = WhatsAppMessageType.Document;
                    mediaUrl = message.Document.Id;
                    mediaType = message.Document.MimeType;
                    caption = message.Document.Caption;
                    text = caption ?? "[Document]";
                }
                else if (message.Video != null)
                {
                    msgType = WhatsAppMessageType.Video;
                    mediaUrl = message.Video.Id;
                    mediaType = message.Video.MimeType;
                    text = message.Video.Caption ?? "[Video]";
                }
                else if (message.Audio != null)
                {
                    msgType = WhatsAppMessageType.Audio;
                    mediaUrl = message.Audio.Id;
                    mediaType = message.Audio.MimeType;
                    text = "[Audio]";
                }

                // 1. Find or Create Conversation
                var conversations = await _conversationRepository.GetAllAsync();
                var existingConversation = conversations.FirstOrDefault(c => c.CustomerPhone == phone && c.SessionStatus == WhatsAppSessionStatus.Active);

                if (existingConversation == null)
                {
                    existingConversation = new WhatsAppConversation
                    {
                        CustomerPhone = phone,
                        CustomerName = "WhatsApp User", 
                        TenantId = tenantId,
                        WhatsAppId = message.Id,
                        SessionStatus = WhatsAppSessionStatus.Active,
                        SessionExpiresAt = DateTime.UtcNow.AddHours(24),
                        LastMessageAt = DateTime.UtcNow,
                        UnreadCount = 1,
                        LastMessage = text
                    };
                    await _conversationRepository.AddAsync(existingConversation);
                }
                else
                {
                     existingConversation.LastMessageAt = DateTime.UtcNow;
                     existingConversation.UnreadCount++;
                     existingConversation.LastMessage = text;
                     await _conversationRepository.UpdateAsync(existingConversation);
                }

                // 2. Save Message
                var msgEntity = new WhatsAppMessage
                {
                    WhatsAppConversationId = existingConversation.Id,
                    WhatsAppMessageId = message.Id,
                    Direction = WhatsAppDirection.Inbound,
                    Type = msgType,
                    Content = text,
                    MediaUrl = mediaUrl,
                    MediaType = mediaType,
                    Status = WhatsAppMessageStatus.Delivered,
                    SentAt = DateTime.UtcNow
                };
                await _messageRepository.AddAsync(msgEntity);
                
                // Save Changes
                await _unitOfWork.SaveChangesAsync();

                // 3. Notify Lawyers (SignalR)
                await _notificationService.NotifyNewWhatsAppMessageAsync(tenantId, msgEntity);

                // 4. Trigger Bot
                if (existingConversation.IsBotEnabled) 
                {
                    var botResponse = await _chatbotService.GetResponseAsync(tenantId, phone, text);
                    if (!string.IsNullOrEmpty(botResponse))
                    {
                        var responseMsg = new WhatsAppMessage
                        {
                            WhatsAppConversationId = existingConversation.Id,
                            WhatsAppMessageId = Guid.NewGuid().ToString(),
                            Direction = WhatsAppDirection.Outbound,
                            Type = WhatsAppMessageType.Text,
                            Content = botResponse,
                            Status = WhatsAppMessageStatus.Sent,
                            SentAt = DateTime.UtcNow
                        };
                         await _messageRepository.AddAsync(responseMsg);
                         await _unitOfWork.SaveChangesAsync();
                         
                         // Notify outbound message too? usually yes for UI update
                         await _notificationService.NotifyNewWhatsAppMessageAsync(tenantId, responseMsg);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing Meta message");
                throw;
            }
        }

        public async Task ProcessMessageStatusAsync(MetaWebhookStatus status)
        {
            _logger.LogInformation("Processing Status Update: {Status}", status.Status);
            await Task.CompletedTask;
        }
    }
}
