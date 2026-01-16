using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Core.Entities;
using JurisNexo.Infrastructure.Data;
using JurisNexo.Infrastructure.Hubs;

namespace JurisNexo.Infrastructure.Services
{
    public class LeadNotificationService : ILeadNotificationService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<InboxHub> _hubContext;
        private readonly IPushNotificationService _pushService;
        private readonly IEmailService _emailService;
        private readonly ISmsService _smsService;
        private readonly ILogger<LeadNotificationService> _logger;

        public LeadNotificationService(
            ApplicationDbContext context,
            IHubContext<InboxHub> hubContext,
            IPushNotificationService pushService,
            IEmailService emailService,
            ISmsService smsService,
            ILogger<LeadNotificationService> logger)
        {
            _context = context;
            _hubContext = hubContext;
            _pushService = pushService;
            _emailService = emailService;
            _smsService = smsService;
            _logger = logger;
        }

        public async Task NotifyAdvogadoAsync(Guid advogadoId, Lead lead, LeadScore score)
        {
            var advogado = await _context.Users.FindAsync(advogadoId);
            if (advogado == null)
            {
                _logger.LogWarning("Advogado {AdvogadoId} not found for notification", advogadoId);
                return;
            }

            // 1. Notificação In-App (SignalR)
            try
            {
                await _hubContext.Clients.User(advogadoId.ToString())
                    .SendAsync("NewLeadAssigned", new
                    {
                        leadId = lead.Id,
                        leadName = lead.Name,
                        caseType = lead.CaseType,
                        score = score.ScoreValue,
                        quality = lead.Quality,
                        urgency = lead.Urgency
                    });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send SignalR notification");
            }
            
            // 2. Push Notification
            try
            {
                await _pushService.SendAsync(advogadoId, new PushNotification
                {
                    Title = "🎯 Novo Lead Qualificado!",
                    Body = $"{lead.Name} - {lead.CaseType} (Score: {score.ScoreValue}/100)",
                    Data = new { leadId = lead.Id, type = "new_lead" }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send push notification");
            }
            
            // 3. Email (se urgência alta/crítica)
            if (lead.Urgency >= LeadPriority.High)
            {
                try
                {
                    await _emailService.SendEmailAsync(
                         advogado.Email,
                        "🔥 Lead URGENTE atribuído a você",
                        $@"
                        <h2>Olá {advogado.Name},</h2>
                        <p>Um lead <strong>URGENTE</strong> foi atribuído a você.</p>
                        <ul>
                            <li><strong>Nome:</strong> {lead.Name}</li>
                            <li><strong>Tipo de Caso:</strong> {lead.CaseType}</li>
                            <li><strong>Descrição:</strong> {lead.CaseDescription}</li>
                            <li><strong>Score:</strong> {score.ScoreValue}/100</li>
                            <li><strong>Urgência:</strong> {lead.Urgency}</li>
                        </ul>
                        <p><a href='https://app.jurisnexo.com/whatsapp?lead={lead.Id}'>Acessar Lead Agora</a></p>
                        "
                        // Note: User snippet used 'Template' logic ("lead-urgent-assignment"). 
                        // Since I don't have a template engine configured here, implementation remains HTML string for now.
                        // I preserved the structure but adapted to existing EmailService call.
                    );
                }
                catch (Exception ex)
                {
                     _logger.LogError(ex, "Failed to send email notification");
                }
            }
            
            // 4. SMS (se crítico)
            // User snippet checks: if (lead.Urgency == LeadUrgency.Critical)
            // Existing code checks: if (lead.Urgency == LeadPriority.Critical && !string.IsNullOrEmpty(advogado.Phone))
            if (lead.Urgency == LeadPriority.Critical && !string.IsNullOrEmpty(advogado.Phone)) // Assuming 'Phone' is correct property on User entity
            {
                try
                {
                    await _smsService.SendAsync(advogado.Phone,
                        $"URGENTE: Novo lead {lead.Name} ({lead.CaseType}) aguardando seu contato. Score: {score.ScoreValue}/100");
                }
                catch (Exception ex)
                {
                     _logger.LogError(ex, "Failed to send SMS notification");
                }
            }
        }
    }
}
