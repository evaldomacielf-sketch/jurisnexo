using System;
using System.Threading.Tasks;
using JurisNexo.Core.Entities;

namespace JurisNexo.Application.Common.Interfaces
{
    public interface ISmartLeadRoutingService
    {
        Task<Guid> AssignLeadToAdvogadoAsync(Lead lead);
    }
}
