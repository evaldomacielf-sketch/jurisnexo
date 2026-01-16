using System;
using System.Collections.Generic;
using JurisNexo.Core.Common;

namespace JurisNexo.Core.Entities
{
    public enum LeadStatus
    {
        New,              // Recém chegou
        Qualifying,       // Bot está fazendo perguntas
        Qualified,        // Qualificado, aguardando atribuição
        Assigned,         // Atribuído a advogado
        Contacted,        // Advogado já entrou em contato
        Negotiating,      // Em negociação
        Won,              // Virou cliente! 🎉 (Converted)
        Lost,             // Perdeu o lead
        Spam             // Spam/inválido
    }

    public enum LeadSource
    {
        WhatsApp,
        Website,
        Facebook,
        Google,
        Indicacao
    }

    public enum LeadQuality
    {
        Low,      // 0-40 pontos (🔴)
        Medium,   // 41-70 pontos (🟡)
        High      // 71-100 pontos (🟢)
    }

    public enum LeadPriority
    {
        Low,       // Pode aguardar
        Medium,    // Prioridade normal
        High,      // Urgente (responder em 1h)
        Critical   // Crítico (responder em 15min)
    }

    public class Lead : TenantEntity
    {
        public string Name { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public LeadStatus Status { get; set; } = LeadStatus.New;
        public LeadSource Source { get; set; }
        public int Score { get; set; } // 0-100
        public LeadQuality Quality { get; set; }
        
        // Qualification Data
        public string? CaseType { get; set; } // Trabalhista, Civil, Criminal, Familia, Consumidor
        public string? CaseDescription { get; set; }
        public bool HasExistingCase { get; set; }
        public LeadPriority Urgency { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        
        // Routing & Assignment
        public Guid? AssignedToUserId { get; set; }
        public string? AssignedToUserName { get; set; } 
        
        public DateTime? AssignedAt { get; set; }
        public DateTime? FirstContactAt { get; set; }
        public DateTime? ConvertedAt { get; set; }
        
        // Metrics
        public TimeSpan? ResponseTime { get; set; }
        public int InteractionCount { get; set; }

        // Navigation Properties
        public ICollection<LeadQualificationAnswer> Answers { get; set; }
        public ICollection<LeadScore> ScoreHistory { get; set; }
        public ICollection<LeadAssignment> AssignmentHistory { get; set; }
        public ICollection<LeadFollowUpTask> FollowUpTasks { get; set; }
        
        // CRM / Pipeline Data
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public float? Probability { get; set; } // Float or decimal? DefaultProbability in Stage is likely float/decimal.
        public string Currency { get; set; } = "BRL";
        public string? LostReason { get; set; }
        public DateTime? ExpectedCloseDate { get; set; }
        public DateTime? ActualCloseDate { get; set; }
        public DateTime? LastContactDate { get; set; }
        public DateTime? NextFollowUpDate { get; set; }
        public decimal EstimatedValue { get; set; }
        public Guid? PipelineId { get; set; }
        public virtual Pipeline? Pipeline { get; set; }
        public Guid? StageId { get; set; }
        public virtual Stage? Stage { get; set; }
        public Guid? ContactId { get; set; }
        public virtual Contact? Contact { get; set; }
        public double Position { get; set; }
        
        public virtual User? AssignedToUser { get; set; } // Navigation property for AssignedToUserId

        public string? Tags { get; set; }

        public ICollection<LeadActivity> Activities { get; set; }
        public Lead()
        {
            Activities = new List<LeadActivity>();
            Answers = new List<LeadQualificationAnswer>();
            ScoreHistory = new List<LeadScore>();
            AssignmentHistory = new List<LeadAssignment>();
            FollowUpTasks = new List<LeadFollowUpTask>();
        }
    }

    public class LeadQualificationQuestion : TenantEntity
    {
        public string QuestionText { get; set; } = string.Empty;
        public string FieldToMap { get; set; } = string.Empty; // e.g., "City", "CaseType"
        public int Order { get; set; }
        public bool IsActive { get; set; }
        public string ExpectedResponseType { get; set; } = "Text"; // Text, Number, Option
        public string? OptionsJson { get; set; } // For simple choice validation
    }

    public class LeadQualificationAnswer : TenantEntity
    {
        public Guid LeadId { get; set; }
        public virtual Lead Lead { get; set; } = null!;
        public Guid QuestionId { get; set; }
        public virtual LeadQualificationQuestion Question { get; set; } = null!;
        public string AnswerText { get; set; } = string.Empty;
    }

    public class LeadScore : TenantEntity
    {
        public Guid LeadId { get; set; }
        public virtual Lead Lead { get; set; } = null!;
        public int ScoreValue { get; set; }
        public string Reason { get; set; } = string.Empty; // e.g., "High Urgency (+20)"
        public DateTime ScoredAt { get; set; }
    }

    public class LeadRoutingRule : TenantEntity
    {
        public string RuleName { get; set; } = string.Empty;
        public string CriteriaJson { get; set; } = "{}"; // e.g. { "CaseType": "Trabalhista", "MinScore": 70 }
        public Guid TargetUserId { get; set; }
        public int Priority { get; set; }
        public bool IsActive { get; set; }
    }

    public class LeadAssignment : TenantEntity
    {
        public Guid LeadId { get; set; }
        public virtual Lead Lead { get; set; } = null!;
        public Guid AssignedUserId { get; set; }
        public DateTime AssignedAt { get; set; }
        public string AssignmentReason { get; set; } = string.Empty; // "Automatic Routing", "Manual Reassignment"
    }

    public class LeadConversionFunnel : TenantEntity
    {
         // Aggregate entity or per-lead tracking?
         // User listed it as a Model component. Let's assume it tracks stage transitions or is a snapshot.
         // Based on typical funnel, usually analytics.
         // For now, simple entity to track stage changes if not using Temporal Tables.
         public Guid LeadId { get; set; }
         public LeadStatus FromStatus { get; set; }
         public LeadStatus ToStatus { get; set; }
         public DateTime TransitionedAt { get; set; }
         public TimeSpan DurationInPreviousStage { get; set; }
    }

    public class LeadFollowUpTask : TenantEntity
    {
        public Guid LeadId { get; set; }
        public virtual Lead Lead { get; set; } = null!;
        public string TaskDescription { get; set; } = string.Empty;
        public DateTime DueDate { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? CompletedAt { get; set; }
    }
}
