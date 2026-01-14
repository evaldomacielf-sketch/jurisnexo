using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using JurisNexo.Application.Services;
using JurisNexo.Domain.Interfaces;
using JurisNexo.Domain.Entities;
using JurisNexo.Domain.Enums;
using JurisNexo.Infrastructure.Hubs;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Application.Common.Exceptions;
using JurisNexo.Application.DTOs.Inbox;
using JurisNexo.Application.DTOs.Common;

namespace JurisNexo.Application.Services;

public class InboxService : IInboxService
{
    private readonly IConversationRepository _conversationRepository;
    private readonly IRepository<Message> _messageRepository;
    private readonly IContactRepository _contactRepository;
    private readonly IHubContext<InboxHub, IInboxHubClient> _hubContext;
    private readonly IWhatsAppService _whatsAppService;
    private readonly IStorageService _storageService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<InboxService> _logger;

    public InboxService(
        IConversationRepository conversationRepository,
        IRepository<Message> messageRepository,
        IContactRepository contactRepository,
        IHubContext<InboxHub, IInboxHubClient> hubContext,
        IWhatsAppService whatsAppService,
        IStorageService storageService,
        IUnitOfWork unitOfWork,
        ILogger<InboxService> logger)
    {
        _conversationRepository = conversationRepository;
        _messageRepository = messageRepository;
        _contactRepository = contactRepository;
        _hubContext = hubContext;
        _whatsAppService = whatsAppService;
        _storageService = storageService;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<PaginatedResponse<ConversationDto>> GetConversationsAsync(
        Guid tenantId,
        ConversationStatus? status,
        ConversationPriority? priority,
        Guid? assignedToUserId,
        string? search,
        int page,
        int limit,
        CancellationToken cancellationToken = default)
    {
        var (items, total) = await _conversationRepository.SearchAsync(
            tenantId,
            status,
            priority,
            assignedToUserId,
            search,
            page,
            limit,
            cancellationToken);

        var dtos = items.Select(MapToConversationDto).ToList();
        var totalPages = (int)Math.Ceiling(total / (double)limit);

        return new PaginatedResponse<ConversationDto>(
            dtos,
            new PaginationMetadata(page, limit, total, totalPages)
        );
    }

    public async Task<ConversationDto?> GetConversationAsync(Guid conversationId, CancellationToken cancellationToken = default)
    {
        var conversation = await _conversationRepository.GetByIdAsync(conversationId, cancellationToken);
        return conversation != null ? MapToConversationDto(conversation) : null;
    }

    public async Task<int> GetUnreadCountAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await _conversationRepository.GetUnreadCountAsync(tenantId, cancellationToken);
    }

    public async Task<PaginatedResponse<MessageDto>> GetMessagesAsync(
        Guid conversationId,
        int page,
        int limit,
        CancellationToken cancellationToken = default)
    {
        var conversation = await _conversationRepository.GetByIdAsync(conversationId, cancellationToken)
            ?? throw new NotFoundException("Conversa não encontrada");

        var allMessages = conversation.Messages
            .OrderBy(m => m.SentAt)
            .ToList();

        var total = allMessages.Count;
        var messages = allMessages
            .Skip((page - 1) * limit)
            .Take(limit)
            .ToList();

        var dtos = messages.Select(MapToMessageDto).ToList();
        var totalPages = (int)Math.Ceiling(total / (double)limit);

        return new PaginatedResponse<MessageDto>(
            dtos,
            new PaginationMetadata(page, limit, total, totalPages)
        );
    }

