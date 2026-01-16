using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using JurisNexo.Application.DTOs.Analytics;

namespace JurisNexo.Application.Common.Interfaces
{
    public interface IExecutiveDashboardService
    {
        Task<FinancialKPIsDto> GetFinancialKPIsAsync(DateTime startDate, DateTime endDate);
        Task<OperationalKPIsDto> GetOperationalKPIsAsync(DateTime startDate, DateTime endDate);
        Task<SalesKPIsDto> GetSalesKPIsAsync(DateTime startDate, DateTime endDate);
        Task<List<MonthlyRevenueDto>> GetMonthlyRevenueChartAsync();
        Task<List<RevenueByAreaDto>> GetRevenueByAreaAsync(DateTime startDate, DateTime endDate);
        Task<SalesFunnelDto> GetSalesFunnelAsync(DateTime startDate, DateTime endDate);
    }
}
