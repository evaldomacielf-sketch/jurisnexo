using System.Text.RegularExpressions;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Domain.Entities;
using JurisNexo.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace JurisNexo.Application.Services;

public class WhatsAppChatbotService : IWhatsAppChatbotService
{
    private readonly IAIClassifierService _aiClassifier;
    private readonly ILogger<WhatsAppChatbotService> _logger;
    private readonly IRepository<WhatsAppConversation> _whatsappRepo;
    private readonly ICaseRepository _caseRepo;

    public WhatsAppChatbotService(
        IAIClassifierService aiClassifier,
        ILogger<WhatsAppChatbotService> logger,
        IRepository<WhatsAppConversation> whatsappRepo,
        ICaseRepository caseRepo)
    {
        _aiClassifier = aiClassifier;
        _logger = logger;
        _whatsappRepo = whatsappRepo;
        _caseRepo = caseRepo;
    }

    public async Task<string?> GetResponseAsync(Guid tenantId, string customerPhone, string message, CancellationToken cancellationToken = default)
    {
        var entities = ExtractEntities(message);
        var intent = await DetectIntentAsync(message, entities, cancellationToken);

        if (intent == WhatsAppIntent.Urgent)
        {
            return null; // Human intervention needed
        }

        if (intent == WhatsAppIntent.ProcessStatus && entities.ProcessNumber != null)
        {
            var caseItem = await _caseRepo.GetByCaseNumberAsync(tenantId, entities.ProcessNumber, cancellationToken);
            if (caseItem != null)
            {
                var context = $"O cliente perguntou sobre o processo {caseItem.CaseNumber}. " +
                              $"Status atual: {caseItem.Status}. " +
                              $"Última atualização: {caseItem.UpdatedAt}. " +
                              $"Descrição do caso: {caseItem.Description}. " +
                              $"Advogado responsável: {caseItem.ResponsibleLawyer?.Name ?? "Não atribuído"}.";

                var systemPrompt = "Você é um assistente jurídico virtual da JurisNexo. " +
                                   "Use as informações fornecidas para responder ao cliente de forma educada e profissional sobre o status do processo. " +
                                   "Não invente informações. Se algo não estiver claro, peça para aguardar o advogado.";

                return await _aiClassifier.GenerateResponseAsync(systemPrompt, $"Contexto: {context}\nMensagem do cliente: {message}", cancellationToken);
            }
            else
            {
                return "Não encontrei um processo com esse número em nosso sistema. Poderia verificar se o número está correto?";
            }
        }

        if (intent == WhatsAppIntent.Greeting)
        {
             return await _aiClassifier.GenerateResponseAsync(
                 "Você é um assistente jurídico cordial e profissional. Dê as boas vindas e pergunte como ajudar.",
                 message, cancellationToken);
        }

        // General inquiry - try to answer with AI general knowledge or specific instructions
        return await _aiClassifier.GenerateResponseAsync(
            "Você é um assistente jurídico. O cliente fez uma pergunta geral. " +
            "Se for sobre agendamento, peça para sugerir um horário. " +
            "Se for dúvida jurídica complexa, diga que um advogado irá responder. " +
            "Se for simples, tente ajudar com base em conhecimentos gerais de direito brasileiro, mas com isenção de responsabilidade.",
            message, cancellationToken);
    }

    private WhatsAppEntities ExtractEntities(string message)
    {
        var entities = new WhatsAppEntities();

        // Regex for Process Number (CNJ standard: 0000000-00.0000.0.00.0000)
        var processMatch = Regex.Match(message, @"\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}");
        if (processMatch.Success) entities.ProcessNumber = processMatch.Value;

        // Regex for CPF
        var cpfMatch = Regex.Match(message, @"\d{3}\.\d{3}\.\d{3}-\d{2}");
        if (cpfMatch.Success) entities.Cpf = cpfMatch.Value;

        return entities;
    }

    private async Task<WhatsAppIntent> DetectIntentAsync(string message, WhatsAppEntities entities, CancellationToken cancellationToken)
    {
        var classification = await _aiClassifier.ClassifyUrgencyAsync(message, cancellationToken);
        if (classification.IsUrgent) return WhatsAppIntent.Urgent;

        if (entities.ProcessNumber != null) return WhatsAppIntent.ProcessStatus;

        var msgLower = message.ToLower();
        if (msgLower.Contains("olá") || msgLower.Contains("oi") || msgLower.Contains("bom dia"))
            return WhatsAppIntent.Greeting;

        if (msgLower.Contains("documento") || msgLower.Contains("anexo") || msgLower.Contains("pdf"))
            return WhatsAppIntent.SendDocuments;

        return WhatsAppIntent.GeneralInquiry;
    }
}

public class WhatsAppEntities
{
    public string? ProcessNumber { get; set; }
    public string? Cpf { get; set; }
}

public enum WhatsAppIntent
{
    Greeting,
    ProcessStatus,
    Urgent,
    SendDocuments,
    GeneralInquiry
}
