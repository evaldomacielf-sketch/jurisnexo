using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Core.Entities;
using Microsoft.Extensions.Logging;

namespace JurisNexo.Infrastructure.Services
{
    public class LeadQualificationBot : ILeadQualificationBot
    {
        private readonly IAIClassifierService _openAI; // Adapting existing service
        private readonly ILeadQualificationService _leadService;
        private readonly IWhatsAppService _whatsapp;
        private readonly ILogger<LeadQualificationBot> _logger;

        public LeadQualificationBot(
            IAIClassifierService openAI,
            ILeadQualificationService leadService,
            IWhatsAppService whatsapp,
            ILogger<LeadQualificationBot> logger)
        {
            _openAI = openAI;
            _leadService = leadService;
            _whatsapp = whatsapp;
            _logger = logger;
        }

        // Perguntas de qualificação (ordem sequencial)
        public static readonly List<QualificationQuestion> Questions = new()
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
            if (lead == null) return "Erro: Lead não encontrado.";

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

                if (currentQuestionIndex < Questions.Count)
                {
                    var currentQuestion = Questions[currentQuestionIndex];
                    
                    // Salvar resposta
                    await _leadService.SaveAnswerAsync(leadId, currentQuestion.Id, message);
                    
                    // Verificar se terminou as perguntas (increment check because we just saved 1)
                    if (currentQuestionIndex + 1 >= Questions.Count)
                    {
                        return await FinishQualificationAsync(lead);
                    }
                    
                    // Enviar próxima pergunta
                    return await SendNextQuestionAsync(lead, currentQuestionIndex + 1);
                }
                else
                {
                    // Already finished but status mismatch?
                    return await FinishQualificationAsync(lead);
                }
            }
            
            // Se já foi qualificado, encaminhar para IA conversacional
            // Using AI Service with System Prompt
            var systemPrompt = "Você é um assistente jurídico da JurisNexo. O cliente já foi qualificado. Responda dúvidas gerais ou peça para aguardar o advogado.";
            return await _openAI.GenerateResponseAsync(systemPrompt, message, default);
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
            
            // Reload Lead to get updated Quality/Score
            lead = await _leadService.GetLeadAsync(lead.Id);

            // 2. Atualizar status e atribuir
            await _leadService.UpdateLeadStatusAsync(lead.Id, LeadStatus.Qualified);
            
            // 3. Atribuir para advogado
            var advogadoId = await _leadService.AssignLeadToAdvogadoAsync(lead.Id);
            
            // 4. Notificar advogado
            await NotifyAdvogadoAsync(advogadoId, lead, score);
            
            // 5. Resposta para o lead
            return $"Obrigado, {lead.Name}! ✅\n\n" +
                   $"Recebi todas as informações. Um de nossos advogados especializados " +
                   $"em *{lead.CaseType ?? "seu caso"}* entrará em contato com você em breve.\n\n" +
                   $"Tempo médio de resposta: " +
                   (lead.Quality == LeadQuality.High ? "*15 minutos*" : "*1 hora*") + " ⏱️\n\n" +
                   $"Enquanto isso, fique à vontade para enviar mais detalhes ou documentos relacionados ao seu caso.";
        }

        private async Task NotifyAdvogadoAsync(Guid advogadoId, Lead lead, LeadScore score)
        {
            _logger.LogInformation("Notifying lawyer {AdvogadoId} about lead {LeadId}", advogadoId, lead.Id);
            // In a real scenario, use IInboxNotificationService or Send Email/Push.
            // Since User didn't provide implementation for this helper, I log it.
            // I can also store a System Message in the Lawyer's Inbox if I had a way.
            await Task.CompletedTask;
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
