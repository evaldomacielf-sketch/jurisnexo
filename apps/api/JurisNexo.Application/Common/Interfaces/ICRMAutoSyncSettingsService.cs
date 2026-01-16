using System;
using System.Threading.Tasks;
using JurisNexo.Core.Entities;

namespace JurisNexo.Application.Common.Interfaces
{
    public interface ICRMAutoSyncSettingsService
    {
        Task<CRMAutoSyncSettings> GetAutoSyncSettingsAsync(Guid escritorioId);
        Task UpdateAutoSyncSettingsAsync(Guid escritorioId, UpdateAutoSyncSettingsRequest request);
    }

    public class UpdateAutoSyncSettingsRequest
    {
        public bool SyncOnLeadCreated { get; set; }
        public bool SyncOnLeadQualified { get; set; }
        public bool SyncOnLeadConverted { get; set; }
        public bool SyncOnlyHighQualityLeads { get; set; }
        public bool SalesforceEnabled { get; set; }
        public bool HubSpotEnabled { get; set; }
        public bool PipedriveEnabled { get; set; }
        public bool RDStationEnabled { get; set; }
    }
}
