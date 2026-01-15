using System;
using System.Threading.Tasks;
using JurisNexo.Domain.Entities;

namespace JurisNexo.Application.Common.Interfaces
{
    public interface ILeadNotificationService
    {
        Task NotifyAdvogadoAsync(Guid advogadoId, Lead lead, LeadScore score);
    }
}
