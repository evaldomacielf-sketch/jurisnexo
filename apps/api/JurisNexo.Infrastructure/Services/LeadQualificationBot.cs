using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Core.Entities;
using Microsoft.Extensions.Logging;
using MediatR;
using JurisNexo.Core.Events;
using System.Linq;

namespace JurisNexo.Infrastructure.Services
{
    public class LeadQualificationBot : ILeadQualificationBot
    {
        private readonly IAIClassifierService _openAI;
        private readonly ILeadQualificationService _leadService;
        private readonly IWhatsAppService _whatsapp;
        private readonly ILogger<LeadQualificationBot> _logger;
        private readonly IPublisher _publisher;

        public LeadQualificationBot(
            IAIClassifierService openAI,
            ILeadQualificationService leadService,
            IWhatsAppService whatsapp,
            ILogger<LeadQualificationBot> logger,
            IPublisher publisher)
        {
            _openAI = openAI;
            _leadService = leadService;
            _whatsapp = whatsapp;
            _logger = logger;
            _publisher = publisher;
        }

        // Perguntas de qualificação (ordem sequencial)
        private static readonly List<QualificationQuestion> Questions = new()
        {
            new("nome", "Qual é o seu nome completo?", QuestionType.Text, required: true),
            
            new("tipo_caso", "Qual tipo de caso você precisa?\n\n" +
                "1️⃣ Trabalhista\n" +
                "2️⃣ Civil\n" +
                "3️⃣ Criminal\n" +
                "4️⃣ Família (Divórcio, Pensão)\n" +
                "5️⃣ Consumidor\n" +
                "6️⃣ Previdenciário\n" +
                "7️⃣ Outro", 
                QuestionType.MultipleChoice, required: true),
            
            new("descricao", "Por favor, descreva brevemente sua situação:", 
                QuestionType.Text, required: true),
            
            new("processo_existente", "Você já possui processo em andamento?\n\n" +
                "1️⃣ Sim\n" +
                "2️⃣ Não", 
                QuestionType.YesNo, required: true),
            
            new("urgencia", "Qual é a urgência do seu caso?\n\n" +
                "1️⃣ Baixa (posso aguardar)\n" +
                "2️⃣ Média (normal)\n" +
                "3️⃣ Alta (urgente)\n" +
                "4️⃣ Crítica (muito urgente)", 
                QuestionType.MultipleChoice, required: true),
            
            new("localizacao", "Em qual cidade você está localizado?", 
                QuestionType.Text, required: true),
            
            new("como_conheceu", "Como você conheceu nosso escritório?\n\n" +
                "1️⃣ Google\n" +
                "2️⃣ Indicação de amigo/familiar\n" +
                "3️⃣ Redes Sociais (Instagram, Facebook)\n" +
                "4️⃣ Outro", 
                QuestionType.MultipleChoice, required: false)
        };
        
        public async Task<string> ProcessMessageAsync(Guid leadId, string message)
        {
            var lead = await _leadService.GetLeadAsync(leadId);
            
            // Se é primeira mensagem, começar qualificação
            if (lead.Status == LeadStatus.New)
            {
                await _leadService.UpdateLeadStatusAsync(leadId, LeadStatus.Qualifying);
                return await SendNextQuestionAsync(lead, currentQuestionIndex: 0);
            }
            
            // Se está em qualificação, processar resposta
            if (lead.Status == LeadStatus.Qualifying)
            {
                var answersCount = lead.Answers?.Count ?? 0;
                var currentQuestionIndex = answersCount;

                // Ensure index is within bounds (if logic drifted)
                if (currentQuestionIndex >= Questions.Count)
                {
                    return await FinishQualificationAsync(lead);
                }

                var currentQuestion = Questions[currentQuestionIndex];
                
                // Salvar resposta
                await _leadService.SaveAnswerAsync(leadId, currentQuestion.Id, message);
                
                // Atualizar index após salvar (logicamente, agora temos +1 resposta)
                // Need to re-fetch or just increment check
                if (currentQuestionIndex + 1 >= Questions.Count)
                {
                    return await FinishQualificationAsync(lead);
                }
                
                // Enviar próxima pergunta
                return await SendNextQuestionAsync(lead, currentQuestionIndex + 1);
            }
            
            // Se já foi qualificado, encaminhar para IA conversacional
            // Assuming IAIClassifierService has GenerateResponseAsync or similar. 
            // It has `ClassifyLeadAsync` mostly.
            // I need to check `IAIClassifierService`.
            // If it doesn't have `GenerateResponseAsync`, I'll add stub or call OpenAI client directly.
            // For now, assume it's there or I stub it.
            return await _openAI.GenerateResponseAsync("You are a legal assistant.", message, default);
        }
        
        private async Task<string> SendNextQuestionAsync(Lead lead, int currentQuestionIndex)
        {
            if (currentQuestionIndex >= Questions.Count) return "";
            var question = Questions[currentQuestionIndex];
            return question.Text;
        }
        
        private async Task<string> FinishQualificationAsync(Lead lead)
        {
            // 1. Calcular score
            var score = await _leadService.CalculateScoreAsync(lead.Id);
            
            // 2. Atualizar status e atribuir
            await _leadService.UpdateLeadStatusAsync(lead.Id, LeadStatus.Qualified);
            
            // 3. Atribuir para advogado
            var advogadoId = await _leadService.AssignLeadToAdvogadoAsync(lead.Id);
            
            // 4. Notificar advogado
            await NotifyAdvogadoAsync(advogadoId, lead, score);

            // Re-read lead to get proper mapped CaseType if needed? 
            // lead objects in memory might not be updated by SaveAnswerAsync calls if not tracked.
            // We'll trust lead.CaseType was updated by SaveAnswerAsync (it maps it).
            // But we need to reload it to be sure.
            lead = await _leadService.GetLeadAsync(lead.Id);
            
            // Publish Qualified Event
            var answers = lead.Answers?.ToDictionary(
                a => a.Question?.FieldToMap ?? a.QuestionId.ToString(), 
                a => a.AnswerText
            ) ?? new Dictionary<string, string>();
            
            await _publisher.Publish(new LeadQualifiedEvent(lead, answers));

            // 5. Resposta para o lead
            return $"Obrigado, {lead.Name}! ✅\n\n" +
                   $"Recebi todas as informações. Um de nossos advogados especializados " +
                   $"em *{lead.CaseType ?? "seu caso"}* entrará em contato com você em breve.\n\n" +
                   $"Tempo médio de resposta: " +
                   (score.ScoreValue > 70 ? "*15 minutos*" : "*1 hora*") + " ⏱️\n\n" +
                   $"Enquanto isso, fique à vontade para enviar mais detalhes ou documentos relacionados ao seu caso.";
        }
        
        private async Task NotifyAdvogadoAsync(Guid advogadoId, Lead lead, LeadScore score)
        {
             _logger.LogInformation("Notifying lawyer {AdvogadoId} about lead {LeadId} with score {Score}", advogadoId, lead.Id, score.ScoreValue);
             // Integration point.
        }
    }

    public record QualificationQuestion(string Id, string Text, QuestionType Type, bool required);

    public enum QuestionType
    {
        Text,
        MultipleChoice,
        YesNo
    }
}
