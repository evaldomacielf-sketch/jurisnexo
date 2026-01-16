using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Application.DTOs.Analytics;
using JurisNexo.Core.Entities;
using JurisNexo.Infrastructure.Data;
using Microsoft.Extensions.Caching.Memory;

namespace JurisNexo.Infrastructure.Services
{
    public class ExecutiveDashboardService : IExecutiveDashboardService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IMemoryCache _cache;

        public ExecutiveDashboardService(ApplicationDbContext dbContext, IMemoryCache cache)
        {
            _dbContext = dbContext;
            _cache = cache;
        }

        // 1. KPIs Financeiros (MOCKED for demo as Financial Entities are basic/missing)
        public async Task<FinancialKPIsDto> GetFinancialKPIsAsync(DateTime startDate, DateTime endDate)
        {
            // Simulate Financial Data
            var revenue = 150000m;
            var expenses = 45000m;
            
            return new FinancialKPIsDto
            {
                Period = $"{startDate:dd/MM} - {endDate:dd/MM}",
                TotalRevenue = revenue,
                TotalExpenses = expenses,
                NetProfit = revenue - expenses,
                NetMargin = 70,
                MRR = 12000,
                ARR = 144000,
                CAC = 150,
                LTV = 5000,
                LTVCACRatio = 33,
                ChurnRate = 2.5m,
                AccountsReceivable = 25000,
                AccountsPayable = 5000,
                ProjectedCashFlow = 110000,
                RevenueGrowth = 15.5m,
                ProfitGrowth = 12.0m,
                MRRGrowth = 5.0m
            };
        }

        // 2. KPIs Operacionais (HYBRID: Real Leads/Cases, Mocked Tasks/Docs)
        public async Task<OperationalKPIsDto> GetOperationalKPIsAsync(DateTime startDate, DateTime endDate)
        {
            var cases = await _dbContext.Cases.CountAsync();
            var activeCases = await _dbContext.Cases.CountAsync(c => c.Status == CaseStatus.Active);
            
            var totalClients = await _dbContext.Users.CountAsync(u => u.Role == UserRole.Client);
            
            var totalMsgs = await _dbContext.WhatsAppMessages
                .CountAsync(m => m.CreatedAt >= startDate && m.CreatedAt <= endDate);

            var totalLeads = await _dbContext.Leads.CountAsync();
            var qualified = await _dbContext.Leads.CountAsync(l => l.Status == LeadStatus.Qualified);
            var converted = await _dbContext.Leads.CountAsync(l => l.Status == LeadStatus.Won);

            return new OperationalKPIsDto
            {
                TotalCases = cases,
                ActiveCases = activeCases,
                NewCases = await _dbContext.Cases.CountAsync(c => c.CreatedAt >= startDate && c.CreatedAt <= endDate),
                ClosedCases = 5, // Mock
                
                TotalClients = totalClients,
                ActiveClients = totalClients, // Assuming all active
                NewClients = 2, // Mock
                
                TotalConversations = await _dbContext.WhatsAppConversations.CountAsync(),
                TotalMessages = totalMsgs,
                AvgResponseTimeMinutes = 12, // Mock (requires complex calculation)

                TotalLeads = totalLeads,
                QualifiedLeads = qualified,
                ConvertedLeads = converted,
                LeadConversionRate = totalLeads > 0 ? (decimal)converted / totalLeads * 100 : 0,

                SLACompliance = 98.5m, // Mock
                SLABreaches = 3, // Mock

                TotalAdvogados = await _dbContext.Users.CountAsync(u => u.Role == UserRole.Lawyer),
                ActiveAdvogados = await _dbContext.Users.CountAsync(u => u.Role == UserRole.Lawyer),
                AvgCasesPerAdvogado = 15, // Mock

                TasksCompleted = 45, // Mock
                TasksOverdue = 2,    // Mock
                DocumentsGenerated = 120, // Mock
                DocumentsSigned = 110     // Mock
            };
        }

