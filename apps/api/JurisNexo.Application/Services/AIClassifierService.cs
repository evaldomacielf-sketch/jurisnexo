using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Core.Entities;
using Microsoft.Extensions.Logging;

namespace JurisNexo.Application.Services;

public class AIClassifierService : IAIClassifierService
{
    private readonly ILogger<AIClassifierService> _logger;

    public AIClassifierService(ILogger<AIClassifierService> logger)
    {
        _logger = logger;
    }

    public Task<UrgencyClassificationResult> ClassifyUrgencyAsync(string messageContent, CancellationToken cancellationToken = default)
    {
        // Implementação simples baseada em palavras-chave por enquanto
        var urgentKeywords = new[] { "urgente", "prisão", "preso", "audiência hoje", "prazo hoje" };
        var highKeywords = new[] { "intimação", "citação", "recebi oficial", "prazo" };

        var contentLower = messageContent.ToLower();
        var detected = new List<string>();

        foreach (var keyword in urgentKeywords)
        {
            if (contentLower.Contains(keyword))
            {
                detected.Add(keyword);
                return Task.FromResult(new UrgencyClassificationResult(true, ConversationPriority.Urgent, 0.9, detected));
            }
        }

        foreach (var keyword in highKeywords)
        {
            if (contentLower.Contains(keyword))
            {
                detected.Add(keyword);
                return Task.FromResult(new UrgencyClassificationResult(false, ConversationPriority.High, 0.7, detected));
            }
        }

        return Task.FromResult(new UrgencyClassificationResult(false, ConversationPriority.Normal, 0.5, detected));
    }

    public Task<string> GenerateResponseAsync(string systemContext, string userMessage, CancellationToken cancellationToken = default)
    {
        // Fallback implementation: Echo or simple message
        // In reality, this service is only used if OpenAI fails.
        return Task.FromResult("Desculpe, o serviço de inteligência artificial está indisponível no momento. Um humano irá atendê-lo em breve.");
    }
}
