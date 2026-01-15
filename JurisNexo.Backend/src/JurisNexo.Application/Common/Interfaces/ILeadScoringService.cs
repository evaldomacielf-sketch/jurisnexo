using System.Threading.Tasks;
using JurisNexo.Domain.Entities;

namespace JurisNexo.Application.Common.Interfaces
{
    public interface ILeadScoringService
    {
        Task<LeadScore> CalculateScoreAsync(Lead lead);
    }
}
