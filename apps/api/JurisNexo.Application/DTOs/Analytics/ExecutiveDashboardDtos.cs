using System;
using System.Collections.Generic;

namespace JurisNexo.Application.DTOs.Analytics
{
    public class FinancialKPIsDto
    {
        public string Period { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal NetProfit { get; set; }
        public decimal NetMargin { get; set; }
        public decimal MRR { get; set; }
        public decimal ARR { get; set; }
        public decimal CAC { get; set; }
        public decimal LTV { get; set; }
        public decimal LTVCACRatio { get; set; }
        public decimal ChurnRate { get; set; }
        public decimal AccountsReceivable { get; set; }
        public decimal AccountsPayable { get; set; }
        public decimal ProjectedCashFlow { get; set; }
        public decimal RevenueGrowth { get; set; }
        public decimal ProfitGrowth { get; set; }
        public decimal MRRGrowth { get; set; }
    }

    public class OperationalKPIsDto
    {
        public int TotalCases { get; set; }
        public int ActiveCases { get; set; }
        public int NewCases { get; set; }
        public int ClosedCases { get; set; }
        public int TotalClients { get; set; }
        public int ActiveClients { get; set; }
        public int NewClients { get; set; }
        public int TotalConversations { get; set; }
        public int TotalMessages { get; set; }
        public int AvgResponseTimeMinutes { get; set; }
        public int TotalLeads { get; set; }
        public int QualifiedLeads { get; set; }
        public int ConvertedLeads { get; set; }
        public decimal LeadConversionRate { get; set; }
        public decimal SLACompliance { get; set; }
        public int SLABreaches { get; set; }
        public int TotalAdvogados { get; set; }
        public int ActiveAdvogados { get; set; }
        public decimal AvgCasesPerAdvogado { get; set; }
        public int TasksCompleted { get; set; }
        public int TasksOverdue { get; set; }
        public int DocumentsGenerated { get; set; }
        public int DocumentsSigned { get; set; }
    }

    public class SalesKPIsDto
    {
        public int TotalOpportunities { get; set; }
        public int OpportunitiesWon { get; set; }
        public int OpportunitiesLost { get; set; }
        public decimal PipelineValue { get; set; }
        public decimal WonValue { get; set; }
        public decimal WinRate { get; set; }
        public decimal AvgDealSize { get; set; }
        public int AvgSalesCycle { get; set; }
        public Dictionary<string, int> LeadsBySource { get; set; }
        public Dictionary<string, int> LeadsByCaseType { get; set; }
        public List<AdvogadoPerformanceDto> TopPerformers { get; set; }
    }

    public class AdvogadoPerformanceDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string AvatarUrl { get; set; }
        public int CasesWon { get; set; }
        public decimal ConversionRate { get; set; }
        public decimal Revenue { get; set; }
    }

    public class MonthlyRevenueDto
    {
        public string Month { get; set; }
        public decimal Revenue { get; set; }
        public decimal Expenses { get; set; }
        public decimal Profit { get; set; }
    }

    public class RevenueByAreaDto
    {
        public string Area { get; set; }
        public decimal Revenue { get; set; }
        public int CaseCount { get; set; }
        public decimal AvgTicket { get; set; }
    }

    public class SalesFunnelDto
    {
        public int TotalLeads { get; set; }
        public int Qualified { get; set; }
        public int Contacted { get; set; }
        public int Negotiating { get; set; }
        public int Converted { get; set; }
        
        public decimal QualificationRate { get; set; }
        public decimal ContactRate { get; set; }
        public decimal NegotiationRate { get; set; }
        public decimal ConversionRate { get; set; }
    }
}
