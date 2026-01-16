using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
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
    public class PipedriveIntegrationService : ICRMIntegrationService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiToken;
        private readonly ApplicationDbContext _dbContext;

        public PipedriveIntegrationService(HttpClient httpClient, IConfiguration config, ApplicationDbContext dbContext)
        {
            _httpClient = httpClient;
            _dbContext = dbContext;
            _apiToken = config["Pipedrive:ApiToken"] ?? "";
            var domain = config["Pipedrive:CompanyDomain"] ?? "company";
            _httpClient.BaseAddress = new Uri($"https://{domain}.pipedrive.com/api/v1/");
        }

        public async Task<bool> SyncContactAsync(User user)
        {
            var person = new
            {
                name = user.Name,
                email = new[] { user.Email },
                phone = new[] { user.Phone },
                // custom fields would need ID mapping
            };

            var response = await _httpClient.PostAsync(
                $"persons?api_token={_apiToken}",
                JsonContent.Create(person));

            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadFromJsonAsync<PipedriveCreateResponse>();
                if (result?.Data != null)
                {
                    user.PipedriveId = result.Data.Id.ToString();
                    await _dbContext.SaveChangesAsync();
                }
            }

            return response.IsSuccessStatusCode;
        }

        public async Task<bool> SyncLeadAsync(Lead lead)
        {
             // Pipedrive Lead/Deal mix. Assuming Deal for functionality.
             return await SyncDealAsync(new Honorario { 
                 Case = new Case { Title = lead.Name, CaseNumber = "LEAD" }, 
                 TotalAmount = lead.EstimatedValue,
                 Status = HonorarioStatus.Draft 
             });
        }

        public async Task<bool> SyncDealAsync(Honorario honorario)
        {
            var deal = new
            {
                title = $"{honorario.Case?.CaseNumber ?? "N/A"} - {honorario.Case?.Title ?? "N/A"}",
                value = honorario.TotalAmount,
                currency = "BRL",
                person_id = honorario.Client?.PipedriveId,
                status = "open"
            };

            var response = await _httpClient.PostAsync(
                $"deals?api_token={_apiToken}",
                JsonContent.Create(deal));
            
            return response.IsSuccessStatusCode;
        }

        public Task<List<CRMContact>> GetContactsAsync() => Task.FromResult(new List<CRMContact>());
        public Task<List<CRMDeal>> GetDealsAsync() => Task.FromResult(new List<CRMDeal>());
        public Task<WebhookResponse> ProcessWebhookAsync(string payload, Dictionary<string, string> headers) => Task.FromResult(new WebhookResponse { Success = true });
    }
}
