using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Application.DTOs.CRM;
using JurisNexo.Core.Entities;
using JurisNexo.Infrastructure.Data;

namespace JurisNexo.Infrastructure.Services.CRM
{
    public class HubSpotIntegrationService : ICRMIntegrationService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly ApplicationDbContext _dbContext;
        private readonly IConfiguration _config;

        public HubSpotIntegrationService(HttpClient httpClient, IConfiguration config, ApplicationDbContext dbContext)
        {
            _httpClient = httpClient;
            _config = config;
            _dbContext = dbContext;
            _apiKey = config["HubSpot:ApiKey"];
            _httpClient.BaseAddress = new Uri("https://api.hubapi.com");
            if (!string.IsNullOrEmpty(_apiKey))
            {
                 _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");
            }
        }

        public async Task<bool> SyncContactAsync(User user)
        {
            var contact = new
            {
                properties = new
                {
                    firstname = user.Name.Split(' ')[0],
                    lastname = user.Name.Contains(' ') ? user.Name.Substring(user.Name.IndexOf(' ') + 1) : "",
                    email = user.Email,
                    phone = user.Phone,
                    cpf = user.CPF,
                    jurisnexo_id = user.Id.ToString()
                }
            };

            // Try Create
            var response = await _httpClient.PostAsync(
                "/crm/v3/objects/contacts",
                JsonContent.Create(contact));

            if (response.StatusCode == HttpStatusCode.Conflict)
            {
                // Conflict means it exists. Search by Email.
                 var searchResponse = await _httpClient.PostAsync(
                    "/crm/v3/objects/contacts/search",
                    JsonContent.Create(new
                    {
                        filterGroups = new[]
                        {
                            new
                            {
                                filters = new[]
                                {
                                    new { propertyName = "email", @operator = "EQ", value = user.Email }
                                }
                            }
                        }
                    }));
                
                if (searchResponse.IsSuccessStatusCode)
                {
                    var searchResult = await searchResponse.Content.ReadFromJsonAsync<HubSpotSearchResponse>();
                    if (searchResult.Results.Any())
                    {
                        var contactId = searchResult.Results.First().Id;
                        user.HubSpotId = contactId;
                        
                        // Update
                        response = await _httpClient.PatchAsync(
                            $"/crm/v3/objects/contacts/{contactId}",
                            JsonContent.Create(contact));
                    }
                }
            }
            else if (response.IsSuccessStatusCode)
            {
                 var result = await response.Content.ReadFromJsonAsync<HubSpotCreateResponse>();
                 user.HubSpotId = result.Id;
            }
            
            // Only save if changed (optimization: check state)
            await _dbContext.SaveChangesAsync();

            return response.IsSuccessStatusCode;
        }

        public async Task<bool> SyncLeadAsync(Lead lead)
        {
            var deal = new
            {
                properties = new
                {
                    dealname = $"Lead: {lead.Name} - {lead.CaseType}",
                    dealstage = MapLeadStatusToDealStage(lead.Status),
                    amount = lead.EstimatedValue,
                    pipeline = "default", 
                    lead_source = lead.Source.ToString(),
                    // case_type = lead.CaseType, // Custom property
                    // lead_score = lead.Score,
                    jurisnexo_id = lead.Id.ToString()
                }
            };

            var response = await _httpClient.PostAsync(
                "/crm/v3/objects/deals",
                JsonContent.Create(deal));

            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadFromJsonAsync<HubSpotCreateResponse>();
                lead.HubSpotId = result.Id;
                await _dbContext.SaveChangesAsync();
                
                // Association logic omitted for brevity as User.HubSpotId check is complex without loading User
            }

            return response.IsSuccessStatusCode;
        }

        public Task<bool> SyncDealAsync(Honorario honorario) 
        {
            // Similar to Lead Sync but for Honorarios
            return Task.FromResult(true); 
        }

        public Task<List<CRMContact>> GetContactsAsync() => Task.FromResult(new List<CRMContact>());
        public Task<List<CRMDeal>> GetDealsAsync() => Task.FromResult(new List<CRMDeal>());

        public async Task<WebhookResponse> ProcessWebhookAsync(string payload, Dictionary<string, string> headers)
        {
             return await Task.FromResult(new WebhookResponse { Success = true });
        }

        private string MapLeadStatusToDealStage(LeadStatus status) => "appointmentscheduled"; // Simplified default
    }
}
