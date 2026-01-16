using JurisNexo.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace JurisNexo.Infrastructure.Services;

public class TwilioWhatsAppService : IWhatsAppClient
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<TwilioWhatsAppService> _logger;

    public TwilioWhatsAppService(IConfiguration configuration, ILogger<TwilioWhatsAppService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public Task<string> SendMessageAsync(string phone, string content, string? mediaUrl = null, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException("Twilio service not fully implemented yet.");
    }

    public Task<string> SendTemplateAsync(string phone, string templateName, string language, object[] parameters, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException("Twilio service not fully implemented yet.");
    }

    public Task<bool> IsConnectedAsync(CancellationToken cancellationToken = default)
    {
        return Task.FromResult(true);
    }

    public Task<JurisNexo.Application.DTOs.WhatsApp.QrCodeResponse> GenerateQrCodeAsync(CancellationToken cancellationToken = default)
    {
        throw new NotSupportedException("Twilio does not use QR Code pairing like Web WhatsApp.");
    }
}
