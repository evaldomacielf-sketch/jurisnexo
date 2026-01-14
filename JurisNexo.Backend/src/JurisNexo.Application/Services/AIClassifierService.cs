using Microsoft.Extensions.Logging;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Domain.Entities;

namespace JurisNexo.Application.Services;

public class AIClassifierService : IAIClassifierService
{
    private readonly ILogger<AIClassifierService> _logger;
    
    // Keywords de urgência
    private static readonly string[] UrgentKeywords = new[]
    {
        "urgente", "emergência", "prisão", "preso", "detido", "flagrante",
        "audiência hoje", "audiência amanhã", "prazo vence", "prazo hoje",
        "mandado de prisão", "busca e apreensão", "despejo", "liminar",
        "habeas corpus", "hc", "socorro", "ajuda urgente", "imediato"
    };

    private static readonly string[] HighPriorityKeywords = new[]
    {
        "prazo", "audiência", "intimação", "citação", "sentença",
        "recurso", "processo", "advogado", "consulta", "reunião"
    };

    public AIClassifierService(ILogger<AIClassifierService> logger)
    {
        _logger = logger;
    }

    public Task<UrgencyClassificationResult> ClassifyUrgencyAsync(
        string messageContent,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(messageContent))
        {
             return Task.FromResult(new UrgencyClassificationResult(
                IsUrgent: false,
                Priority: ConversationPriority.Normal,
                Confidence: 0.0,
                DetectedKeywords: new List<string>()
            ));
        }

        var normalizedContent = messageContent.ToLowerInvariant();
        
        // Verifica keywords de urgência
        var hasUrgentKeyword = UrgentKeywords.Any(k => normalizedContent.Contains(k));
        
        if (hasUrgentKeyword)
        {
            _logger.LogWarning("Mensagem urgente detectada: {Content}", messageContent);
            
            return Task.FromResult(new UrgencyClassificationResult(
                IsUrgent: true,
                Priority: ConversationPriority.Urgent,
                Confidence: 0.9,
                DetectedKeywords: UrgentKeywords.Where(k => normalizedContent.Contains(k)).ToList()
            ));
        }

        // Verifica keywords de alta prioridade
        var hasHighPriorityKeyword = HighPriorityKeywords.Any(k => normalizedContent.Contains(k));
        
        if (hasHighPriorityKeyword)
        {
            return Task.FromResult(new UrgencyClassificationResult(
                IsUrgent: false,
                Priority: ConversationPriority.High,
                Confidence: 0.7,
                DetectedKeywords: HighPriorityKeywords.Where(k => normalizedContent.Contains(k)).ToList()
            ));
        }

        // Prioridade normal
        return Task.FromResult(new UrgencyClassificationResult(
            IsUrgent: false,
            Priority: ConversationPriority.Normal,
            Confidence: 0.5,
            DetectedKeywords: new List<string>()
        ));
    }
}
