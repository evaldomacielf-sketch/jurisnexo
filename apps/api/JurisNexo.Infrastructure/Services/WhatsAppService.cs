using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Application.DTOs.WhatsApp;
using JurisNexo.Core.Entities;
using JurisNexo.Core.Interfaces;

namespace JurisNexo.Infrastructure.Services;

public class WhatsAppService : IWhatsAppService
{
    private readonly IWhatsAppClient _whatsAppClient;
    private readonly IRepository<WhatsAppConversation> _conversationRepository;
    private readonly IRepository<WhatsAppMessage> _messageRepository;
    private readonly IContactRepository _contactRepository;
    private readonly IStorageService _storageService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<WhatsAppService> _logger;

    public WhatsAppService(
        IWhatsAppClient whatsAppClient,
        IRepository<WhatsAppConversation> conversationRepository,
        IRepository<WhatsAppMessage> messageRepository,
        IContactRepository contactRepository,
        IStorageService storageService,
        IUnitOfWork unitOfWork,
        ILogger<WhatsAppService> logger)
    {
        _whatsAppClient = whatsAppClient;
        _conversationRepository = conversationRepository;
        _messageRepository = messageRepository;
        _contactRepository = contactRepository;
        _storageService = storageService;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<List<WhatsAppConversationDto>> GetConversationsAsync(Guid tenantId, string? filter, string? search, int page, int pageSize)
    {
        var all = await _conversationRepository.GetAllAsync();
        // Filter by tenant
        var query = all.Where(c => c.TenantId == tenantId);

        if (!string.IsNullOrEmpty(filter))
        {
            if (filter == "unread") query = query.Where(c => c.UnreadCount > 0);
            else if (filter == "archived") query = query.Where(c => c.IsArchived);
            else query = query.Where(c => !c.IsArchived);
        }
        else
        {
            query = query.Where(c => !c.IsArchived);
        }

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(c => c.CustomerName.Contains(search, StringComparison.OrdinalIgnoreCase) || c.CustomerPhone.Contains(search));
        }

        var items = query.OrderByDescending(c => c.LastMessageAt).Skip((page - 1) * pageSize).Take(pageSize).ToList();
        
        return items.Select(c => new WhatsAppConversationDto
        {
            Id = c.Id,
            CustomerName = c.CustomerName,
            CustomerPhone = c.CustomerPhone,
            AvatarUrl = c.AvatarUrl,
            LastMessage = c.LastMessage,
            LastMessageAt = c.LastMessageAt ?? DateTime.MinValue,
            UnreadCount = c.UnreadCount,
            Tags = !string.IsNullOrEmpty(c.TagsJson) ? System.Text.Json.JsonSerializer.Deserialize<List<string>>(c.TagsJson) : new List<string>(),
            IsBotEnabled = c.IsBotEnabled,
            Status = c.SessionStatus.ToString(),
            IsArchived = c.IsArchived
        }).ToList();
    }

    public async Task<List<WhatsAppMessageDto>> GetMessagesAsync(Guid conversationId, int limit, DateTime? before)
    {
        var all = await _messageRepository.GetAllAsync();
        var query = all.Where(m => m.WhatsAppConversationId == conversationId);

        if (before.HasValue)
        {
            query = query.Where(m => m.SentAt < before.Value);
        }

        var items = query.OrderByDescending(m => m.SentAt).Take(limit).OrderBy(m => m.SentAt).ToList();

        return items.Select(m => new WhatsAppMessageDto
        {
            Id = m.Id,
            ConversationId = m.WhatsAppConversationId,
            Content = m.Content,
            Timestamp = m.SentAt,
            Direction = m.Direction.ToString().ToLower(),
            Status = m.Status.ToString().ToLower(),
            MediaType = m.Type.ToString().ToLower(),
            MediaUrl = m.MediaUrl
        }).ToList();
    }

    public async Task<WhatsAppMessageDto> SendTextMessageAsync(Guid conversationId, string content, Guid userId)
    {
        var conversation = await _conversationRepository.GetByIdAsync(conversationId);
        if (conversation == null) throw new Exception("Conversation not found");

        // Send via Client
        var providerId = await _whatsAppClient.SendMessageAsync(conversation.CustomerPhone, content, null);

        // Save Message
        var message = new WhatsAppMessage
        {
            WhatsAppConversationId = conversationId,
            Content = content,
            Direction = WhatsAppDirection.Outbound,
            Status = WhatsAppMessageStatus.Sent,
            SentAt = DateTime.UtcNow,
            Type = WhatsAppMessageType.Text,
            ProviderMessageId = providerId
        };

        await _messageRepository.AddAsync(message);
        
        conversation.LastMessage = content;
        conversation.LastMessageAt = DateTime.UtcNow;
        await _conversationRepository.UpdateAsync(conversation);
        await _unitOfWork.SaveChangesAsync();

        return new WhatsAppMessageDto
        {
            Id = message.Id,
            ConversationId = conversation.Id,
            Content = message.Content,
            Timestamp = message.SentAt,
            Direction = "outbound",
            Status = "sent",
            MediaType = "text"
        };
    }

