using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Core.Interfaces;
using MediatR;
using JurisNexo.Core.Events;

namespace JurisNexo.Infrastructure.Services
{
    public class WhatsAppChatbotService : IWhatsAppChatbotService
    {
        private readonly ILeadQualificationBot _qualificationBot;
        private readonly ILogger<WhatsAppChatbotService> _logger;

        private readonly IContactRepository _contactRepository;
        private readonly ICaseRepository _caseRepository;
        private readonly ILeadRepository _leadRepository;
        private readonly IUnitOfWork _unitOfWork;
        // private readonly IPublisher _publisher; // Removed manual publisher
        private readonly ILeadQualificationService _leadQualificationService;

        public WhatsAppChatbotService(
            ILeadQualificationBot qualificationBot,
            ILogger<WhatsAppChatbotService> logger,
            ILeadRepository leadRepository,
            IContactRepository contactRepository,
            ICaseRepository caseRepository,
            IUnitOfWork unitOfWork,
            ILeadQualificationService leadQualificationService)
        {
            _qualificationBot = qualificationBot;
            _logger = logger;
            _leadRepository = leadRepository;
            _contactRepository = contactRepository;
            _caseRepository = caseRepository;
            _unitOfWork = unitOfWork;
            // _publisher = publisher; // Delegate to service
            _leadQualificationService = leadQualificationService;
        }

        public async Task<string?> GetResponseAsync(Guid tenantId, string customerPhone, string message, CancellationToken cancellationToken = default)
        {
            try
            {
                // 1. Check if it's an existing Client (Support Flow)
                // Note: CustomerPhone might need normalization in real app
                var contact = await _contactRepository.GetByPhoneAsync(tenantId, customerPhone, cancellationToken);

                if (contact != null)
                {
                    // Existing Client Logic
                    var lowerMsg = message.ToLower();
                    if (lowerMsg.Contains("processo") || lowerMsg.Contains("andamento") || lowerMsg.Contains("status"))
                    {
                        var (cases, _) = await _caseRepository.SearchAsync(tenantId, null, null, null, contact.Id, null, null, 1, 5, cancellationToken);
                        
                        if (cases != null && cases.Any())
                        {
                            var recentCase = cases.First();
                            // Logic: "Olá! Seu processo {Number} está na fase de {Status}. A última movimentação foi em {Date}."
                            // Assuming Case entity has these fields or similar.
                            // CaseStatus is enum, need toString.
                            return $"Olá {contact.Name}! Seu processo {recentCase.CaseNumber ?? "sem número"} está atualmente na fase: {recentCase.Status}. " +
                                   $"Última atualização: {recentCase.UpdatedAt.ToString("dd/MM/yyyy")}. " +
                                   "Posso ajudar com mais alguma coisa?";
                        }
                        return $"Olá {contact.Name}, não encontrei processos ativos vinculados ao seu telefone.";
                    }
                    else if (lowerMsg.Contains("financeiro") || lowerMsg.Contains("boleto") || lowerMsg.Contains("fatura")) 
                    {
                         return "Para assuntos financeiros, por favor entre em contato com nosso setor financeiro no ramal 2 ou aguarde um atendente.";
                    }
                    else
                    {
                         // Generic support or handoff
                         return $"Olá {contact.Name}, bem-vindo de volta! Como posso ajudar hoje? (Digite 'processo' para ver status)";
                    }
                }

                // 2. New Lead Logic (Sales Flow)
                // Search for existing lead to continue qualification conversation
                var search = await _leadRepository.SearchAsync(tenantId, null, null, null, null, null, customerPhone, 1, 1, cancellationToken);
                var lead = search.Items.FirstOrDefault();

                if (lead == null)
                {
                    // Create new lead via Service (Auto-Sync)
                    lead = await _leadQualificationService.CaptureLeadAsync(customerPhone, message);
                }
                
                // If service returns null (e.g. error), abort
                if (lead == null) return null;

                var response = await _qualificationBot.ProcessMessageAsync(lead.Id, message);
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating chatbot response for {Phone}", customerPhone);
                return null;
            }
        }
    }
}
