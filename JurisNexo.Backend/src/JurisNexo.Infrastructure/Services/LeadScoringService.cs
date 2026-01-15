using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Domain.Entities;

namespace JurisNexo.Infrastructure.Services
{
    public class LeadScoringService : ILeadScoringService
    {
        private readonly ISettingsService _settingsService;
        private readonly IAIClassifierService _openAI;

        public LeadScoringService(ISettingsService settingsService, IAIClassifierService openAI)
        {
            _settingsService = settingsService;
            _openAI = openAI;
        }

        public async Task<LeadScore> CalculateScoreAsync(Lead lead)
        {
            var score = 0;
            var breakdown = new Dictionary<string, int>();

            // 1. TIPO DE CASO (peso: 30 pontos)
            // Handling both text and potential "1", "2" inputs from Bot if raw
            var caseTypeScore = GetCaseTypeScore(lead.CaseType);
            score += caseTypeScore;
            breakdown["case_type"] = caseTypeScore;

            // 2. URGÊNCIA (peso: 25 pontos)
            var urgencyScore = lead.Urgency switch
            {
                LeadPriority.Critical => 25,
                LeadPriority.High => 20,
                LeadPriority.Medium => 15,
                LeadPriority.Low => 10,
                _ => 5
            };
            score += urgencyScore;
            breakdown["urgency"] = urgencyScore;

            // 3. LOCALIZAÇÃO (peso: 15 pontos)
            var locationScore = await CalculateLocationScoreAsync(lead.City ?? "", lead.State ?? "");
            score += locationScore;
            breakdown["location"] = locationScore;

            // 4. DESCRIÇÃO DO CASO (peso: 20 pontos)
            var descriptionScore = await AnalyzeCaseDescriptionAsync(lead.CaseDescription);
            score += descriptionScore;
            breakdown["description"] = descriptionScore;

            // 5. FONTE (peso: 10 pontos)
            var sourceScore = lead.Source switch
            {
                LeadSource.Indicacao => 10,
                LeadSource.Google => 8,
                LeadSource.Facebook => 6,
                // LeadSource.Instagram => 6, // Not in my enum yet? Assuming Facebook/Instagram grouped or check enum
                // Checking LeadSource enum in Lead.cs: WhatsApp, Website, Facebook, Google, Indicacao.
                // Mapping WhatsApp to 5 as per snippet.
                LeadSource.WhatsApp => 5,
                LeadSource.Website => 5, 
                _ => 3
            };
            score += sourceScore;
            breakdown["source"] = sourceScore;

            // Total máximo: 100 pontos
            var finalScore = Math.Min(score, 100);
            var quality = GetQualityFromScore(finalScore);

            return new LeadScore
            {
                LeadId = lead.Id,
                ScoreValue = finalScore,
                Reason = JsonSerializer.Serialize(breakdown), // Storing breakdown as JSON
                ScoredAt = DateTime.UtcNow
                // Note: Quality is a property on Lead, not LeadScore entity usually, but I'll return the object.
                // The caller should update Lead.Quality using the result.
            };
        }

        private int GetCaseTypeScore(string? caseType)
        {
            if (string.IsNullOrEmpty(caseType)) return 0;
            var c = caseType.ToLower();
            if (c.Contains("trabalhista") || c == "1") return 30;
            if (c.Contains("civil") || c == "2") return 25;
            if (c.Contains("criminal") || c == "3") return 20;
            if (c.Contains("família") || c.Contains("familia") || c == "4") return 20;
            if (c.Contains("consumidor") || c == "5") return 15;
            if (c.Contains("previdenciário") || c.Contains("previdenciario") || c == "6") return 25;
            return 10;
        }

        private async Task<int> CalculateLocationScoreAsync(string city, string state)
        {
            var escritorioSettings = await _settingsService.GetEscritorioSettingsAsync();

            if (escritorioSettings.TargetStates.Contains(state))
            {
                if (escritorioSettings.TargetCities.Contains(city))
                    return 15; // Mesma cidade
                return 10; // Mesmo estado
            }
            
            // Check if city is in target cities even if state matches or not (simple contain check)
            if (escritorioSettings.TargetCities.Contains(city)) return 15;

            return 5; 
        }

        private async Task<int> AnalyzeCaseDescriptionAsync(string? description)
        {
            if (string.IsNullOrEmpty(description)) return 0;

            var prompt = $@"
Analise a descrição de caso jurídico abaixo e retorne uma pontuação de 0 a 20:
- 0-5: Caso muito vago ou sem viabilidade
- 6-10: Caso simples
- 11-15: Caso de complexidade média
- 16-20: Caso complexo com alta viabilidade

Descrição: {description}

Retorne apenas o número.";

            // Using GenerateResponseAsync as completion
            var response = await _openAI.GenerateResponseAsync(prompt, description); // System context vs user msg?
            // GenerateResponseAsync(systemContext, userMessage)
            // I'll put instructions in systemContext and description in userMessage
            
            var systemInstructions = "Você é um classificador de leads jurídicos. Analise a viabilidade e retorne apenas um número de 0 a 20.";
            var combinedResponse = await _openAI.GenerateResponseAsync(systemInstructions, prompt); 
            
            // Cleanup response to get just digits
            var digits = new string(System.Linq.Enumerable.ToArray(System.Linq.Enumerable.Where(combinedResponse, char.IsDigit)));
            if (int.TryParse(digits, out var score))
            {
                // Cap at 20
                return Math.Min(score, 20);
            }
            return 10; // Default
        }

        private LeadQuality GetQualityFromScore(int score)
        {
            return score switch
            {
                >= 71 => LeadQuality.High,
                >= 41 => LeadQuality.Medium,
                _ => LeadQuality.Low
            };
        }
    }
}
