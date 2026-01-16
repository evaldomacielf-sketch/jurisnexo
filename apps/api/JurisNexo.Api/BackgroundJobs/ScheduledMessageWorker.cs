using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Core.Entities;
using JurisNexo.Core.Enums;
using JurisNexo.Infrastructure.Data;

namespace JurisNexo.API.BackgroundJobs
{
    public class ScheduledMessageWorker : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<ScheduledMessageWorker> _logger;

        public ScheduledMessageWorker(
            IServiceProvider serviceProvider,
            ILogger<ScheduledMessageWorker> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Scheduled Message Worker starting...");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessScheduledMessagesAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in Scheduled Message Worker");
                }

                // Check every 30 seconds
                await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
            }
        }

        private async Task ProcessScheduledMessagesAsync(CancellationToken stoppingToken)
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var whatsAppClient = scope.ServiceProvider.GetRequiredService<IWhatsAppClient>();
            var schedulingService = scope.ServiceProvider.GetRequiredService<IWhatsAppSchedulingService>();

            var now = DateTime.UtcNow;

            // 1. Process pending scheduled messages
            var pending = await context.ScheduledMessages
                .Where(s => s.Status == ScheduledMessageStatus.Pending && s.ScheduledFor <= now)
                .Include(s => s.Conversation)
                .ToListAsync(stoppingToken);

            foreach (var scheduled in pending)
            {
                try
                {
                    // Send message
                    await whatsAppClient.SendMessageAsync(
                        scheduled.Conversation.CustomerPhone,
                        scheduled.Message
                    );

                    scheduled.SentAt = DateTime.UtcNow;

                    // If requires confirmation, update status
                    if (scheduled.RequestConfirmation)
                    {
                        scheduled.Status = ScheduledMessageStatus.AwaitingConfirmation;
                        
                        _logger.LogInformation(
                            "Scheduled message {MessageId} sent, awaiting confirmation",
                            scheduled.Id
                        );
                    }
                    else
                    {
                        scheduled.Status = ScheduledMessageStatus.Sent;
                        
                        _logger.LogInformation(
                            "Scheduled message {MessageId} sent successfully",
                            scheduled.Id
                        );
                    }
                }
                catch (Exception ex)
                {
                    scheduled.RetryCount++;
                    
                    if (scheduled.RetryCount >= 3)
                    {
                        scheduled.Status = ScheduledMessageStatus.Failed;
                        scheduled.ErrorMessage = ex.Message;
                        
                        _logger.LogError(ex, 
                            "Scheduled message {MessageId} failed after {RetryCount} retries",
                            scheduled.Id, scheduled.RetryCount
                        );
                    }
                    else
                    {
                        scheduled.NextRetryAt = DateTime.UtcNow.AddMinutes(5 * scheduled.RetryCount);
                        
                        _logger.LogWarning(
                            "Scheduled message {MessageId} failed, retry {RetryCount} at {NextRetry}",
                            scheduled.Id, scheduled.RetryCount, scheduled.NextRetryAt
                        );
                    }
                }
            }

            // 2. Send reminders for unconfirmed messages (after 24h)
            var unconfirmed = await context.ScheduledMessages
                .Where(s => s.Status == ScheduledMessageStatus.AwaitingConfirmation &&
                            s.SentAt != null &&
                            s.SentAt.Value.AddHours(24) <= now)
                .Include(s => s.Conversation)
                .ToListAsync(stoppingToken);

            foreach (var awaiting in unconfirmed)
            {
                try
                {
                    await whatsAppClient.SendMessageAsync(
                        awaiting.Conversation.CustomerPhone,
                        "⏰ Lembrete: Aguardamos sua confirmação sobre o agendamento anterior. Responda CONFIRMO ou CANCELAR."
                    );

                    // Mark as expired if no response after reminder
                    awaiting.Status = ScheduledMessageStatus.Expired;
                    
                    _logger.LogInformation(
                        "Scheduled message {MessageId} expired - reminder sent",
                        awaiting.Id
                    );
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, 
                        "Failed to send reminder for scheduled message {MessageId}",
                        awaiting.Id
                    );
                }
            }

            await context.SaveChangesAsync(stoppingToken);
        }
    }
}
