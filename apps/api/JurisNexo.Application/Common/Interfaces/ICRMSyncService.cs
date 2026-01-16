using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using JurisNexo.Core.Entities;

namespace JurisNexo.Application.Common.Interfaces
{
    public interface ICRMSyncService
    {
        Task SyncLeadToAllEnabledCRMsAsync(Guid leadId);
        Task<TestConnectionResult> TestConnectionAsync(string crmName);
        Task<List<SyncHistoryDto>> GetSyncHistoryAsync(Guid escritorioId, DateTime? startDate, DateTime? endDate, string? crmName);
        Task<SyncQueueStatusDto> GetQueueStatusAsync();
    }

    public class TestConnectionResult
    {
        public bool Success { get; set; }
        public string Message { get; set; }
    }

    public class SyncHistoryDto
    {
        public Guid Id { get; set; }
        public string CrmName { get; set; }
        public string EntityType { get; set; }
        public string EntityId { get; set; }
        public string Status { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class SyncQueueStatusDto
    {
        public int PendingItems { get; set; }
        public int RetryItems { get; set; }
    }
}
