using System;
using System.Collections.Generic;
using JurisNexo.Core.Entities;

namespace JurisNexo.Application.DTOs
{
    public class LeadDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string PhoneNumber { get; set; }
        public string Status { get; set; } // Keeping as string for DTO serialization or use generic enum converter
        public string Source { get; set; }
        public int Score { get; set; } // 0-100
        public string Quality { get; set; } // Low, Medium, High
        
        // Qualificação
        public string CaseType { get; set; }
        public string CaseDescription { get; set; }
        public bool HasExistingCase { get; set; }
        public string Urgency { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        
        // Roteamento
        public Guid? AssignedToUserId { get; set; }
        public string AssignedToUserName { get; set; }
        public DateTime? AssignedAt { get; set; }
        public DateTime? FirstContactAt { get; set; }
        public DateTime? ConvertedAt { get; set; }
        
        // Metrics
        public TimeSpan? ResponseTime { get; set; }
        public int InteractionCount { get; set; }
        
        public List<LeadQualificationAnswerDto> Answers { get; set; }
        public List<LeadInteractionDto> Interactions { get; set; }
    }

    public class LeadQualificationAnswerDto
    {
        public Guid QuestionId { get; set; }
        public string QuestionText { get; set; }
        public string AnswerText { get; set; }
    }

    public class LeadInteractionDto
    {
        public DateTime OccurredAt { get; set; }
        public string Type { get; set; } // Message, Call, Note
        public string Details { get; set; }
    }
    
    // Additional DTOs for creating/updating
    public class CreateLeadDto
    {
        public string Name { get; set; }
        public string PhoneNumber { get; set; }
        public LeadSource Source { get; set; }
    }
    
    public class UpdateLeadQualificationDto
    {
        public string CaseType { get; set; }
        public string Urgency { get; set; }
        // ... other fields
    }

    public class QualificationFlowDto
    {
        public Guid LeadId { get; set; }
        public string MessageToUser { get; set; } 
        public Guid? QuestionId { get; set; }
        public bool IsComplete { get; set; }
        public string InputType { get; set; } // "Text", "Option"
        public List<string> Options { get; set; }
    }

    public class LeadFunnelDto 
    {
        public int Captured { get; set; }
        public int New { get; set; }
        public int Qualifying { get; set; }
        public int Qualified { get; set; }
        public int Contacted { get; set; }
        public int Negotiating { get; set; }
        public int Converted { get; set; }
        public int Lost { get; set; }
        public decimal ConversionRate { get; set; }
    }



    public class AssignLeadRequest
    {
        public Guid AdvogadoId { get; set; }
    }

    public class ConvertLeadRequest
    {
        public Guid AdvogadoId { get; set; }
    }

    public class MarkLeadLostRequest
    {
        public string Reason { get; set; }
    }

    public class CreateFollowUpRequest
    {
        public DateTime DueDate { get; set; }
        public string Description { get; set; }
    }

    public class LeadDetailsDto : LeadDto
    {
        public List<LeadScoreDto> ScoreHistory { get; set; }
        public List<LeadFollowUpDto> FollowUpTasks { get; set; }
    }

    public class LeadScoreDto
    {
        public int ScoreValue { get; set; }
        public string Reason { get; set; }
        public DateTime ScoredAt { get; set; }
    }

    public class LeadFollowUpDto
    {
        public Guid Id { get; set; }
        public string TaskDescription { get; set; }
        public DateTime DueDate { get; set; }
        public bool IsCompleted { get; set; }
    }

    public class LeadDashboardDto
    {
        public LeadFunnelDto Funnel { get; set; }
        public List<LeadDto> RecentLeads { get; set; }
        public int PendingFollowUps { get; set; }
    }

    public class PagedResult<T>
    {
        public IEnumerable<T> Items { get; set; }
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    }
}
