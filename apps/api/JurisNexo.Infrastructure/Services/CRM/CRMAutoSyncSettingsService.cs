using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Core.Entities;
using JurisNexo.Infrastructure.Data;

namespace JurisNexo.Infrastructure.Services.CRM
{
    public class CRMAutoSyncSettingsService : ICRMAutoSyncSettingsService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CRMAutoSyncSettingsService> _logger;

        public CRMAutoSyncSettingsService(ApplicationDbContext context, ILogger<CRMAutoSyncSettingsService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<CRMAutoSyncSettings> GetAutoSyncSettingsAsync(Guid escritorioId)
        {
            var settings = await _context.CRMAutoSyncSettings
                .FirstOrDefaultAsync(s => s.EscritorioId == escritorioId);

            if (settings == null)
            {
                _logger.LogInformation("Creating default CRM settings for Escritorio {EscritorioId}", escritorioId);
                // Create Default
                settings = new CRMAutoSyncSettings
                {
                    EscritorioId = escritorioId,
                    SyncOnLeadCreated = true,
                    SyncOnLeadQualified = true,
                    SyncOnLeadConverted = true,
                    SalesforceEnabled = false,
                    HubSpotEnabled = false,
                    PipedriveEnabled = false,
                    RDStationEnabled = false
                };
                _context.CRMAutoSyncSettings.Add(settings);
                await _context.SaveChangesAsync();
            }

            return settings;
        }

        public async Task UpdateAutoSyncSettingsAsync(Guid escritorioId, UpdateAutoSyncSettingsRequest request)
        {
            var settings = await GetAutoSyncSettingsAsync(escritorioId);
            
            settings.SyncOnLeadCreated = request.SyncOnLeadCreated;
            settings.SyncOnLeadQualified = request.SyncOnLeadQualified;
            settings.SyncOnLeadConverted = request.SyncOnLeadConverted;
            settings.SyncOnlyHighQualityLeads = request.SyncOnlyHighQualityLeads;
            
            settings.SalesforceEnabled = request.SalesforceEnabled;
            settings.HubSpotEnabled = request.HubSpotEnabled;
            settings.PipedriveEnabled = request.PipedriveEnabled;
            settings.RDStationEnabled = request.RDStationEnabled;
            
            settings.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            _logger.LogInformation("Updated CRM settings for Escritorio {EscritorioId}", escritorioId);
        }
    }
}
