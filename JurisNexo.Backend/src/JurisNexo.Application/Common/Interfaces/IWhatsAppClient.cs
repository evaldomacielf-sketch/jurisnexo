using JurisNexo.Application.DTOs.WhatsApp;

namespace JurisNexo.Application.Common.Interfaces;

public interface IWhatsAppClient
{
    Task<string> SendMessageAsync(string phone, string content, string? mediaUrl = null, CancellationToken cancellationToken = default);
    Task<string> SendTemplateAsync(string phone, string templateName, string language, object[] parameters, CancellationToken cancellationToken = default);
    Task<bool> IsConnectedAsync(CancellationToken cancellationToken = default);
    Task<QrCodeResponse> GenerateQrCodeAsync(CancellationToken cancellationToken = default);
}
