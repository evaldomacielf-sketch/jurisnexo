using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using System.Net.Http.Json;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Application.Common.Settings;
using JurisNexo.Application.DTOs.WhatsApp;

namespace JurisNexo.Infrastructure.Services;

public class WhatsAppService : IWhatsAppService
{
    private readonly HttpClient _httpClient;
    private readonly WhatsAppSettings _settings;
    private readonly ILogger<WhatsAppService> _logger;

    public WhatsAppService(
        HttpClient httpClient,
        IOptions<WhatsAppSettings> settings,
        ILogger<WhatsAppService> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _logger = logger;

        _httpClient.BaseAddress = new Uri(_settings.EvolutionApiUrl);
        _httpClient.DefaultRequestHeaders.Add("apikey", _settings.ApiKey);
    }

    public async Task<string> SendMessageAsync(
        string phone,
        string content,
        string? mediaUrl = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Formata número de telefone (remove caracteres especiais)
            var formattedPhone = FormatPhoneNumber(phone);

            object payload;

            if (string.IsNullOrEmpty(mediaUrl))
            {
                // Mensagem de texto
                payload = new
                {
                    number = formattedPhone,
                    text = content
                };
            }
            else
            {
                // Mensagem com mídia
                var mediaType = GetMediaType(mediaUrl);
                payload = new
                {
                    number = formattedPhone,
                    mediaMessage = new
                    {
                        mediatype = mediaType,
                        media = mediaUrl,
                        caption = content
                    }
                };
            }

            var response = await _httpClient.PostAsJsonAsync(
                $"/message/sendText/{_settings.InstanceName}",
                payload,
                cancellationToken);

            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<EvolutionApiResponse>(cancellationToken);
            
            _logger.LogInformation("Mensagem enviada para {Phone} via WhatsApp", phone);
            
            return result?.Key?.Id ?? Guid.NewGuid().ToString();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao enviar mensagem WhatsApp para {Phone}", phone);
            throw;
        }
    }

    public async Task<bool> IsConnectedAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _httpClient.GetAsync(
                $"/instance/connectionState/{_settings.InstanceName}",
                cancellationToken);

            if (!response.IsSuccessStatusCode)
                return false;

            var result = await response.Content.ReadFromJsonAsync<ConnectionStateResponse>(cancellationToken);
            return result?.State == "open";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao verificar conexão WhatsApp");
            return false;
        }
    }

    public async Task<QrCodeResponse> GenerateQrCodeAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _httpClient.GetAsync(
                $"/instance/connect/{_settings.InstanceName}",
                cancellationToken);

            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<QrCodeResponse>(cancellationToken);
            return result ?? throw new Exception("Erro ao gerar QR Code");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao gerar QR Code WhatsApp");
            throw;
        }
    }

    private static string FormatPhoneNumber(string phone)
    {
        // Remove caracteres especiais e espaços
        var cleaned = new string(phone.Where(char.IsDigit).ToArray());

        // Adiciona código do país (55 para Brasil) se não tiver
        if (!cleaned.StartsWith("55") && cleaned.Length == 11)
        {
            cleaned = "55" + cleaned;
        }

        return cleaned;
    }

    private static string GetMediaType(string mediaUrl)
    {
        var extension = Path.GetExtension(mediaUrl).ToLower();
        return extension switch
        {
            ".jpg" or ".jpeg" or ".png" or ".gif" => "image",
            ".mp4" or ".avi" or ".mov" => "video",
            ".mp3" or ".ogg" or ".wav" => "audio",
            ".pdf" or ".doc" or ".docx" => "document",
            _ => "document"
        };
    }
}

// Internal records for Evolution API response mapping make sense here or in a separate file.
// keeping them here as internal/private or public within the same file for simplicity as per user request.

public record EvolutionApiResponse(
    EvolutionApiKey? Key,
    string? Message
);

public record EvolutionApiKey(string Id);

public record ConnectionStateResponse(string State);
