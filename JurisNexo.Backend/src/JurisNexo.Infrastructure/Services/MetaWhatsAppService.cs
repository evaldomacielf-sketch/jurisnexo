using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using JurisNexo.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace JurisNexo.Infrastructure.Services;

public class MetaWhatsAppService : IWhatsAppClient
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<MetaWhatsAppService> _logger;
    private readonly HttpClient _httpClient;

    public MetaWhatsAppService(IConfiguration configuration, ILogger<MetaWhatsAppService> logger, HttpClient httpClient)
    {
        _configuration = configuration;
        _logger = logger;
        _httpClient = httpClient;
        
        var accessToken = _configuration["WhatsApp:Meta:AccessToken"];
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
    }

    public async Task<string> SendMessageAsync(string phone, string content, string? mediaUrl = null, CancellationToken cancellationToken = default)
    {
        var phoneNumberId = _configuration["WhatsApp:Meta:PhoneNumberId"];
        var baseUrl = $"https://graph.facebook.com/v18.0/{phoneNumberId}/messages";

        object payload;
        if (!string.IsNullOrEmpty(mediaUrl))
        {
            var mediaType = DetermineMediaType(mediaUrl);
            var mediaContent = new Dictionary<string, object>
            {
                { "messaging_product", "whatsapp" },
                { "to", phone },
                { "type", mediaType },
                { mediaType, new { link = mediaUrl } }
            };
            payload = mediaContent;
        }
        else
        {
            payload = new
            {
                messaging_product = "whatsapp",
                recipient_type = "individual",
                to = phone,
                type = "text",
                text = new { preview_url = true, body = content }
            };
        }

        var response = await _httpClient.PostAsJsonAsync(baseUrl, payload, cancellationToken);
        var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("Error sending WhatsApp message: {Status} - {Response}", response.StatusCode, responseContent);
            throw new Exception($"Failed to send WhatsApp message: {responseContent}");
        }

        using var doc = JsonDocument.Parse(responseContent);
        return doc.RootElement.GetProperty("messages")[0].GetProperty("id").GetString() ?? "";
    }

    public async Task<string> SendTemplateAsync(string phone, string templateName, string language, object[] parameters, CancellationToken cancellationToken = default)
    {
        var phoneNumberId = _configuration["WhatsApp:Meta:PhoneNumberId"];
        var baseUrl = $"https://graph.facebook.com/v18.0/{phoneNumberId}/messages";

        var payload = new
        {
            messaging_product = "whatsapp",
            to = phone,
            type = "template",
            template = new
            {
                name = templateName,
                language = new { code = language },
                components = new[]
                {
                    new
                    {
                        type = "body",
                        parameters = parameters.Select(p => new { type = "text", text = p.ToString() }).ToArray()
                    }
                }
            }
        };

        var response = await _httpClient.PostAsJsonAsync(baseUrl, payload, cancellationToken);
        var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("Error sending WhatsApp template: {Status} - {Response}", response.StatusCode, responseContent);
            throw new Exception($"Failed to send WhatsApp template: {responseContent}");
        }

        using var doc = JsonDocument.Parse(responseContent);
        return doc.RootElement.GetProperty("messages")[0].GetProperty("id").GetString() ?? "";
    }

    public Task<bool> IsConnectedAsync(CancellationToken cancellationToken = default)
    {
        // For Meta API, check if accessToken and PhoneId are present
        var accessToken = _configuration["WhatsApp:Meta:AccessToken"];
        var phoneId = _configuration["WhatsApp:Meta:PhoneNumberId"];
        return Task.FromResult(!string.IsNullOrEmpty(accessToken) && !string.IsNullOrEmpty(phoneId));
    }

    public Task<JurisNexo.Application.DTOs.WhatsApp.QrCodeResponse> GenerateQrCodeAsync(CancellationToken cancellationToken = default)
    {
        throw new NotSupportedException("Meta Business API does not use QR Code pairing.");
    }

    private string DetermineMediaType(string url)
    {
        var ext = Path.GetExtension(url).ToLower();
        return ext switch
        {
            ".jpg" or ".jpeg" or ".png" => "image",
            ".mp4" => "video",
            ".pdf" or ".docx" or ".xlsx" => "document",
            ".mp3" or ".ogg" => "audio",
            _ => "document"
        };
    }
}
