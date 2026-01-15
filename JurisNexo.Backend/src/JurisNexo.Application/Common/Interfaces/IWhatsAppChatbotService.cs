namespace JurisNexo.Application.Common.Interfaces;

public interface IWhatsAppChatbotService
{
    Task<string?> GetResponseAsync(Guid tenantId, string customerPhone, string message, CancellationToken cancellationToken = default);
}
