using System;
using MediatR;
using JurisNexo.Application.DTOs.Analytics;

namespace JurisNexo.Application.UseCases.Analytics.GetLeadMetrics;

public record GetLeadMetricsQuery(
    DateTime? StartDate, 
    DateTime? EndDate, 
    Guid? AdvogadoId
) : IRequest<LeadMetricsDto>;
