using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Application.Common.Settings;
using JurisNexo.Domain.Entities;
using JurisNexo.Application.Services;

namespace JurisNexo.Infrastructure.Services;

/// <summary>
/// Classificador avançado usando OpenAI GPT para análise de contexto
/// </summary>
public class OpenAIClassifierService : IAIClassifierService
{
    private readonly HttpClient _httpClient;
    private readonly OpenAISettings _settings;
    private readonly ILogger<OpenAIClassifierService> _openAiLogger;
    private readonly ILogger<AIClassifierService> _fallbackLogger;

    public OpenAIClassifierService(
        HttpClient httpClient,
        IOptions<OpenAISettings> settings,
        ILogger<OpenAIClassifierService> openAiLogger,
        ILogger<AIClassifierService> fallbackLogger)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _openAiLogger = openAiLogger;
        _fallbackLogger = fallbackLogger;

        _httpClient.BaseAddress = new Uri("https://api.openai.com/v1/");
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_settings.ApiKey}");
    }

    public async Task<UrgencyClassificationResult> ClassifyUrgencyAsync(
        string messageContent,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var prompt = $@"
Você é um assistente jurídico especializado em triagem de mensagens.
Analise a mensagem abaixo e classifique o nível de urgência:

Mensagem: ""{messageContent}""

Classifique como:
- URGENTE: Prisões, audiências imediatas, prazos críticos (vencendo hoje/amanhã)
- ALTA: Intimações, citações, prazos próximos
- NORMAL: Consultas gerais, dúvidas

Responda APENAS com um JSON no formato:
{{
  ""urgency"": ""URGENTE"" | ""ALTA"" | ""NORMAL"",
  ""confidence"": 0.0-1.0,
  ""reasoning"": ""breve explicação""
}}";

            var requestBody = new
            {
                model = "gpt-4o-mini",
                messages = new[]
                {
                    new { role = "system", content = "Você é um assistente jurídico especializado." },
                    new { role = "user", content = prompt }
                },
                temperature = 0.3,
                max_tokens = 150
            };

            var response = await _httpClient.PostAsJsonAsync("chat/completions", requestBody, cancellationToken);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<OpenAIResponse>(cancellationToken);
            var content = result?.Choices?.FirstOrDefault()?.Message?.Content ?? "{}";

            // Remove markdown code block if present
            content = content.Replace("```json", "").Replace("```", "").Trim();

            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };
            var classification = JsonSerializer.Deserialize<AIClassification>(content, options);

            var priority = classification?.Urgency?.ToUpperInvariant() switch
            {
                "URGENTE" => ConversationPriority.Urgent,
                "ALTA" => ConversationPriority.High,
                _ => ConversationPriority.Normal
            };

            return new UrgencyClassificationResult(
                IsUrgent: priority == ConversationPriority.Urgent,
                Priority: priority,
                Confidence: classification?.Confidence ?? 0.5,
                DetectedKeywords: new List<string> { classification?.Reasoning ?? "" }
            );
        }
        catch (Exception ex)
        {
            _openAiLogger.LogError(ex, "Erro ao classificar urgência com OpenAI");
            
            // Fallback para classificador simples
            // Note: In a real DI scenario we might inject the fallback service, but per user request we instantiate it.
            // We needed to inject the specific logger for the fallback service to pass it in.
            return await new AIClassifierService(_fallbackLogger).ClassifyUrgencyAsync(messageContent, cancellationToken);
        }
    }

    public async Task<string> GenerateResponseAsync(string systemContext, string userMessage, CancellationToken cancellationToken = default)
    {
        try
        {
            var requestBody = new
            {
                model = "gpt-4o-mini",
                messages = new[]
                {
                    new { role = "system", content = systemContext },
                    new { role = "user", content = userMessage }
                },
                temperature = 0.5,
                max_tokens = 300
            };

            var response = await _httpClient.PostAsJsonAsync("chat/completions", requestBody, cancellationToken);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<OpenAIResponse>(cancellationToken);
            return result?.Choices?.FirstOrDefault()?.Message?.Content ?? "Desculpe, não consegui processar sua solicitação no momento.";
        }
        catch (Exception ex)
        {
            _openAiLogger.LogError(ex, "Erro ao gerar resposta com OpenAI");
            return "Desculpe, estamos enfrentando uma instabilidade momentânea. Por favor, tente novamente em alguns instantes ou aguarde o atendimento humano.";
        }
    }

    private record OpenAIResponse(
        [property: JsonPropertyName("choices")] List<OpenAIChoice>? Choices
    );
    private record OpenAIChoice(
        [property: JsonPropertyName("message")] OpenAIMessage? Message
    );
    private record OpenAIMessage(
        [property: JsonPropertyName("content")] string? Content
    );
    private record AIClassification(
        string? Urgency,
        double Confidence,
        string? Reasoning
    );
}
