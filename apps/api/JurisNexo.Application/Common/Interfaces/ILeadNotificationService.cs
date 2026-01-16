using System;
using System.Threading.Tasks;
using JurisNexo.Core.Entities;

namespace JurisNexo.Application.Common.Interfaces
{
    public interface ILeadNotificationService
    {
        Task NotifyAdvogadoAsync(Guid advogadoId, Lead lead, LeadScore score);
    }
}
