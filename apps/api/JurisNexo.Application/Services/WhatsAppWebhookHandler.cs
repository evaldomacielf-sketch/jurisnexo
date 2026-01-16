using Microsoft.Extensions.Logging;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Application.DTOs.Inbox;
using JurisNexo.Application.DTOs;
using JurisNexo.Application.DTOs.WhatsApp;
using JurisNexo.Core.Entities;
using JurisNexo.Core.Interfaces;

namespace JurisNexo.Application.Services;

public class WhatsAppWebhookHandler : IWhatsAppMessageProcessor, IWhatsAppWebhookHandler
{
    private readonly IConversationRepository _conversationRepository;
    private readonly IContactRepository _contactRepository;
    private readonly IRepository<Message> _messageRepository;
    private readonly IRepository<WhatsAppConversation> _whatsAppConversationRepository; 
    private readonly IRepository<WhatsAppMessage> _whatsAppMessageRepository;
    private readonly IInboxNotificationService _notificationService;
    private readonly IAIClassifierService _aiClassifier;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<WhatsAppWebhookHandler> _logger;
    private readonly IWhatsAppChatbotService _chatbotService;
    private readonly ILeadQualificationService _leadQualificationService;
    private readonly IWhatsAppClient _whatsAppClient;
    private readonly IRepository<LeadQualificationQuestion> _questionRepository; // Injected to find IDs

    private readonly ILeadQualificationBot _bot;

    public WhatsAppWebhookHandler(
        IConversationRepository conversationRepository,
        IContactRepository contactRepository,
        IRepository<Message> messageRepository,
        IRepository<WhatsAppConversation> whatsAppConversationRepository,
        IRepository<WhatsAppMessage> whatsAppMessageRepository,
        IInboxNotificationService notificationService,
        IAIClassifierService aiClassifier,
        IUnitOfWork unitOfWork,
        ILogger<WhatsAppWebhookHandler> logger,
        IWhatsAppChatbotService chatbotService,
        ILeadQualificationService leadQualificationService,
        IWhatsAppClient whatsAppClient,
        IRepository<LeadQualificationQuestion> questionRepository,
        ILeadQualificationBot bot)
    {
        _conversationRepository = conversationRepository;
        _contactRepository = contactRepository;
        _messageRepository = messageRepository;
        _whatsAppConversationRepository = whatsAppConversationRepository;
        _whatsAppMessageRepository = whatsAppMessageRepository;
        _notificationService = notificationService;
        _aiClassifier = aiClassifier;
        _unitOfWork = unitOfWork;
        _logger = logger;
        _chatbotService = chatbotService;
        _leadQualificationService = leadQualificationService;
        _whatsAppClient = whatsAppClient;
        _questionRepository = questionRepository;
        _bot = bot;
    }

    // Explicit implementation for legacy interface if needed, or keeping it for compatibility
    public async Task HandleAsync(WhatsAppWebhookPayload payload, CancellationToken cancellationToken = default)
    {
        // Legacy support
        await Task.CompletedTask;
    }

    public async Task HandleMetaAsync(MetaWebhookPayload payload, CancellationToken cancellationToken = default)
    {
        // Legacy interface wrapper - delegating to new Processor logic
         foreach (var entry in payload.Entry)
        {
            foreach (var change in entry.Changes)
            {
                if (change.Value.Messages != null)
                {
                    foreach (var message in change.Value.Messages)
                    {
                        await ProcessIncomingMessageAsync(message);
                    }
                }
                if (change.Value.Statuses != null)
                {
                    foreach (var status in change.Value.Statuses)
                    {
                        await ProcessMessageStatusAsync(status);
                    }
                }
            }
        }
    }

    public async Task ProcessIncomingMessageAsync(TwilioWebhookData data)
    {
        var phone = data.From?.Replace("whatsapp:", "") ?? "";
        if (string.IsNullOrEmpty(phone)) return;
        var content = data.Body ?? "";

        // Triage Logic
        if (await HandleLeadTriagingAsync(phone, content)) return;

        // Standard Logic
        var tenantId = Guid.Empty; // Placeholder Logic
        var contact = await EnsureContactExists(tenantId, phone, "Twilio User");
        var conversation = await EnsureConversationExists(tenantId, contact, phone);

        var newMessage = new WhatsAppMessage
        {
            WhatsAppConversationId = conversation.Id,
            ProviderMessageId = data.MessageSid ?? Guid.NewGuid().ToString(),
            Direction = WhatsAppDirection.Inbound,
            Status = WhatsAppMessageStatus.Read, // Assume read if webhook received for now
            Content = content,
            SentAt = DateTime.UtcNow,
            Type = data.NumMedia > 0 ? WhatsAppMessageType.Image : WhatsAppMessageType.Text,
            MediaUrl = data.MediaUrl0,
            MediaType = data.MediaContentType0
        };

        await _whatsAppMessageRepository.AddAsync(newMessage);

        // Update conversation
        conversation.LastMessage = newMessage.Content;
        conversation.LastMessageAt = DateTime.UtcNow;
        conversation.UnreadCount++;
        await _whatsAppConversationRepository.UpdateAsync(conversation);
        await _unitOfWork.SaveChangesAsync();
        
        // Chatbot Trigger
        var response = await _chatbotService.GetResponseAsync(tenantId, phone, newMessage.Content ?? "");
        if (!string.IsNullOrEmpty(response))
        {
            _logger.LogInformation("Chatbot suggested response: {Response}", response);
        }
    }