    public async Task<MessageDto> SendMessageAsync(
        Guid conversationId,
        SendMessageRequest request,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var conversation = await _conversationRepository.GetByIdAsync(conversationId, cancellationToken)
            ?? throw new NotFoundException("Conversa não encontrada");

        // Cria mensagem
        var message = new Message
        {
            ConversationId = conversationId,
            SenderType = SenderType.User,
            SenderId = userId,
            Content = request.Content,
            MessageType = request.MessageType,
            MediaUrl = request.MediaUrl,
            IsRead = true,
            SentAt = DateTime.UtcNow
        };

        await _messageRepository.AddAsync(message, cancellationToken);

        // Atualiza conversa
        conversation.UpdatedAt = DateTime.UtcNow;
        await _conversationRepository.UpdateAsync(conversation, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Envia via WhatsApp
        try
        {
            var whatsappMessageId = await _whatsAppService.SendMessageAsync(
                conversation.Contact.Phone,
                request.Content,
                request.MediaUrl,
                cancellationToken);

            message.WhatsappMessageId = whatsappMessageId;
            await _messageRepository.UpdateAsync(message, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao enviar mensagem via WhatsApp");
        }

        // Notifica via SignalR
        var messageDto = MapToMessageDto(message);
        await _hubContext.Clients
            .Group($"tenant:{conversation.TenantId}")
            .NewMessage(messageDto);

        return messageDto;
    }

    public async Task<ConversationDto> UpdateConversationStatusAsync(
        Guid conversationId,
        ConversationStatus status,
        CancellationToken cancellationToken = default)
    {
        var conversation = await _conversationRepository.GetByIdAsync(conversationId, cancellationToken)
            ?? throw new NotFoundException("Conversa não encontrada");

        conversation.Status = status;
        await _conversationRepository.UpdateAsync(conversation, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = MapToConversationDto(conversation);

        // Notifica via SignalR
        await _hubContext.Clients
            .Group($"tenant:{conversation.TenantId}")
            .ConversationUpdate(dto);

        return dto;
    }

    public async Task<ConversationDto> AssignConversationAsync(
        Guid conversationId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var conversation = await _conversationRepository.GetByIdAsync(conversationId, cancellationToken)
            ?? throw new NotFoundException("Conversa não encontrada");

        conversation.AssignedToUserId = userId;
        await _conversationRepository.UpdateAsync(conversation, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = MapToConversationDto(conversation);

        // Notifica via SignalR
        await _hubContext.Clients
            .Group($"tenant:{conversation.TenantId}")
            .ConversationUpdate(dto);

        return dto;
    }

    public async Task<string> UploadMediaAsync(IFormFile file, CancellationToken cancellationToken = default)
    {
        // Validações
        var maxSize = 10 * 1024 * 1024; // 10MB
        if (file.Length > maxSize)
            throw new BadRequestException("Arquivo muito grande. Máximo 10MB");

        var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif", "application/pdf", "audio/mpeg", "video/mp4" };
        if (!allowedTypes.Contains(file.ContentType))
            throw new BadRequestException("Tipo de arquivo não permitido");

        // Upload para storage (S3, Azure Blob, etc)
        var url = await _storageService.UploadAsync(file, "inbox-media", cancellationToken);
        return url;
    }

    private static ConversationDto MapToConversationDto(Conversation conversation)
    {
        return new ConversationDto(
            conversation.Id,
            conversation.TenantId,
            conversation.ContactId,
            new ContactInfoDto(
                conversation.Contact.Id,
                conversation.Contact.Name,
                conversation.Contact.Phone,
                conversation.Contact.AvatarUrl
            ),
            conversation.Messages.OrderByDescending(m => m.SentAt).FirstOrDefault() != null
                ? MapToMessageDto(conversation.Messages.OrderByDescending(m => m.SentAt).First())
                : null,
            conversation.UnreadCount,
            conversation.Status.ToString(),
            conversation.Priority.ToString(),
            conversation.AssignedToUser != null
                ? new UserInfoDto(conversation.AssignedToUser.Id, conversation.AssignedToUser.Name)
                : null,
            conversation.CreatedAt,
            conversation.UpdatedAt
        );
    }

    private static MessageDto MapToMessageDto(Message message)
    {
        return new MessageDto(
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
    }
}
