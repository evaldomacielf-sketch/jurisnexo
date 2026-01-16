using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.SignalR;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Domain.Entities;
using JurisNexo.Infrastructure.Data;
using JurisNexo.Infrastructure.Hubs;

namespace JurisNexo.Infrastructure.Services
{
    public class AuditService : IAuditService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<InboxHub> _hubContext;
        private readonly ILogger<AuditService> _logger;

        // Critical actions that require notification
        private static readonly HashSet<string> CriticalActions = new()
        {
            "ConsentRevoked",
            "DataExported",
            "SLABreached",
            "ConversationTransferred",
            "UserDeleted",
            "SecurityIncident"
        };

        public AuditService(
            ApplicationDbContext context,
            IHubContext<InboxHub> hubContext,
            ILogger<AuditService> logger)
        {
            _context = context;
            _hubContext = hubContext;
            _logger = logger;
        }

        /// <summary>
        /// Log an audit event
        /// </summary>
        public async Task LogAsync(AuditLogEntry entry)
        {
            var auditLog = new AuditLog
            {
                Id = Guid.NewGuid(),
                EntityType = entry.EntityType,
                EntityId = entry.EntityId,
                Action = entry.Action,
                UserId = entry.UserId,
                Details = entry.Details,
                IpAddress = entry.IpAddress,
                Timestamp = DateTime.UtcNow,
                IsCritical = entry.IsCritical || CriticalActions.Contains(entry.Action),
                OldValue = entry.OldValue,
                NewValue = entry.NewValue
            };

            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Audit: {Action} on {EntityType}:{EntityId} by User:{UserId}",
                entry.Action, entry.EntityType, entry.EntityId, entry.UserId
            );

            // Notify compliance for critical actions
            if (auditLog.IsCritical)
            {
                await NotifyComplianceTeamAsync(auditLog);
            }
        }

        /// <summary>
        /// Log an audit event with entity change tracking
        /// </summary>
        public async Task LogChangeAsync<T>(string action, T oldValue, T newValue, Guid? userId = null)
        {
            var typeName = typeof(T).Name;
            var entry = new AuditLogEntry
            {
                EntityType = typeName,
                EntityId = GetEntityId(newValue) ?? GetEntityId(oldValue) ?? Guid.NewGuid().ToString(),
                Action = action,
                UserId = userId,
                OldValue = oldValue != null ? JsonSerializer.Serialize(oldValue) : null,
                NewValue = newValue != null ? JsonSerializer.Serialize(newValue) : null,
                Details = $"Changed {typeName}"
            };

            await LogAsync(entry);
        }

        /// <summary>
        /// Get audit logs with filters
        /// </summary>
        public async Task<AuditLogResult> GetAuditLogsAsync(AuditLogFilter filter)
        {
            var query = _context.AuditLogs
                .Include(a => a.User)
                .AsQueryable();

            if (!string.IsNullOrEmpty(filter.EntityType))
                query = query.Where(a => a.EntityType == filter.EntityType);

            if (!string.IsNullOrEmpty(filter.EntityId))
                query = query.Where(a => a.EntityId == filter.EntityId);

            if (filter.UserId.HasValue)
                query = query.Where(a => a.UserId == filter.UserId);

            if (!string.IsNullOrEmpty(filter.Action))
                query = query.Where(a => a.Action.Contains(filter.Action));

            if (filter.StartDate.HasValue)
                query = query.Where(a => a.Timestamp >= filter.StartDate);

            if (filter.EndDate.HasValue)
                query = query.Where(a => a.Timestamp <= filter.EndDate);

            if (filter.IsCritical.HasValue)
                query = query.Where(a => a.IsCritical == filter.IsCritical);

            var totalCount = await query.CountAsync();

            var logs = await query
                .OrderByDescending(a => a.Timestamp)
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return new AuditLogResult
            {
                Items = logs.Select(MapToDto),
                TotalCount = totalCount,
                Page = filter.Page,
                PageSize = filter.PageSize
            };
        }

        /// <summary>
        /// Export audit logs to CSV
        /// </summary>
        public async Task<byte[]> ExportAuditLogsAsync(DateTime startDate, DateTime endDate, string? entityType = null)
        {
            var filter = new AuditLogFilter
            {
                StartDate = startDate,
                EndDate = endDate,
                EntityType = entityType,
                PageSize = int.MaxValue
            };

            var result = await GetAuditLogsAsync(filter);

            var csv = new StringBuilder();
            csv.AppendLine("Timestamp,EntityType,EntityId,Action,UserName,UserId,IpAddress,IsCritical,Details");

            foreach (var log in result.Items)
            {
                var details = log.Details?.Replace("\"", "\"\"") ?? "";
                csv.AppendLine($"\"{log.Timestamp:yyyy-MM-dd HH:mm:ss}\",\"{log.EntityType}\",\"{log.EntityId}\",\"{log.Action}\",\"{log.UserName}\",\"{log.UserId}\",\"{log.IpAddress}\",\"{log.IsCritical}\",\"{details}\"");
            }

            // Log the export itself
            await LogAsync(new AuditLogEntry
            {
                EntityType = "AuditLog",
                EntityId = "Export",
                Action = "AuditExported",
                Details = $"Exported {result.TotalCount} records from {startDate:yyyy-MM-dd} to {endDate:yyyy-MM-dd}",
                IsCritical = true
            });

            return Encoding.UTF8.GetBytes(csv.ToString());
        }

        /// <summary>
        /// Get audit logs for a specific entity
        /// </summary>
        public async Task<IEnumerable<AuditLogDto>> GetEntityHistoryAsync(string entityType, string entityId)
        {
            var logs = await _context.AuditLogs
                .Include(a => a.User)
                .Where(a => a.EntityType == entityType && a.EntityId == entityId)
                .OrderByDescending(a => a.Timestamp)
                .Take(100)
                .ToListAsync();

            return logs.Select(MapToDto);
        }

        #region Helpers

        private AuditLogDto MapToDto(AuditLog log)
        {
            return new AuditLogDto
            {
                Id = log.Id,
                EntityType = log.EntityType,
                EntityId = log.EntityId,
                Action = log.Action,
                UserName = log.User?.Name,
                UserId = log.UserId,
                Details = log.Details,
                IpAddress = log.IpAddress,
                Timestamp = log.Timestamp,
                IsCritical = log.IsCritical
            };
        }

        private string? GetEntityId<T>(T entity)
        {
            if (entity == null) return null;
            
            var idProperty = typeof(T).GetProperty("Id");
            if (idProperty == null) return null;
            
            var value = idProperty.GetValue(entity);
            return value?.ToString();
        }

        private async Task NotifyComplianceTeamAsync(AuditLog log)
        {
            _logger.LogWarning(
                "🚨 Critical Audit Event: {Action} on {EntityType}:{EntityId}",
                log.Action, log.EntityType, log.EntityId
            );

            await _hubContext.Clients.Group("Compliance").SendAsync("CriticalAuditEvent", new
            {
                log.Id,
                log.EntityType,
                log.EntityId,
                log.Action,
                log.Details,
                log.Timestamp,
                message = $"🚨 Ação crítica: {log.Action} em {log.EntityType}"
            });
        }

        #endregion
    }
}
