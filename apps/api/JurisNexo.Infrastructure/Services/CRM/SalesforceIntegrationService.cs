using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
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
    public class SalesforceIntegrationService : ICRMIntegrationService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;
        private readonly ApplicationDbContext _dbContext;
        private string _accessToken;

        public SalesforceIntegrationService(HttpClient httpClient, IConfiguration config, ApplicationDbContext dbContext)
        {
            _httpClient = httpClient;
            _config = config;
            _dbContext = dbContext;
            
            // Should be set in DI or config
            var instanceUrl = _config["Salesforce:InstanceUrl"];
            if (!string.IsNullOrEmpty(instanceUrl))
            {
                _httpClient.BaseAddress = new Uri(instanceUrl);
            }
        }

        private async Task AuthenticateAsync()
        {
            var authUrl = "https://login.salesforce.com/services/oauth2/token";
            var data = new Dictionary<string, string>
            {
                { "grant_type", "password" },
                { "client_id", _config["Salesforce:ClientId"] ?? "" },
                { "client_secret", _config["Salesforce:ClientSecret"] ?? "" },
                { "username", _config["Salesforce:Username"] ?? "" },
                { "password", (_config["Salesforce:Password"] ?? "") + (_config["Salesforce:SecurityToken"] ?? "") }
            };

            var response = await _httpClient.PostAsync(authUrl, new FormUrlEncodedContent(data));
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadFromJsonAsync<SalesforceAuthResponse>();
                _accessToken = result.AccessToken;
                _httpClient.DefaultRequestHeaders.Authorization =
                    new AuthenticationHeaderValue("Bearer", _accessToken);
            }
        }

        public async Task<bool> SyncContactAsync(User user)
        {
            if (string.IsNullOrEmpty(_accessToken)) await AuthenticateAsync();

            var existingId = user.SalesforceId; // Using stored ID instead of email search first for efficiency

            var contact = new
            {
                FirstName = user.Name.Split(' ')[0],
                LastName = user.Name.Contains(' ') ? user.Name.Substring(user.Name.IndexOf(' ') + 1) : "N/A",
                Email = user.Email,
                Phone = user.Phone,
                MobilePhone = user.Phone, // Assuming user.Phone is user.PhoneNumber
                CPF__c = user.CPF,
                JurisNexo_ID__c = user.Id.ToString()
            };

            HttpResponseMessage response;
            if (!string.IsNullOrEmpty(existingId))
            {
                response = await _httpClient.PatchAsync(
                    $"/services/data/v57.0/sobjects/Contact/{existingId}",
                    JsonContent.Create(contact));
            }
            else
            {
                response = await _httpClient.PostAsync(
                    "/services/data/v57.0/sobjects/Contact",
                    JsonContent.Create(contact));
                
                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadFromJsonAsync<SalesforceCreateResponse>();
                    user.SalesforceId = result.Id;
                    await _dbContext.SaveChangesAsync();
                }
            }

            return response.IsSuccessStatusCode;
        }

        public async Task<bool> SyncLeadAsync(Lead lead)
        {
            if (string.IsNullOrEmpty(_accessToken)) await AuthenticateAsync();

            var salesforceLead = new
            {
                FirstName = lead.Name.Split(' ')[0],
                LastName = lead.Name.Contains(' ') ? lead.Name.Substring(lead.Name.IndexOf(' ') + 1) : "Unknown",
                Company = lead.Name,
                Email = "email_placeholder@example.com", // Lead might not have email, using placeholder or checking null
                Phone = lead.PhoneNumber,
                Status = MapLeadStatus(lead.Status),
                LeadSource = lead.Source.ToString(),
                CaseType__c = lead.CaseType,
                Score__c = lead.Score,
                JurisNexo_ID__c = lead.Id.ToString()
            };

            var response = await _httpClient.PostAsync(
                "/services/data/v57.0/sobjects/Lead",
                JsonContent.Create(salesforceLead));

            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadFromJsonAsync<SalesforceCreateResponse>();
                lead.SalesforceId = result.Id;
                await _dbContext.SaveChangesAsync();
                return true;
            }

            return false;
        }

        public async Task<bool> SyncDealAsync(Honorario honorario)
        {
            if (string.IsNullOrEmpty(_accessToken)) await AuthenticateAsync();

            // Ensure client is loaded
            var user = honorario.Client; 

            var opportunity = new
            {
                Name = $"Caso {honorario.Case?.CaseNumber ?? "Novo"} - {honorario.Case?.Title ?? "Processo"}",
                StageName = honorario.Status.ToString(),
                CloseDate = honorario.DueDate?.ToString("yyyy-MM-dd") ?? DateTime.UtcNow.AddMonths(1).ToString("yyyy-MM-dd"),
                Amount = honorario.TotalAmount,
                // AccountId = user.SalesforceId, // Assuming SalesforceId represents Account
                Type = "Existing Customer",
                // CaseNumber__c = honorario.Case?.Number,
                JurisNexo_ID__c = honorario.Id.ToString()
            };

            var response = await _httpClient.PostAsync(
                "/services/data/v57.0/sobjects/Opportunity",
                JsonContent.Create(opportunity));

            return response.IsSuccessStatusCode;
        }

        public Task<List<CRMContact>> GetContactsAsync() => Task.FromResult(new List<CRMContact>());
        public Task<List<CRMDeal>> GetDealsAsync() => Task.FromResult(new List<CRMDeal>());

        public async Task<WebhookResponse> ProcessWebhookAsync(string payload, Dictionary<string, string> headers)
        {
            // Simplified webhook processing
            return await Task.FromResult(new WebhookResponse { Success = true });
        }

        private string MapLeadStatus(LeadStatus status) => status switch
        {
            LeadStatus.New => "Open - Not Contacted",
            LeadStatus.Qualifying => "Working - Contacted",
            LeadStatus.Qualified => "Qualified",
            LeadStatus.Won => "Closed - Converted",
            LeadStatus.Lost => "Closed - Not Converted",
            _ => "Open - Not Contacted"
        };
    }
}