        // 3. KPIs de Vendas/CRM (HYBRID)
        public async Task<SalesKPIsDto> GetSalesKPIsAsync(DateTime startDate, DateTime endDate)
        {
            var leads = await _dbContext.Leads
                 .Where(l => l.CreatedAt >= startDate && l.CreatedAt <= endDate)
                 .ToListAsync();

            var won = leads.Count(l => l.Status == LeadStatus.Won);
            var lost = leads.Count(l => l.Status == LeadStatus.Lost);
            var total = leads.Count;

            // Grouping in memory for complexity reduction in demo
            var bySource = leads.GroupBy(l => l.Source.ToString())
                .ToDictionary(g => g.Key, g => g.Count());

            var byCaseType = leads.GroupBy(l => l.CaseType ?? "Outros")
                .ToDictionary(g => g.Key, g => g.Count());

            // Top Performers Mock
            var topPerformers = new List<AdvogadoPerformanceDto>
            {
                new AdvogadoPerformanceDto { Id = Guid.NewGuid(), Name = "Dra. Ana", CasesWon = 15, ConversionRate = 35, Revenue = 50000 },
                new AdvogadoPerformanceDto { Id = Guid.NewGuid(), Name = "Dr. Carlos", CasesWon = 12, ConversionRate = 30, Revenue = 42000 },
            };

            return new SalesKPIsDto
            {
                TotalOpportunities = total,
                OpportunitiesWon = won,
                OpportunitiesLost = lost,
                PipelineValue = total * 1500, // Mock avg value
                WonValue = won * 1500,
                WinRate = total > 0 ? (decimal)won/total * 100 : 0,
                AvgDealSize = 1500,
                AvgSalesCycle = 15,
                LeadsBySource = bySource,
                LeadsByCaseType = byCaseType,
                TopPerformers = topPerformers
            };
        }

        // 4. Monthly Revenue (MOCKED)
        public Task<List<MonthlyRevenueDto>> GetMonthlyRevenueChartAsync()
        {
            var data = new List<MonthlyRevenueDto>();
            var date = DateTime.Today.AddMonths(-11);
            var rnd = new Random();

            for (int i = 0; i < 12; i++)
            {
                var rev = rnd.Next(100000, 200000);
                var exp = rnd.Next(30000, 60000);
                data.Add(new MonthlyRevenueDto
                {
                    Month = date.ToString("MM/yyyy"),
                    Revenue = rev,
                    Expenses = exp,
                    Profit = rev - exp
                });
                date = date.AddMonths(1);
            }
            return Task.FromResult(data);
        }

        // 5. Revenue By Area (MOCKED)
        public Task<List<RevenueByAreaDto>> GetRevenueByAreaAsync(DateTime startDate, DateTime endDate)
        {
             var data = new List<RevenueByAreaDto>
             {
                 new RevenueByAreaDto { Area = "Trabalhista", Revenue = 85000, CaseCount = 20, AvgTicket = 4250 },
                 new RevenueByAreaDto { Area = "Civil", Revenue = 60000, CaseCount = 15, AvgTicket = 4000 },
                 new RevenueByAreaDto { Area = "Criminal", Revenue = 45000, CaseCount = 5, AvgTicket = 9000 },
                 new RevenueByAreaDto { Area = "Família", Revenue = 30000, CaseCount = 10, AvgTicket = 3000 },
             };
             return Task.FromResult(data);
        }

        // 6. Sales Funnel (REALish)
        public async Task<SalesFunnelDto> GetSalesFunnelAsync(DateTime startDate, DateTime endDate)
        {
            // Reusing Leads logic
            var total = await _dbContext.Leads.CountAsync();
            var qualified = await _dbContext.Leads.CountAsync(l => l.Status == LeadStatus.Qualified);
            var contacted = await _dbContext.Leads.CountAsync(l => l.Status == LeadStatus.Contacted || l.Status == LeadStatus.Won);
            var negotiating = await _dbContext.Leads.CountAsync(l => l.Status == LeadStatus.Negotiating);
            var converted = await _dbContext.Leads.CountAsync(l => l.Status == LeadStatus.Won);

            // Stubbed adjustments for demo if total = 0
            if (total == 0) total = 100;

            return new SalesFunnelDto
            {
                TotalLeads = total,
                Qualified = qualified > 0 ? qualified : (int)(total * 0.4),
                Contacted = contacted > 0 ? contacted : (int)(total * 0.3),
                Negotiating = negotiating > 0 ? negotiating : (int)(total * 0.15),
                Converted = converted > 0 ? converted : (int)(total * 0.1),
                
                QualificationRate = 40,
                ContactRate = 75,
                NegotiationRate = 50,
                ConversionRate = 66
            };
        }
    }
}
