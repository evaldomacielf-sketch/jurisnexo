using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace JurisNexo.Application.Common.Interfaces
{
    public interface IAuditService
    {
        /// <summary>
        /// Log an audit event
        /// </summary>
        Task LogAsync(AuditLogEntry entry);
        
        /// <summary>
        /// Log an audit event with entity change tracking
        /// </summary>
        Task LogChangeAsync<T>(string action, T oldValue, T newValue, Guid? userId = null);
        
        /// <summary>
        /// Get audit logs with filters
        /// </summary>
        Task<AuditLogResult> GetAuditLogsAsync(AuditLogFilter filter);
        
        /// <summary>
        /// Export audit logs to CSV
        /// </summary>
        Task<byte[]> ExportAuditLogsAsync(DateTime startDate, DateTime endDate, string? entityType = null);
        
        /// <summary>
        /// Get audit logs for a specific entity
        /// </summary>
        Task<IEnumerable<AuditLogDto>> GetEntityHistoryAsync(string entityType, string entityId);
    }

    public class AuditLogEntry
    {
        public string EntityType { get; set; } = string.Empty;
        public string EntityId { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public Guid? UserId { get; set; }
        public string? Details { get; set; }
        public string? IpAddress { get; set; }
        public bool IsCritical { get; set; }
        public string? OldValue { get; set; }
        public string? NewValue { get; set; }
    }

    public class AuditLogDto
    {
        public Guid Id { get; set; }
        public string EntityType { get; set; } = string.Empty;
        public string EntityId { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string? UserName { get; set; }
        public Guid? UserId { get; set; }
        public string? Details { get; set; }
        public string? IpAddress { get; set; }
        public DateTime Timestamp { get; set; }
        public bool IsCritical { get; set; }
    }

    public class AuditLogFilter
    {
        public string? EntityType { get; set; }
        public string? EntityId { get; set; }
        public Guid? UserId { get; set; }
        public string? Action { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool? IsCritical { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 50;
    }

    public class AuditLogResult
    {
        public IEnumerable<AuditLogDto> Items { get; set; } = new List<AuditLogDto>();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    }
}
