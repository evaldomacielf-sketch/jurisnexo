using System;
using System.Threading.Tasks;

namespace JurisNexo.Application.Common.Interfaces
{
    public interface ILeadQualificationBot
    {
        Task<string> ProcessMessageAsync(Guid leadId, string message);
    }
}
