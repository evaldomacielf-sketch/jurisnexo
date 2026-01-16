using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Core.Entities;
using JurisNexo.Infrastructure.Data;
using Microsoft.Extensions.Logging;

namespace JurisNexo.Infrastructure.Services
{
    public class SmartLeadRoutingService : ISmartLeadRoutingService
    {
        private readonly ApplicationDbContext _context;
        private readonly IInboxNotificationService _inboxNotificationService;
        private readonly ILeadNotificationService _leadNotificationService;
        private readonly ILogger<SmartLeadRoutingService> _logger;

        public SmartLeadRoutingService(
            ApplicationDbContext context,
            IInboxNotificationService inboxNotificationService,
            ILeadNotificationService leadNotificationService,
            ILogger<SmartLeadRoutingService> logger)
        {
            _context = context;
            _inboxNotificationService = inboxNotificationService;
            _leadNotificationService = leadNotificationService;
            _logger = logger;
        }

        public async Task<Guid> AssignLeadToAdvogadoAsync(Lead lead)
        {
            // 1. Buscar advogados disponíveis para o tipo de caso
            // Fetch users with Lawyer role (or all if not distinguished strictly yet)
            // And Include AssignedLeads for workload calc
            var advogados = await _context.Users
                .Include(u => u.AssignedLeads)
                .Where(u => u.Role == UserRole.Lawyer || u.Role == UserRole.Admin) // Including Admin as fallback
                .ToListAsync();
            
            // Filter by "Available"? (e.g. not on vacation - user didn't specify vacation logic yet)
            
            if (!advogados.Any())
            {
                _logger.LogWarning("No lawyers found in database.");
                // Return Empty or assign to first available user?
                // Throwing exception might block operation.
                // Let's fallback to assigning to 'AssignedToUserId' if provided, or leave unassigned.
                return Guid.Empty;
            }

            // 2. Aplicar regras de roteamento e Score
            var scored = advogados.Select(adv => new
            {
                Advogado = adv,
                Score = CalculateRoutingScore(adv, lead)
            }).OrderByDescending(x => x.Score).ToList();
            
            // Log scores for debugging
            foreach(var s in scored)
            {
                _logger.LogInformation("Lawyer {Name} Score: {Score}", s.Advogado.Name, s.Score);
            }

            // 3. Selecionar o melhor advogado
            var selectedAdvogado = scored.First().Advogado;
            
            // 4. Criar atribuição (Update Lead)
            lead.AssignedToUserId = selectedAdvogado.Id;
            lead.AssignedToUserName = selectedAdvogado.Name;
            lead.AssignedAt = DateTime.UtcNow;
            lead.Status = LeadStatus.Assigned;

            _context.LeadAssignments.Add(new LeadAssignment
            {
                 LeadId = lead.Id,
                 AssignedUserId = selectedAdvogado.Id,
                 AssignedAt = DateTime.UtcNow,
                 AssignmentReason = $"Smart Routing (Score: {scored.First().Score})"
            });
            
            await _context.SaveChangesAsync();
            
            // 5. Notificar advogado
            // 5. Notificar advogado
            var scoreObj = new LeadScore 
            { 
                ScoreValue = lead.Score
            };
            await _leadNotificationService.NotifyAdvogadoAsync(selectedAdvogado.Id, lead, scoreObj);
            
            return selectedAdvogado.Id;
        }

        private int CalculateRoutingScore(User advogado, Lead lead)
        {
            var score = 0;
            
            // 1. Especialização (peso: 40)
            // Check based on Specializations list
            var specs = advogado.Specializations;
            if (!string.IsNullOrEmpty(lead.CaseType) && 
                specs.Any(s => s.Contains(lead.CaseType, StringComparison.OrdinalIgnoreCase) || lead.CaseType.Contains(s, StringComparison.OrdinalIgnoreCase)))
            {
                score += 40;
            }
            
            // 2. Taxa de conversão histórica (peso: 25)
            // Stored as 0.0-1.0 (e.g. 0.3 for 30%)
            // If stored as percentage (0-100), adjust. Assuming 0.0-1.0 based on "ConversionRate * 25".
             score += (int)(advogado.ConversionRate * 25);
            
            // 3. Carga de trabalho atual (peso: 20)
            // Count active leads
            var workload = advogado.AssignedLeads.Count(l => 
                l.Status == LeadStatus.New || 
                l.Status == LeadStatus.Qualifying || 
                l.Status == LeadStatus.Qualified || 
                l.Status == LeadStatus.Assigned || 
                l.Status == LeadStatus.Contacted || 
                l.Status == LeadStatus.Negotiating);

            score += workload switch
            {
                0 => 20,
                1 => 15,
                2 => 10,
                3 => 5,
                _ => 0
            };
            
            // 4. Tempo médio de resposta (peso: 15)
            var avgResponseTime = advogado.AvgResponseTimeMinutes > 0 ? advogado.AvgResponseTimeMinutes : 60; // Default to 60 if 0
            score += avgResponseTime switch
            {
                <= 15 => 15,
                <= 30 => 10,
                <= 60 => 5,
                _ => 0
            };
            
            return score;
        }


    }
}
