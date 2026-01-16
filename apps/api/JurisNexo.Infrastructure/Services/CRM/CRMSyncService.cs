using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using StackExchange.Redis;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Core.Entities;
using JurisNexo.Infrastructure.Data;

namespace JurisNexo.Infrastructure.Services.CRM
{
    public class CRMSyncService : ICRMSyncService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<CRMSyncService> _logger;
        private readonly IConnectionMultiplexer _redis;
        private readonly ICRMAutoSyncSettingsService _settingsService;

        public CRMSyncService(
            IServiceProvider serviceProvider,
            ILogger<CRMSyncService> logger,
            IConnectionMultiplexer redis,
            ICRMAutoSyncSettingsService settingsService)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _redis = redis;
            _settingsService = settingsService;
        }

        public async Task SyncLeadToAllEnabledCRMsAsync(Guid leadId)
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            
            var lead = await context.Leads.FindAsync(leadId);
            if (lead == null) return;
            
            // Assuming Lead.TenantId maps to EscritorioId logic. 
            // In a real app we'd resolve EscritorioId from TenantId cleanly.
            // Using lead.TenantId as EscritorioId.
            var settings = await _settingsService.GetAutoSyncSettingsAsync(lead.TenantId);
            
            var tasks = new List<Task>();

            if (settings.SalesforceEnabled)
            {
                var s = scope.ServiceProvider.GetRequiredService<SalesforceIntegrationService>();
                tasks.Add(s.SyncLeadAsync(lead));
            }
            if (settings.HubSpotEnabled)
            {
                var h = scope.ServiceProvider.GetRequiredService<HubSpotIntegrationService>();
                tasks.Add(h.SyncLeadAsync(lead));
            }
            if (settings.PipedriveEnabled)
            {
                var p = scope.ServiceProvider.GetRequiredService<PipedriveIntegrationService>();
                tasks.Add(p.SyncLeadAsync(lead));
            }
            if (settings.RDStationEnabled)
            {
                var r = scope.ServiceProvider.GetRequiredService<RDStationIntegrationService>();
                tasks.Add(r.SyncLeadAsync(lead));
            }

            if (tasks.Count > 0)
            {
                await Task.WhenAll(tasks);
                
                lead.NeedsCRMSync = false;
                lead.LastCRMSyncAt = DateTime.UtcNow;
                await context.SaveChangesAsync();
                
                _logger.LogInformation("Lead {LeadId} synced via CRMSyncService to enabled CRMs.", leadId);
            }
        }

        public async Task<TestConnectionResult> TestConnectionAsync(string crmName)
        {
            // Simulate test
            await Task.Delay(500); 
            // In real world, resolve service and call a Ping/Auth method.
            return new TestConnectionResult { Success = true, Message = $"Connection to {crmName} success (Simulated)" };
        }

        public async Task<List<SyncHistoryDto>> GetSyncHistoryAsync(Guid escritorioId, DateTime? startDate, DateTime? endDate, string? crmName)
        {
            // Mock History
            return new List<SyncHistoryDto>
            {
                new SyncHistoryDto { Id = Guid.NewGuid(), CrmName = "Salesforce", EntityType = "Lead", EntityId = "LEAD-001", Status = "Success", Timestamp = DateTime.UtcNow.AddMinutes(-10) }
            };
        }

        public async Task<SyncQueueStatusDto> GetQueueStatusAsync()
        {
            var db = _redis.GetDatabase();
            long count = await db.ListLengthAsync("crm:sync:retry-queue");
            return new SyncQueueStatusDto
            {
                PendingItems = 0,
                RetryItems = (int)count
            };
        }
    }
}
