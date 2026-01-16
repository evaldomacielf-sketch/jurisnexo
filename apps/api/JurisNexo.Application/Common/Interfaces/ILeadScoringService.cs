using System.Threading.Tasks;
using JurisNexo.Core.Entities;

namespace JurisNexo.Application.Common.Interfaces
{
    public interface ILeadScoringService
    {
        Task<LeadScore> CalculateScoreAsync(Lead lead);
    }
}
