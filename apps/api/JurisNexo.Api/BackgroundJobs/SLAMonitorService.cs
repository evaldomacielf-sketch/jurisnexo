using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.SignalR;
using JurisNexo.Core.Entities;
using JurisNexo.Core.Enums;
using JurisNexo.Infrastructure.Data;
using JurisNexo.Infrastructure.Hubs;

namespace JurisNexo.API.BackgroundJobs
{
    public class SLAMonitorService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<SLAMonitorService> _logger;

        // SLA Targets by Priority
        private static readonly Dictionary<QueuePriority, TimeSpan> SLATargets = new()
        {
            { QueuePriority.Critical, TimeSpan.FromMinutes(15) },
            { QueuePriority.High, TimeSpan.FromHours(1) },
            { QueuePriority.Medium, TimeSpan.FromHours(4) },
            { QueuePriority.Low, TimeSpan.FromHours(24) }
        };

        public SLAMonitorService(
            IServiceProvider serviceProvider,
            ILogger<SLAMonitorService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("SLA Monitor Service starting...");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CheckSLAStatusAsync(stoppingToken);
                    _logger.LogDebug("SLA Monitor check completed. Next check in 1 minute.");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in SLA Monitor");
                }

                // Run every 1 minute
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
        }

        private async Task CheckSLAStatusAsync(CancellationToken stoppingToken)
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<InboxHub>>();

            var now = DateTime.UtcNow;

            // 1. Check waiting conversations (not assigned)
            var waitingConversations = await context.WhatsAppConversations
                .Where(c => c.AssignedToUserId == null && 
                            c.SessionStatus == WhatsAppSessionStatus.Active &&
                            c.LastCustomerMessageAt != null)
                .ToListAsync(stoppingToken);

            foreach (var conversation in waitingConversations)
            {
                var priority = DeterminePriority(conversation);
                var waitTime = now - (conversation.LastCustomerMessageAt ?? conversation.CreatedAt);
                var slaTarget = SLATargets[priority];
                var slaRemaining = slaTarget - waitTime;

                // SLA Breached
                if (slaRemaining <= TimeSpan.Zero)
                {
                    await HandleSLABreachAsync(context, hubContext, conversation, waitTime, priority);
                }
                // SLA Warning (80% of time elapsed)
                else if (slaRemaining <= slaTarget * 0.2)
                {
                    await HandleSLAWarningAsync(hubContext, conversation, slaRemaining, priority);
                }
            }

            // 2. Check active conversations without response
            var activeConversations = await context.WhatsAppConversations
                .Where(c => c.AssignedToUserId != null &&
                            c.SessionStatus == WhatsAppSessionStatus.Active &&
                            c.LastCustomerMessageAt > c.LastMessageAt)
                .ToListAsync(stoppingToken);

            foreach (var conversation in activeConversations)
            {
                var timeSinceCustomerMessage = now - (conversation.LastCustomerMessageAt ?? now);

                // If no response in 30 minutes, escalate
                if (timeSinceCustomerMessage >= TimeSpan.FromMinutes(30))
                {
                    await EscalateConversationAsync(context, hubContext, conversation);
                }
            }

            await context.SaveChangesAsync(stoppingToken);
        }

        private QueuePriority DeterminePriority(WhatsAppConversation conversation)
        {
            // Priority based on wait time and other factors
            var waitTime = DateTime.UtcNow - (conversation.LastCustomerMessageAt ?? conversation.CreatedAt);

            if (waitTime.TotalMinutes > 60) return QueuePriority.Critical;
            if (waitTime.TotalMinutes > 30) return QueuePriority.High;
            if (waitTime.TotalMinutes > 15) return QueuePriority.Medium;
            return QueuePriority.Low;
        }

        private async Task HandleSLABreachAsync(
            ApplicationDbContext context,
            IHubContext<InboxHub> hubContext,
            WhatsAppConversation conversation,
            TimeSpan waitTime,
            QueuePriority priority)
        {
            _logger.LogWarning(
                "SLA BREACH: Conversation {ConversationId} waiting for {WaitMinutes:F0} minutes (Priority: {Priority})",
                conversation.Id, waitTime.TotalMinutes, priority
            );

            // Notify all managers via SignalR
            await hubContext.Clients.Group("Managers").SendAsync("SLABreach", new
            {
                conversationId = conversation.Id,
                customerName = conversation.CustomerName,
                customerPhone = conversation.CustomerPhone,
                waitTimeMinutes = (int)waitTime.TotalMinutes,
                priority = priority.ToString(),
                message = $"⚠️ SLA Quebrado: {conversation.CustomerName} aguardando há {waitTime.TotalMinutes:F0} minutos"
            });

            // Notify all available lawyers
            await hubContext.Clients.Group("AvailableLawyers").SendAsync("UrgentConversation", new
            {
                conversationId = conversation.Id,
                customerName = conversation.CustomerName,
                priority = priority.ToString(),
                isSlaBreach = true
            });
        }

        private async Task HandleSLAWarningAsync(
            IHubContext<InboxHub> hubContext,
            WhatsAppConversation conversation,
            TimeSpan remaining,
            QueuePriority priority)
        {
            _logger.LogInformation(
                "SLA Warning: Conversation {ConversationId} has {RemainingMinutes:F0} minutes remaining",
                conversation.Id, remaining.TotalMinutes
            );

            // Notify available lawyers
            await hubContext.Clients.Group("AvailableLawyers").SendAsync("SLAWarning", new
            {
                conversationId = conversation.Id,
                customerName = conversation.CustomerName,
                remainingMinutes = (int)remaining.TotalMinutes,
                priority = priority.ToString(),
                message = $"⏰ SLA: {conversation.CustomerName} - Restam {remaining.TotalMinutes:F0} min"
            });
        }

        private async Task EscalateConversationAsync(
            ApplicationDbContext context,
            IHubContext<InboxHub> hubContext,
            WhatsAppConversation conversation)
        {
            _logger.LogWarning(
                "Escalating conversation {ConversationId} - No response from assigned lawyer",
                conversation.Id
            );

            var previousLawyerId = conversation.AssignedToUserId;

            // Find a supervisor/admin
            var supervisor = await context.Users
                .Where(u => u.Role == UserRole.Admin)
                .OrderBy(u => Guid.NewGuid()) // Random selection
                .FirstOrDefaultAsync();

            if (supervisor != null)
            {
                conversation.AssignedToUserId = supervisor.Id;

                // Notify the supervisor
                await hubContext.Clients.User(supervisor.Id.ToString()).SendAsync("ConversationEscalated", new
                {
                    conversationId = conversation.Id,
                    customerName = conversation.CustomerName,
                    previousLawyerId = previousLawyerId,
                    message = $"🚨 Conversa escalada: {conversation.CustomerName}"
                });

                // Notify the previous lawyer
                if (previousLawyerId.HasValue)
                {
                    await hubContext.Clients.User(previousLawyerId.Value.ToString()).SendAsync("ConversationRemoved", new
                    {
                        conversationId = conversation.Id,
                        reason = "Escalated due to no response"
                    });
                }
            }
            else
            {
                // No supervisor available, notify all managers
                await hubContext.Clients.Group("Managers").SendAsync("EscalationFailed", new
                {
                    conversationId = conversation.Id,
                    customerName = conversation.CustomerName,
                    message = "Nenhum supervisor disponível para escalação"
                });
            }
        }
    }
}