    public async Task<WhatsAppMessageDto> SendMediaMessageAsync(Guid conversationId, IFormFile file, string? caption, Guid userId)
    {
        var conversation = await _conversationRepository.GetByIdAsync(conversationId);
        if (conversation == null) throw new Exception("Conversation not found");

        var mediaUrl = await _storageService.UploadAsync(file, "whatsapp-media");

        var providerId = await _whatsAppClient.SendMessageAsync(conversation.CustomerPhone, caption ?? "", mediaUrl);

        var message = new WhatsAppMessage
        {
            WhatsAppConversationId = conversationId,
            Content = caption,
            Direction = WhatsAppDirection.Outbound,
            Status = WhatsAppMessageStatus.Sent,
            SentAt = DateTime.UtcNow,
            Type = WhatsAppMessageType.Image, // Simplify for now
            MediaUrl = mediaUrl,
            ProviderMessageId = providerId
        };

        await _messageRepository.AddAsync(message);

         conversation.LastMessage = caption ?? "[Media]";
        conversation.LastMessageAt = DateTime.UtcNow;
        await _conversationRepository.UpdateAsync(conversation);
        await _unitOfWork.SaveChangesAsync();

        return new WhatsAppMessageDto
        {
            Id = message.Id,
            ConversationId = conversation.Id,
            Content = message.Content,
            Timestamp = message.SentAt,
            Direction = "outbound",
            Status = "sent",
            MediaType = "image",
            MediaUrl = mediaUrl
        };
    }

    public async Task<WhatsAppMessageDto> SendTemplateAsync(Guid conversationId, string templateId, Dictionary<string, string> variables, Guid userId)
    {
         var conversation = await _conversationRepository.GetByIdAsync(conversationId);
        if (conversation == null) throw new Exception("Conversation not found");

        // Templating logic usually requires looking up template body
        // For now, simpler implementation passing templateId as name
        var parameters = variables.Values.ToArray(); // Simple mapping
        var providerId = await _whatsAppClient.SendTemplateAsync(conversation.CustomerPhone, templateId, "pt_BR", parameters);

         var message = new WhatsAppMessage
        {
            WhatsAppConversationId = conversationId,
            Content = $"Template: {templateId}", // Should store actual body
            Direction = WhatsAppDirection.Outbound,
            Status = WhatsAppMessageStatus.Sent,
            SentAt = DateTime.UtcNow,
            Type = WhatsAppMessageType.Template,
            ProviderMessageId = providerId
        };

        await _messageRepository.AddAsync(message);
        await _unitOfWork.SaveChangesAsync();

        return new WhatsAppMessageDto
        {
            Id = message.Id,
            ConversationId = conversation.Id,
            Content = message.Content,
            Timestamp = message.SentAt,
            Direction = "outbound",
            Status = "sent",
            MediaType = "template"
        };
    }

    public async Task MarkConversationAsReadAsync(Guid conversationId)
    {
        var conversation = await _conversationRepository.GetByIdAsync(conversationId);
        if (conversation != null)
        {
            conversation.UnreadCount = 0;
            await _conversationRepository.UpdateAsync(conversation);
            await _unitOfWork.SaveChangesAsync();
        }
    }

    public async Task ArchiveConversationAsync(Guid conversationId)
    {
        var conversation = await _conversationRepository.GetByIdAsync(conversationId);
        if (conversation != null)
        {
            conversation.IsArchived = true;
            await _conversationRepository.UpdateAsync(conversation);
            await _unitOfWork.SaveChangesAsync();
        }
    }

    public async Task AddTagToConversationAsync(Guid conversationId, string tagName)
    {
        var conversation = await _conversationRepository.GetByIdAsync(conversationId);
        if (conversation != null)
        {
            var tags = new List<string>();
            if (!string.IsNullOrEmpty(conversation.TagsJson))
            {
                tags = System.Text.Json.JsonSerializer.Deserialize<List<string>>(conversation.TagsJson);
            }
            if (!tags.Contains(tagName))
            {
                tags.Add(tagName);
                conversation.TagsJson = System.Text.Json.JsonSerializer.Serialize(tags);
                await _conversationRepository.UpdateAsync(conversation);
                await _unitOfWork.SaveChangesAsync();
            }
        }
    }

    public async Task<WhatsAppContactDetailsDto> GetContactDetailsAsync(Guid contactId)
    {
        // Actually conversationId or contactId? Logic usually uses Contact repo
        // Interface says ContactId. If we mean Conversation.ContactId?
        // Method signature likely implies Contact ID.
        var contact = await _contactRepository.GetByIdAsync(contactId);
        if (contact == null) return null;

        var tags = contact.Tags ?? new List<string>();

        return new WhatsAppContactDetailsDto
        {
            Id = contact.Id,
            Name = contact.Name,
            Phone = contact.Phone,
            Email = contact.Email,
            Tags = tags,
            CustomFields = new Dictionary<string, string> { { "Notes", contact.Notes ?? "" } }
        };
    }


    public async Task<List<WhatsAppTemplateDto>> GetTemplatesAsync(Guid tenantId)
    {
        // Should fetch from DB or Client
        return new List<WhatsAppTemplateDto>();
    }

    public async Task<WhatsAppAnalyticsDto> GetAnalyticsAsync(Guid tenantId, DateTime startDate, DateTime endDate)
    {
         return new WhatsAppAnalyticsDto();
    }

    public async Task<bool> IsConnectedAsync(CancellationToken cancellationToken = default)
    {
        return await _whatsAppClient.IsConnectedAsync(cancellationToken);
    }
}
