using JurisNexo.Application.DTOs.WhatsApp;

namespace JurisNexo.Application.Common.Interfaces;

public interface IWhatsAppService
{
    Task<string> SendMessageAsync(string phone, string content, string? mediaUrl = null, CancellationToken cancellationToken = default);
    Task<bool> IsConnectedAsync(CancellationToken cancellationToken = default);
    Task<QrCodeResponse> GenerateQrCodeAsync(CancellationToken cancellationToken = default);
}