    public async Task ProcessIncomingMessageAsync(MetaWebhookMessage message)
    {
         var phone = message.From;
         var content = ExtractMetaContent(message);
         var contactName = "WhatsApp User"; 

         // Triage Logic
         if (await HandleLeadTriagingAsync(phone, content)) return;

         var tenantId = Guid.Empty; // Placeholder
         
         var contact = await EnsureContactExists(tenantId, phone, contactName);
         var conversation = await EnsureConversationExists(tenantId, contact, phone);

         var newMessage = new WhatsAppMessage
         {
             WhatsAppConversationId = conversation.Id,
             ProviderMessageId = message.Id,
             Direction = WhatsAppDirection.Inbound,
             Status = WhatsAppMessageStatus.Delivered,
             SentAt = DateTimeOffset.FromUnixTimeSeconds(long.Parse(message.Timestamp)).UtcDateTime,
             Content = content,
             Type = DetermineMetaMessageType(message),
         };

         await _whatsAppMessageRepository.AddAsync(newMessage);

         conversation.LastMessage = newMessage.Content;
         conversation.LastMessageAt = DateTime.UtcNow;
         conversation.UnreadCount++;
         
         var classification = await _aiClassifier.ClassifyUrgencyAsync(newMessage.Content);

         await _whatsAppConversationRepository.UpdateAsync(conversation);
         await _unitOfWork.SaveChangesAsync();
         
         // Chatbot
         var response = await _chatbotService.GetResponseAsync(tenantId, phone, newMessage.Content ?? "");
         if (!string.IsNullOrEmpty(response))
         {
              _logger.LogInformation("Chatbot suggested response: {Response}", response);
         }
    }

    private async Task<bool> HandleLeadTriagingAsync(string phone, string content)
    {
        // Capture or Get Lead
        var lead = await _leadQualificationService.CaptureLeadAsync(phone, content);
        
        // Use Bot to process message
        var response = await _bot.ProcessMessageAsync(lead.Id, content);

        if (!string.IsNullOrEmpty(response))
        {
             await _whatsAppClient.SendMessageAsync(phone, response);
             return true; // Handled by Bot
        }
        
        // If Bot returns null/empty, maybe it means pass through?
        // But Bot "GenerateResponseAsync" for qualified leads also returns string.
        // So only if Bot explicitly returns empty (like no op), we might fall through.
        // Assuming Bot handles all Lead interactions.
        return true; 
    }

    public async Task ProcessMessageStatusAsync(MetaWebhookStatus status)
    {
        // Find message by ProviderId
        // var msg = await _whatsAppMessageRepository.GetByProviderId(status.Id);
        // if (msg != null) { 
        //    msg.Status = MapStatus(status.Status);
        //    await _unitOfWork.SaveChangesAsync();
        // }
        await Task.CompletedTask;
    }

    // Helpers
    private async Task<Contact> EnsureContactExists(Guid tenantId, string phone, string name)
    {
        var contact = await _contactRepository.GetByPhoneAsync(tenantId, phone);
        if (contact == null)
        {
            contact = new Contact
            {
                TenantId = tenantId,
                Name = name,
                Phone = phone,
                Source = ContactSource.Whatsapp,
                IsLead = true
            };
            await _contactRepository.AddAsync(contact);
            await _unitOfWork.SaveChangesAsync();
        }
        return contact;
    }

    private async Task<WhatsAppConversation> EnsureConversationExists(Guid tenantId, Contact contact, string phone)
    {
        // Assuming we have a way to fetch by phone via repo or query
        var all = await _whatsAppConversationRepository.GetAllAsync();
        var conversation = all.FirstOrDefault(c => c.CustomerPhone == phone && !c.IsArchived);

        if (conversation == null)
        {
            conversation = new WhatsAppConversation
            {
                Id = Guid.NewGuid(), // If inheritance requires separate ID
                TenantId = tenantId,
                CustomerPhone = phone,
                CustomerName = contact.Name,
                UnreadCount = 0,
                IsArchived = false,
                TagsJson = "[]"
            };
            await _whatsAppConversationRepository.AddAsync(conversation);
            await _unitOfWork.SaveChangesAsync();
        }
        return conversation;
    }

    private static string ExtractMetaContent(MetaWebhookMessage msg)
    {
        return msg.Type switch
        {
            "text" => msg.Text?.Body ?? "",
            "image" => msg.Image?.Caption ?? "[Imagem]",
            "video" => msg.Video?.Caption ?? "[Vídeo]",
            "audio" => "[Áudio]",
            "document" => msg.Document?.FileName ?? "[Documento]",
            _ => "[Mensagem não suportada]"
        };
    }

    private static WhatsAppMessageType DetermineMetaMessageType(MetaWebhookMessage msg)
    {
        return msg.Type switch
        {
            "image" => WhatsAppMessageType.Image,
            "video" => WhatsAppMessageType.Video,
            "audio" => WhatsAppMessageType.Audio,
            "document" => WhatsAppMessageType.Document,
            _ => WhatsAppMessageType.Text
        };
    }
}
