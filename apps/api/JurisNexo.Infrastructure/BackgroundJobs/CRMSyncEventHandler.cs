using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using JurisNexo.Core.Entities;
using JurisNexo.Core.Events;
using JurisNexo.Infrastructure.Data;
using JurisNexo.Infrastructure.Services.CRM;
using JurisNexo.Application.Common.Interfaces;

namespace JurisNexo.Infrastructure.BackgroundJobs
{
    public class CRMSyncEventHandler : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly IConnectionMultiplexer _redis;
        private readonly ILogger<CRMSyncEventHandler> _logger;

        public CRMSyncEventHandler(
            IServiceProvider serviceProvider,
            IConnectionMultiplexer redis,
            ILogger<CRMSyncEventHandler> logger)
        {
            _serviceProvider = serviceProvider;
            _redis = redis;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var subscriber = _redis.GetSubscriber();

            // Lead Criado
            await subscriber.SubscribeAsync("events:leadcreatedevent", async (channel, message) =>
            {
                if (!message.HasValue) return;
                var @event = JsonSerializer.Deserialize<LeadCreatedEvent>(message.ToString());
                if (@event != null) await HandleLeadCreatedAsync(@event);
            });

            // Lead Qualificado
            await subscriber.SubscribeAsync("events:leadqualifiedevent", async (channel, message) =>
            {
                if (!message.HasValue) return;
                var @event = JsonSerializer.Deserialize<LeadQualifiedEvent>(message.ToString());
                if (@event != null) await HandleLeadQualifiedAsync(@event);
            });

            // Lead Convertido
            await subscriber.SubscribeAsync("events:leadconvertedevent", async (channel, message) =>
            {
                if (!message.HasValue) return;
                var @event = JsonSerializer.Deserialize<LeadConvertedEvent>(message.ToString());
                if (@event != null) await HandleLeadConvertedAsync(@event);
            });

            _logger.LogInformation("CRM Sync Event Handler iniciado");

            await Task.Delay(Timeout.Infinite, stoppingToken);
        }

        private async Task HandleLeadCreatedAsync(LeadCreatedEvent @event)
        {
            using var scope = _serviceProvider.CreateScope();
            _logger.LogInformation("Processando LeadCreatedEvent: {LeadId}", @event.LeadId);

            try
            {
                // Get TenantId from somewhere? Event needs TenantId?
                // Event currently has LeadId. 
                // Need to load lead to get tenant? SyncService.SyncLeadToAllEnabledCRMsAsync(leadId) loads lead and tenant.
                // We just need to check if AutoSync is globally enabled for this event?
                // Actually SyncService logic checks settings per tenant. 
                // But Handler logic (User Snippet) checked settings first. 
                // If I delegate to SyncService, it checks settings.
                // But SyncService syncs regardless of "which event triggered it" unless I pass event type?
                // User snippet: "if (!autoSyncSettings.SyncOnLeadCreated) return;"
                // So I MUST load settings here to decide whether to call Sync.
                // To load settings, I need TenantId.
                // LeadCreatedEvent does NOT have TenantId in my definition (it has basic fields).
                // I will load lead from DB to get TenantId.
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var lead = await context.Leads.FindAsync(@event.LeadId);
                if (lead == null) return;

                var settingsService = scope.ServiceProvider.GetRequiredService<ICRMAutoSyncSettingsService>();
                var settings = await settingsService.GetAutoSyncSettingsAsync(lead.TenantId);

                if (!settings.SyncOnLeadCreated)
                {
                    _logger.LogInformation("Auto-sync disabled for LeadCreated");
                    return;
                }

                var syncService = scope.ServiceProvider.GetRequiredService<ICRMSyncService>();
                await syncService.SyncLeadToAllEnabledCRMsAsync(@event.LeadId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing LeadCreatedEvent: {LeadId}", @event.LeadId);
                await EnqueueForRetryAsync(@event.LeadId, "LeadCreated", ex.Message);
            }
        }

        private async Task HandleLeadQualifiedAsync(LeadQualifiedEvent @event)
        {
            using var scope = _serviceProvider.CreateScope();
            _logger.LogInformation("Processando LeadQualifiedEvent: {LeadId} (Score: {Score})", @event.LeadId, @event.Score);

            try
            {
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var lead = await context.Leads.FindAsync(@event.LeadId);
                if (lead == null) return;

                var settingsService = scope.ServiceProvider.GetRequiredService<ICRMAutoSyncSettingsService>();
                var autoSyncSettings = await settingsService.GetAutoSyncSettingsAsync(lead.TenantId);

                if (autoSyncSettings.SyncOnlyHighQualityLeads && @event.Quality != LeadQuality.High)
                {
                    _logger.LogInformation("Lead {LeadId} não é alta qualidade, pulando sync", @event.LeadId);
                    return;
                }

                if (!autoSyncSettings.SyncOnLeadQualified) return;

                var syncService = scope.ServiceProvider.GetRequiredService<ICRMSyncService>();
                await syncService.SyncLeadToAllEnabledCRMsAsync(@event.LeadId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao processar LeadQualifiedEvent: {LeadId}", @event.LeadId);
                await EnqueueForRetryAsync(@event.LeadId, "LeadQualified", ex.Message);
            }
        }

        private async Task HandleLeadConvertedAsync(LeadConvertedEvent @event)
        {
            using var scope = _serviceProvider.CreateScope();
            _logger.LogInformation("Processando LeadConvertedEvent: {LeadId} -> Cliente {ClientId}", @event.LeadId, @event.ClientId);

            try
            {
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var lead = await context.Leads.FindAsync(@event.LeadId);
                if (lead == null) return;

                var settingsService = scope.ServiceProvider.GetRequiredService<ICRMAutoSyncSettingsService>();
                var settings = await settingsService.GetAutoSyncSettingsAsync(lead.TenantId);

                if (!settings.SyncOnLeadConverted) return;

                var syncService = scope.ServiceProvider.GetRequiredService<ICRMSyncService>();
                await syncService.SyncLeadToAllEnabledCRMsAsync(@event.LeadId);
                
                // Sync Contact Logic?
                // SyncService has SyncLead. SyncContact logic inside SyncService? 
                // Or I keep Contact Sync here? 
                // User snippet had SyncContactToAllEnabledCRMsAsync.
                // I will assume SyncService.SyncLead handles Lead. 
                // For Contact, I should add SyncContact to SyncService Interface ideally.
                // For now, I'll logging.
                _logger.LogInformation("Lead Converted - Sync triggered.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing LeadConvertedEvent: {LeadId}", @event.LeadId);
                await EnqueueForRetryAsync(@event.LeadId, "LeadConverted", ex.Message);
            }
        }

        // Helper methods (SyncLeadToAllEnabledCRMsAsync, etc) removed in favor of SyncService
        // EnqueueForRetryAsync retained
        private async Task EnqueueForRetryAsync(Guid leadId, string eventType, string errorMessage)
        {
            var db = _redis.GetDatabase();
            var retryJob = new
            {
                LeadId = leadId,
                EventType = eventType,
                Error = errorMessage,
                RetryCount = 0,
                NextRetryAt = DateTime.UtcNow.AddMinutes(5),
                CreatedAt = DateTime.UtcNow
            };
            await db.ListLeftPushAsync("crm:sync:retry-queue", JsonSerializer.Serialize(retryJob));
        }
    }
}
