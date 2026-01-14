using JurisNexo.Domain.Entities;

namespace JurisNexo.Application.Common.Interfaces;

public interface IAIClassifierService
{
    Task<UrgencyClassificationResult> ClassifyUrgencyAsync(string messageContent, CancellationToken cancellationToken = default);
}

public record UrgencyClassificationResult(
    bool IsUrgent,
    ConversationPriority Priority,
    double Confidence,
    List<string> DetectedKeywords
);
