using System.Threading;
using System.Threading.Tasks;
using MediatR;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Application.DTOs.Analytics;

namespace JurisNexo.Application.UseCases.Analytics.GetLeadMetrics;

public class GetLeadMetricsQueryHandler : IRequestHandler<GetLeadMetricsQuery, LeadMetricsDto>
{
    private readonly ILeadAnalyticsService _analyticsService;

    public GetLeadMetricsQueryHandler(ILeadAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    public async Task<LeadMetricsDto> Handle(GetLeadMetricsQuery request, CancellationToken cancellationToken)
    {
        return await _analyticsService.GetMetricsAsync(
            request.StartDate, 
            request.EndDate, 
            request.AdvogadoId
        );
    }
}
