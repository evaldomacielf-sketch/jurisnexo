using System;
using System.Threading.Tasks;
using JurisNexo.Domain.Entities;

namespace JurisNexo.Application.Common.Interfaces
{
    public interface ISmartLeadRoutingService
    {
        Task<Guid> AssignLeadToAdvogadoAsync(Lead lead);
    }
}
