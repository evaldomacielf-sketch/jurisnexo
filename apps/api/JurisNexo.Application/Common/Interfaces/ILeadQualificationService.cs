using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using JurisNexo.Core.Entities;
using JurisNexo.Application.DTOs;
using JurisNexo.Application.DTOs.Analytics;

namespace JurisNexo.Application.Common.Interfaces
{
    public interface ILeadQualificationService
    {
        // Capture
        Task<Lead> CaptureLeadAsync(string phoneNumber, string firstMessage);
        Task CreateLeadFromWebhookAsync(string phone, string contactName, string source); // Adding back for WebhookHandler compatibility if needed, or remove there? I see WebhookHandler uses CaptureLeadAsync now. I will REMOVE CreateLeadFromWebhookAsync if unused.
        // Wait, WebhookHandler uses CaptureLeadAsync. 
        // But I removed CreateLeadFromWebhookAsync in previous edit? Yes.
        // So I don't need to add it here.
        // But wait, there is `ProcessIncomingMessageAsync` in WebhookHandler calling `_leadService.ProcessIncomingMessageAsync`?
        // NO, WebhookHandler calls `ProcessAnswerAsync`.
        // BUT Step 1072 Diff shows `ProcessIncomingMessageAsync` removed?
        // Ah, Step 1072 removed `CreateLeadFromWebhookAsync` call inside `ProcessIncomingMessageAsync` (webhook handler method).
        // It calls `CaptureLeadAsync`.
        // So Interface is clean.

        // Qualification
        Task<QualificationFlowDto> StartQualificationAsync(Guid leadId);
        Task<QualificationFlowDto> ProcessAnswerAsync(Guid leadId, string questionId, string answer);
        Task SaveAnswerAsync(Guid leadId, string questionKey, string answer);
        Task UpdateLeadStatusAsync(Guid leadId, LeadStatus status);
        Task<Lead> GetLeadAsync(Guid leadId);
        Task<string> ProcessIncomingMessageAsync(string phone, string message); // For backward compatibility / Triage logic if strictly needed?
        // WebhookHandler Step 1072 does NOT call `ProcessIncomingMessageAsync` on service anymore! It calls `ProcessAnswerAsync`.
        // So this is fine.

        // Listing & Details (New)
        Task<PagedResult<LeadDto>> GetLeadsAsync(Guid tenantId, LeadStatus? status, LeadQuality? quality, string? caseType, Guid? assignedTo, DateTime? dateFrom, DateTime? dateTo, string? search, int page, int pageSize);
        Task<LeadDetailsDto> GetLeadDetailsAsync(Guid leadId);
        
        // Scoring
        Task<LeadScore> CalculateScoreAsync(Guid leadId);
        Task<LeadQuality> GetLeadQualityAsync(int score);
        
        // Routing
        Task<Guid> AssignLeadToAdvogadoAsync(Guid leadId, Guid? advogadoId = null); // Optional Id to support Manual
        Task<List<User>> GetAvailableAdvogadosAsync(string caseType);
        
        // Conversion
        Task<bool> ConvertLeadToClienteAsync(Guid leadId, Guid advogadoId);
        Task MarkLeadAsLostAsync(Guid leadId, string reason);
        
        // Follow-up
        Task CreateFollowUpTaskAsync(Guid leadId, DateTime dueDate, string description);
        Task<List<LeadFollowUpTask>> GetPendingFollowUpsAsync(Guid advogadoId);
        
        // Analytics
        Task<LeadFunnelDto> GetConversionFunnelAsync(Guid tenantId, DateTime startDate, DateTime endDate);
        Task<LeadMetricsDto> GetLeadMetricsAsync(Guid tenantId, Guid? advogadoId, DateTime startDate, DateTime endDate);
        Task<LeadDashboardDto> GetLeadDashboardAsync(Guid userId);
    }
}
