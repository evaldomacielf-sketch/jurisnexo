using System;
using System.Collections.Generic;
using JurisNexo.Core.Common;
using JurisNexo.Core.Entities;

namespace JurisNexo.Core.Events
{
    public class LeadCreatedEvent : DomainEvent
    {
        public Guid LeadId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string? Email { get; set; } = string.Empty;
        public string Source { get; set; } = "WhatsApp";
        public string? CaseType { get; set; }
        public int Score { get; set; }
        public LeadQuality Quality { get; set; }

        public LeadCreatedEvent(Lead lead)
        {
            LeadId = lead.Id;
            Name = lead.Name;
            PhoneNumber = lead.PhoneNumber;
            Email = lead.Email ?? string.Empty;
            Source = lead.Source.ToString();
            CaseType = lead.CaseType;
            Score = lead.Score;
            Quality = lead.Quality;
        }
    }

    public class LeadQualifiedEvent : DomainEvent
    {
        public Guid LeadId { get; set; }
        public int Score { get; set; }
        public LeadQuality Quality { get; set; }
        public Dictionary<string, string> QualificationData { get; set; }

        public LeadQualifiedEvent(Lead lead, Dictionary<string, string> data)
        {
            LeadId = lead.Id;
            Score = lead.Score;
            Quality = lead.Quality;
            QualificationData = data;
        }
    }

    public class LeadConvertedEvent : DomainEvent
    {
        public Guid LeadId { get; set; }
        public Guid ClientId { get; set; }
        public DateTime ConvertedAt { get; set; }

        public LeadConvertedEvent(Guid leadId, Guid clientId)
        {
            LeadId = leadId;
            ClientId = clientId;
            ConvertedAt = DateTime.UtcNow;
        }
    }

    public class LeadStatusChangedEvent : DomainEvent
    {
        public Guid LeadId { get; set; }
        public LeadStatus OldStatus { get; set; }
        public LeadStatus NewStatus { get; set; }

        public LeadStatusChangedEvent(Guid leadId, LeadStatus oldStatus, LeadStatus newStatus)
        {
            LeadId = leadId;
            OldStatus = oldStatus;
            NewStatus = newStatus;
        }
    }
}
