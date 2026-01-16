using System;
using System.Collections.Generic;

namespace JurisNexo.Application.DTOs.CRM
{
    public class CRMContact
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
    }

    public class CRMDeal
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public decimal Amount { get; set; }
        public string Stage { get; set; }
    }

    public class WebhookResponse
    {
        public bool Success { get; set; }
        public string? Error { get; set; }
    }

    // Salesforce DTOs
    public class SalesforceAuthResponse
    {
        public string AccessToken { get; set; }
        public string InstanceUrl { get; set; }
    }

    public class SalesforceCreateResponse
    {
        public string Id { get; set; }
        public bool Success { get; set; }
    }

    public class SalesforceWebhookPayload
    {
        public string ObjectType { get; set; } // Contact, Lead, Opportunity
        public string Id { get; set; }
    }

    // HubSpot DTOs
    public class HubSpotSearchResponse
    {
        public List<HubSpotResult> Results { get; set; }
    }

    public class HubSpotResult { public string Id { get; set; } }

    public class HubSpotCreateResponse
    {
        public string Id { get; set; }
    }

    public class HubSpotWebhookEvent
    {
        public List<HubSpotEventItem> Events { get; set; }
    }
    public class HubSpotEventItem { public string ObjectType { get; set; } }

    // Pipedrive DTOs
    public class PipedriveCreateResponse
    {
        public PipedriveData Data { get; set; }
    }
    public class PipedriveData { public int Id { get; set; } }
    
    public class PipedriveWebhookEvent
    {
        public string Event { get; set; }
        public dynamic Current { get; set; }
        public dynamic Previous { get; set; }
    }

    // RD Station DTOs
    public class RDAuthResponse { public string AccessToken { get; set; } }
    public class RDContactResponse { public string Uuid { get; set; } }
}
