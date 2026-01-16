using System;
using System.Threading.Tasks;
using JurisNexo.Application.DTOs.Analytics;
using JurisNexo.Application.DTOs;

namespace JurisNexo.Application.Common.Interfaces
{
    public interface ILeadAnalyticsService
    {
        Task<LeadMetricsDto> GetMetricsAsync(DateTime? startDate = null, DateTime? endDate = null, Guid? advogadoId = null);
        Task<LeadFunnelDto> GetFunnelAsync(DateTime? startDate = null, DateTime? endDate = null);
    }
}
