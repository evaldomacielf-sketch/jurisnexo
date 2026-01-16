using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Core.Entities;

namespace JurisNexo.Infrastructure.Services
{
    public class WhatsAppTemplateService : IWhatsAppTemplateService
    {
        private readonly ILogger<WhatsAppTemplateService> _logger;
        // In real app, inject IUnitOfWork or specific TemplateRepository

        public WhatsAppTemplateService(ILogger<WhatsAppTemplateService> logger)
        {
            _logger = logger;
        }

        public async Task<IEnumerable<WhatsAppTemplate>> GetTemplatesAsync()
        {
            // Return mock templates as per requirements for immediate UI availability
            var templates = new List<WhatsAppTemplate>
            {
                new WhatsAppTemplate 
                { 
                    Name = "confirmacao_agendamento", 
                    Category = "UTILITY", 
                    Content = "Olá {{nome}}, sua audiência foi agendada para {{data}} às {{hora}}.", 
                    Status = WhatsAppTemplateStatus.Approved,
                    Language = "pt_BR"
                },
                new WhatsAppTemplate 
                { 
                    Name = "lembrete_prazo", 
                    Category = "UTILITY", 
                    Content = "Atenção! O prazo do processo {{numero}} vence em {{dias}} dias.", 
                    Status = WhatsAppTemplateStatus.Approved,
                    Language = "pt_BR"
                },
                new WhatsAppTemplate 
                { 
                    Name = "confirmacao_pagamento", 
                    Category = "TRANSACTIONAL", 
                    Content = "Pagamento de {{valor}} recebido com sucesso. Obrigado!", 
                    Status = WhatsAppTemplateStatus.Approved,
                    Language = "pt_BR"
                },
                new WhatsAppTemplate 
                { 
                    Name = "movimentacao_processual", 
                    Category = "UTILITY", 
                    Content = "Há uma nova movimentação no processo {{numero}}. Acesse para ver.", 
                    Status = WhatsAppTemplateStatus.Approved,
                    Language = "pt_BR"
                },
                new WhatsAppTemplate 
                { 
                    Name = "solicitacao_documentos", 
                    Category = "UTILITY", 
                    Content = "Para prosseguir com seu processo, precisamos de: {{documentos}}", 
                    Status = WhatsAppTemplateStatus.Approved,
                    Language = "pt_BR"
                }
            };

            return await Task.FromResult(templates);
        }

        public async Task<WhatsAppTemplate?> GetTemplateByNameAsync(string name)
        {
            // Placeholder
            return await Task.FromResult<WhatsAppTemplate?>(null);
        }

        public async Task SyncTemplatesAsync()
        {
            // Logic to fetch templates from Meta/Twilio API and update DB
            _logger.LogInformation("Syncing WhatsApp Templates from Provider...");
            await Task.Delay(100); // Simulate API call
            _logger.LogInformation("Templates Synced.");
        }

        public async Task<bool> DeleteTemplateAsync(string name)
        {
            _logger.LogInformation("Deleting template {Name}", name);
            return await Task.FromResult(true);
        }
    }
}
