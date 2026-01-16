using System;
using JurisNexo.Core.Common;

namespace JurisNexo.Core.Entities
{
    public enum HonorarioStatus
    {
        Draft,
        Sent,
        Negotiating,
        Approved,
        Paid,
        Overdue,
        Cancelled
    }

    // "Honorario" represents a Deal/Opportunity in CRM terms
    public class Honorario : TenantEntity
    {
        public Guid CaseId { get; set; }
        public virtual Case Case { get; set; } = null!;
        public Guid ClientId { get; set; }
        public virtual User Client { get; set; } = null!;
        public Guid? AssignedToUserId { get; set; }
        public virtual User? AssignedToUser { get; set; }

        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public HonorarioStatus Status { get; set; }
        public DateTime? DueDate { get; set; }

        // CRM Integration
        public string? SalesforceOpportunityId { get; set; }
        public string? HubSpotDealId { get; set; }
        public string? PipedriveDealId { get; set; }
    }
}
