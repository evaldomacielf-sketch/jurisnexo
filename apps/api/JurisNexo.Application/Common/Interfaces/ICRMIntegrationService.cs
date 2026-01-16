using System.Collections.Generic;
using System.Threading.Tasks;
using JurisNexo.Core.Entities;
using JurisNexo.Application.DTOs.CRM;

namespace JurisNexo.Application.Common.Interfaces
{
    public interface ICRMIntegrationService
    {
        Task<bool> SyncContactAsync(User user);
        Task<bool> SyncLeadAsync(Lead lead);
        Task<bool> SyncDealAsync(Honorario honorario);
        Task<List<CRMContact>> GetContactsAsync(); // Required by User's Interface definition but not implemented in examples? I'll implement stub.
        Task<List<CRMDeal>> GetDealsAsync();
        Task<WebhookResponse> ProcessWebhookAsync(string payload, Dictionary<string, string> headers);
    }
}
