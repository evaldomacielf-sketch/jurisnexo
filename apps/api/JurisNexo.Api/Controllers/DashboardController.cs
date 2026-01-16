using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Application.DTOs.Analytics;

namespace JurisNexo.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/dashboard")]
    public class DashboardController : ControllerBase
    {
        private readonly IExecutiveDashboardService _dashboardService;

        public DashboardController(IExecutiveDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("executive/financial")]
        public async Task<ActionResult<FinancialKPIsDto>> GetFinancialKPIs([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var start = startDate ?? DateTime.Today.AddDays(-30);
            var end = endDate ?? DateTime.Today;
            return Ok(await _dashboardService.GetFinancialKPIsAsync(start, end));
        }

        [HttpGet("executive/operational")]
        public async Task<ActionResult<OperationalKPIsDto>> GetOperationalKPIs([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var start = startDate ?? DateTime.Today.AddDays(-30);
            var end = endDate ?? DateTime.Today;
            return Ok(await _dashboardService.GetOperationalKPIsAsync(start, end));
        }

        [HttpGet("executive/sales")]
        public async Task<ActionResult<SalesKPIsDto>> GetSalesKPIs([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var start = startDate ?? DateTime.Today.AddDays(-30);
            var end = endDate ?? DateTime.Today;
            return Ok(await _dashboardService.GetSalesKPIsAsync(start, end));
        }

        [HttpGet("executive/monthly-revenue")]
        public async Task<ActionResult<List<MonthlyRevenueDto>>> GetMonthlyRevenue()
        {
            return Ok(await _dashboardService.GetMonthlyRevenueChartAsync());
        }

        [HttpGet("executive/revenue-by-area")]
        public async Task<ActionResult<List<RevenueByAreaDto>>> GetRevenueByArea([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var start = startDate ?? DateTime.Today.AddDays(-30);
            var end = endDate ?? DateTime.Today;
            return Ok(await _dashboardService.GetRevenueByAreaAsync(start, end));
        }

        [HttpGet("executive/sales-funnel")]
        public async Task<ActionResult<SalesFunnelDto>> GetSalesFunnel([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
             var start = startDate ?? DateTime.Today.AddDays(-30);
             var end = endDate ?? DateTime.Today;
             return Ok(await _dashboardService.GetSalesFunnelAsync(start, end));
        }
    }
}
