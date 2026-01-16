using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Application.DTOs;
using JurisNexo.Core.Entities;
using JurisNexo.Infrastructure.Data;

namespace JurisNexo.Infrastructure.Services
{
    public class LeadAnalyticsService : ILeadAnalyticsService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<LeadAnalyticsService> _logger;

        public LeadAnalyticsService(
            ApplicationDbContext context,
            ILogger<LeadAnalyticsService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<LeadMetricsDto> GetMetricsAsync(DateTime? startDate = null, DateTime? endDate = null, Guid? advogadoId = null)
        {
            var start = startDate ?? DateTime.UtcNow.AddMonths(-1);
            var end = endDate ?? DateTime.UtcNow;
            var previousStart = start.AddDays(-(end - start).TotalDays);

            // Base query
            var query = _context.Leads.AsQueryable();
            
            if (advogadoId.HasValue)
            {
                query = query.Where(l => l.AssignedToUserId == advogadoId.Value);
            }

            var currentPeriodLeads = await query
                .Where(l => l.CreatedAt >= start && l.CreatedAt <= end)
                .ToListAsync();

            var previousPeriodLeads = await query
                .Where(l => l.CreatedAt >= previousStart && l.CreatedAt < start)
                .ToListAsync();

            // Volume metrics
            var totalLeads = currentPeriodLeads.Count;
            var newLeads = currentPeriodLeads.Count(l => l.Status == LeadStatus.New);
            var qualifiedLeads = currentPeriodLeads.Count(l => 
                l.Status == LeadStatus.Qualified || 
                l.Status == LeadStatus.Assigned || 
                l.Status == LeadStatus.Contacted ||
                l.Status == LeadStatus.Negotiating ||
                l.Status == LeadStatus.Won);
            var convertedLeads = currentPeriodLeads.Count(l => l.Status == LeadStatus.Won);
            var lostLeads = currentPeriodLeads.Count(l => l.Status == LeadStatus.Lost);

            // Conversion rates
            var conversionRate = totalLeads > 0 ? (decimal)convertedLeads / totalLeads * 100 : 0;
            var qualificationRate = totalLeads > 0 ? (decimal)qualifiedLeads / totalLeads * 100 : 0;

            // Quality breakdown
            var highQuality = currentPeriodLeads.Count(l => l.Quality == LeadQuality.High);
            var mediumQuality = currentPeriodLeads.Count(l => l.Quality == LeadQuality.Medium);
            var lowQuality = currentPeriodLeads.Count(l => l.Quality == LeadQuality.Low);

            // By Case Type
            var leadsByCaseType = currentPeriodLeads
                .Where(l => !string.IsNullOrEmpty(l.CaseType))
                .GroupBy(l => l.CaseType!)
                .ToDictionary(g => g.Key, g => g.Count());

            var conversionByCaseType = currentPeriodLeads
                .Where(l => !string.IsNullOrEmpty(l.CaseType))
                .GroupBy(l => l.CaseType!)
                .ToDictionary(
                    g => g.Key,
                    g => g.Any() ? (decimal)g.Count(l => l.Status == LeadStatus.Won) / g.Count() * 100 : 0
                );

            // By Source
            var leadsBySource = currentPeriodLeads
                .GroupBy(l => l.Source.ToString())
                .ToDictionary(g => g.Key, g => g.Count());

            // By Advogado
            var leadsByAdvogado = currentPeriodLeads
                .Where(l => !string.IsNullOrEmpty(l.AssignedToUserName))
                .GroupBy(l => l.AssignedToUserName!)
                .ToDictionary(g => g.Key, g => g.Count());

            var conversionByAdvogado = currentPeriodLeads
                .Where(l => !string.IsNullOrEmpty(l.AssignedToUserName))
                .GroupBy(l => l.AssignedToUserName!)
                .ToDictionary(
                    g => g.Key,
                    g => g.Any() ? (decimal)g.Count(l => l.Status == LeadStatus.Won) / g.Count() * 100 : 0
                );

            // Trends
            var previousTotal = previousPeriodLeads.Count;
            var previousConverted = previousPeriodLeads.Count(l => l.Status == LeadStatus.Won);
            var previousConversionRate = previousTotal > 0 ? (decimal)previousConverted / previousTotal * 100 : 0;

            var leadsTrend = previousTotal > 0 
                ? ((decimal)totalLeads - previousTotal) / previousTotal * 100 
                : totalLeads > 0 ? 100 : 0;

            var conversionTrend = previousConversionRate > 0 
                ? (conversionRate - previousConversionRate) 
                : conversionRate;

            // Average response time (mock - would need actual tracking)
            var avgResponseTime = 45; // minutes - would calculate from actual data

            return new LeadMetricsDto
            {
                TotalLeads = totalLeads,
                NewLeads = newLeads,
                QualifiedLeads = qualifiedLeads,
                ConvertedCount = convertedLeads,
                LostLeads = lostLeads,
                ConversionRate = Math.Round(conversionRate, 1),
                QualificationRate = Math.Round(qualificationRate, 1),
                AverageResponseTimeMinutes = avgResponseTime,
                AvgConversionTimeDays = 7, // Mock
                HighQualityLeads = highQuality,
                MediumQualityLeads = mediumQuality,
                LowQualityLeads = lowQuality,
                LeadsByCaseType = leadsByCaseType,
                ConversionRateByCaseType = conversionByCaseType,
                LeadsBySource = leadsBySource,
                LeadsByAdvogado = leadsByAdvogado,
                ConversionRateByAdvogado = conversionByAdvogado,
                LeadsTrend = Math.Round(leadsTrend, 1),
                LeadsTrendDirection = leadsTrend >= 0 ? "up" : "down",
                ConversionTrend = Math.Round(conversionTrend, 1),
                ConversionTrendDirection = conversionTrend >= 0 ? "up" : "down",
                ResponseTimeTrend = 5, // Mock improvement
                ResponseTimeTrendDirection = "down" // Down is good
            };
        }

        public async Task<LeadFunnelDto> GetFunnelAsync(DateTime? startDate = null, DateTime? endDate = null)
        {
            var start = startDate ?? DateTime.UtcNow.AddMonths(-1);
            var end = endDate ?? DateTime.UtcNow;

            var leads = await _context.Leads
                .Where(l => l.CreatedAt >= start && l.CreatedAt <= end)
                .ToListAsync();

            var total = leads.Count;
            var newCount = leads.Count(l => l.Status == LeadStatus.New);
            var qualifying = leads.Count(l => l.Status == LeadStatus.Qualifying);
            var qualified = leads.Count(l => l.Status == LeadStatus.Qualified);
            var assigned = leads.Count(l => l.Status == LeadStatus.Assigned);
            var contacted = leads.Count(l => l.Status == LeadStatus.Contacted);
            var negotiating = leads.Count(l => l.Status == LeadStatus.Negotiating);
            var converted = leads.Count(l => l.Status == LeadStatus.Won);
            var lost = leads.Count(l => l.Status == LeadStatus.Lost);

            var captured = total; // All leads are "captured"
            var conversionRate = captured > 0 ? (decimal)converted / captured * 100 : 0;

            return new LeadFunnelDto
            {
                Captured = captured,
                New = newCount,
                Qualifying = qualifying,
                Qualified = qualified,
                Contacted = contacted + assigned, // Group assigned with contacted
                Negotiating = negotiating,
                Converted = converted,
                Lost = lost,
                ConversionRate = Math.Round(conversionRate, 1)
            };
        }
    }
}
