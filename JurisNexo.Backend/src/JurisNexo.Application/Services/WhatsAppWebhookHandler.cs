using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Application.DTOs.Inbox;
using JurisNexo.Application.DTOs.WhatsApp;
using JurisNexo.Domain.Entities;
using JurisNexo.Domain.Interfaces;
// using JurisNexo.Infrastructure.Hubs;

namespace JurisNexo.Application.Services;

public class WhatsAppWebhookHandler : IWhatsAppWebhookHandler
{
    private readonly IConversationRepository _conversationRepository;
    private readonly IContactRepository _contactRepository;
    private readonly IRepository<Message> _messageRepository;
    // private readonly IHubContext<InboxHub, IInboxHubClient> _hubContext;
    private readonly IAIClassifierService _aiClassifier;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<WhatsAppWebhookHandler> _logger;

    public WhatsAppWebhookHandler(
        IConversationRepository conversationRepository,
        IContactRepository contactRepository,
        IRepository<Message> messageRepository,
        // IHubContext<InboxHub, IInboxHubClient> hubContext,
        IAIClassifierService aiClassifier,
        IUnitOfWork unitOfWork,
        ILogger<WhatsAppWebhookHandler> logger)
    {
        _conversationRepository = conversationRepository;
        _contactRepository = contactRepository;
        _messageRepository = messageRepository;
        // _hubContext = hubContext;
        _aiClassifier = aiClassifier;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task HandleAsync(WhatsAppWebhookPayload payload, CancellationToken cancellationToken = default)
    {
        if (payload.Event == "messages.upsert")
        {
            await HandleNewMessageAsync(payload, cancellationToken);
        }
        else if (payload.Event == "messages.update")
        {
            await HandleMessageUpdateAsync(payload, cancellationToken);
        }
    }

    private async Task HandleNewMessageAsync(WhatsAppWebhookPayload payload, CancellationToken cancellationToken)
    {
        var messageData = payload.Data;
        
        // Ignora mensagens enviadas pela própria aplicação
        if (messageData.Key?.FromMe == true)
            return;

        var phone = messageData.Key?.RemoteJid?.Replace("@s.whatsapp.net", "") ?? "";
        // Assumindo que o Instance ID é GUID ou pode ser parseado/mapeado para TenantID
        if (!Guid.TryParse(payload.Instance, out var tenantId))
        {
            _logger.LogWarning("Instance ID inválido ou não é um GUID: {Instance}", payload.Instance);
            return; 
        }

        // Busca ou cria contato
        var contact = await _contactRepository.GetByPhoneAsync(tenantId, phone, cancellationToken);
        if (contact == null)
        {
            contact = new Contact
            {
                TenantId = tenantId,
                Name = messageData.PushName ?? phone,
                Phone = phone,
                Source = ContactSource.Whatsapp,
                IsLead = true
            };
            await _contactRepository.AddAsync(contact, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        // Busca ou cria conversa
        var conversation = await _conversationRepository.GetByContactIdAsync(tenantId, contact.Id, cancellationToken);
        if (conversation == null)
        {
            conversation = new Conversation
            {
                TenantId = tenantId,
                ContactId = contact.Id,
                Status = ConversationStatus.Open,
                Priority = ConversationPriority.Normal,
                UnreadCount = 0,
                WhatsappChatId = messageData.Key?.RemoteJid
            };
            await _conversationRepository.AddAsync(conversation, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken); // Need ID for message
        }

        // Cria mensagem
        var message = new Message
        {
            ConversationId = conversation.Id,
            SenderType = SenderType.Contact,
            SenderId = contact.Id,
            Content = ExtractMessageContent(messageData),
            MessageType = DetermineMessageType(messageData),
            MediaUrl = ExtractMediaUrl(messageData),
            IsRead = false,
            SentAt = DateTimeOffset.FromUnixTimeSeconds(messageData.MessageTimestamp ?? 0).UtcDateTime,
            WhatsappMessageId = messageData.Key?.Id
        };

        await _messageRepository.AddAsync(message, cancellationToken);

        // Incrementa contador de não lidas
        conversation.UnreadCount++;
        conversation.UpdatedAt = DateTime.UtcNow;

        // Classifica urgência com IA
        var urgencyResult = await _aiClassifier.ClassifyUrgencyAsync(message.Content, cancellationToken);
        if (urgencyResult.IsUrgent)
        {
            conversation.Priority = ConversationPriority.Urgent;
            _logger.LogWarning("Mensagem urgente detectada: {MessageId}", message.Id);
        }

        await _conversationRepository.UpdateAsync(conversation, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Notifica via SignalR
        var messageDto = new MessageDto(
            message.Id,
            message.ConversationId,
            message.SenderType.ToString(),
            message.SenderId,
            message.Content,
            message.MessageType.ToString(),
            message.MediaUrl,
            message.IsRead,
            message.SentAt
        );

        // await _hubContext.Clients
        //     .Group($"tenant:{tenantId}")
        //     .NewMessage(messageDto);
    }

    private async Task HandleMessageUpdateAsync(WhatsAppWebhookPayload payload, CancellationToken cancellationToken)
    {
        // Implementar lógica de atualização (ex: mensagem lida, entregue)
        await Task.CompletedTask;
    }

    private static string ExtractMessageContent(WhatsAppMessageData data)
    {
        if (!string.IsNullOrEmpty(data.Message?.Conversation))
            return data.Message.Conversation;

        if (!string.IsNullOrEmpty(data.Message?.ExtendedTextMessage?.Text))
            return data.Message.ExtendedTextMessage.Text;

        if (data.Message?.ImageMessage != null)
            return data.Message.ImageMessage.Caption ?? "[Imagem]";

        if (data.Message?.VideoMessage != null)
            return data.Message.VideoMessage.Caption ?? "[Vídeo]";

        if (data.Message?.DocumentMessage != null)
            return data.Message.DocumentMessage.Caption ?? "[Documento]";

        if (data.Message?.AudioMessage != null)
            return "[Áudio]";

        return "[Mensagem não suportada]";
    }

    private static MessageType DetermineMessageType(WhatsAppMessageData data)
    {
        if (data.Message?.ImageMessage != null) return MessageType.Image;
        if (data.Message?.VideoMessage != null) return MessageType.Video;
        if (data.Message?.DocumentMessage != null) return MessageType.Document;
        if (data.Message?.AudioMessage != null) return MessageType.Audio;
        return MessageType.Text;
    }

    private static string? ExtractMediaUrl(WhatsAppMessageData data)
    {
        if (data.Message?.ImageMessage != null) return data.Message.ImageMessage.Url;
        if (data.Message?.VideoMessage != null) return data.Message.VideoMessage.Url;
        if (data.Message?.DocumentMessage != null) return data.Message.DocumentMessage.Url;
        if (data.Message?.AudioMessage != null) return data.Message.AudioMessage.Url;
        return null;
    }
}
