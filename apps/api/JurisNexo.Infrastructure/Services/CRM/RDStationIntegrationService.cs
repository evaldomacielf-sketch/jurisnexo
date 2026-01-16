using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Application.DTOs.CRM;
using JurisNexo.Core.Entities;
using JurisNexo.Infrastructure.Data;

namespace JurisNexo.Infrastructure.Services.CRM
{
    public class RDStationIntegrationService : ICRMIntegrationService
    {
        private readonly HttpClient _httpClient;
        private string _accessToken;
        private readonly IConfiguration _config;
        private readonly ApplicationDbContext _dbContext;

        public RDStationIntegrationService(HttpClient httpClient, IConfiguration config, ApplicationDbContext dbContext)
        {
            _httpClient = httpClient;
            _config = config;
            _dbContext = dbContext;
            _httpClient.BaseAddress = new Uri("https://api.rd.services/");
        }

        private async Task AuthenticateAsync()
        {
            var data = new
            {
                client_id = _config["RDStation:ClientId"],
                client_secret = _config["RDStation:ClientSecret"],
                code = _config["RDStation:Code"]
            };

            var response = await _httpClient.PostAsync(
                "auth/token",
                JsonContent.Create(data));
            
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadFromJsonAsync<RDAuthResponse>();
                _accessToken = result.AccessToken;
                _httpClient.DefaultRequestHeaders.Authorization = 
                    new AuthenticationHeaderValue("Bearer", _accessToken);
            }
        }

        public async Task<bool> SyncContactAsync(User user)
        {
            // RD Station uses Leads/Contacts. Mapping User to Contact.
            return await Task.FromResult(true); 
        }

        public async Task<bool> SyncLeadAsync(Lead lead)
        {
            if (string.IsNullOrEmpty(_accessToken)) await AuthenticateAsync();

            var rdLead = new
            {
                email = lead.Email ?? "no-email@example.com",
                name = lead.Name,
                mobile_phone = lead.PhoneNumber,
                legal_bases = new[] { new { category = "communications", type = "email", status = "granted" } }
            };

            var response = await _httpClient.PostAsync(
                "platform/contacts",
                JsonContent.Create(rdLead));

            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadFromJsonAsync<RDContactResponse>();
                lead.RDStationId = result.Uuid;
                await _dbContext.SaveChangesAsync();
            }

            return response.IsSuccessStatusCode;
        }

        public Task<bool> SyncDealAsync(Honorario honorario) => Task.FromResult(true);
        public Task<List<CRMContact>> GetContactsAsync() => Task.FromResult(new List<CRMContact>());
        public Task<List<CRMDeal>> GetDealsAsync() => Task.FromResult(new List<CRMDeal>());
        public Task<WebhookResponse> ProcessWebhookAsync(string payload, Dictionary<string, string> headers) => Task.FromResult(new WebhookResponse { Success = true });
    }
}
