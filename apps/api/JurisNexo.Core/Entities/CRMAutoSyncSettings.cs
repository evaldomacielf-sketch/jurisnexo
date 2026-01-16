using System;
using System.Collections.Generic;

namespace JurisNexo.Core.Entities
{
    public class CRMAutoSyncSettings
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid EscritorioId { get; set; } // TenantId
        
        // Eventos que disparam sync automático
        public bool SyncOnLeadCreated { get; set; } = true;
        public bool SyncOnLeadQualified { get; set; } = true;
        public bool SyncOnLeadConverted { get; set; } = true;
        public bool SyncOnContactUpdated { get; set; } = false;
        public bool SyncOnCaseCreated { get; set; } = false;
        
        // Filtros
        public bool SyncOnlyHighQualityLeads { get; set; } = false; // Apenas leads com score >= 70
        public List<string> CaseTypesToSync { get; set; } = new(); // Se vazio, sincroniza todos
        public List<LeadSource> SourcesToSync { get; set; } = new(); // Se vazio, sincroniza todas
        
        // Retry
        public int MaxRetryAttempts { get; set; } = 3;
        public int RetryDelayMinutes { get; set; } = 5;
        
        // CRMs habilitados
        public bool SalesforceEnabled { get; set; } = false;
        public bool HubSpotEnabled { get; set; } = false;
        public bool PipedriveEnabled { get; set; } = false;
        public bool RDStationEnabled { get; set; } = false;
        
        // Mapeamento de campos customizados (JSON)
        public string SalesforceFieldMapping { get; set; } = "{}";
        public string HubSpotFieldMapping { get; set; } = "{}";
        public string PipedriveFieldMapping { get; set; } = "{}";
        public string RDStationFieldMapping { get; set; } = "{}";
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
