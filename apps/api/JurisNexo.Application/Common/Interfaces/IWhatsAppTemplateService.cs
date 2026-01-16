using System.Collections.Generic;
using System.Threading.Tasks;
using JurisNexo.Core.Entities;

namespace JurisNexo.Application.Common.Interfaces
{
    public interface IWhatsAppTemplateService
    {
        Task<IEnumerable<WhatsAppTemplate>> GetTemplatesAsync();
        Task<WhatsAppTemplate?> GetTemplateByNameAsync(string name);
        Task SyncTemplatesAsync();
        Task<bool> DeleteTemplateAsync(string name);
    }
}
