using Microsoft.AspNetCore.Mvc;
using MediatR;
using JurisNexo.Application.UseCases.Financial.Queries.GetTransactions;
using JurisNexo.Application.UseCases.Financial.Commands.CreateTransaction;
using JurisNexo.Application.UseCases.Financial.Queries.GetDashboard;
using JurisNexo.Application.UseCases.Financial.Queries.GetCategories;
using JurisNexo.Application.UseCases.Financial.Queries.GetBankAccounts;
using JurisNexo.Application.UseCases.Financial.Commands.SeedDefaults;
using JurisNexo.Core.Entities.Financial;
using JurisNexo.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using JurisNexo.Application.Common.Models;

namespace JurisNexo.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class FinanceController : ControllerBase
{
    private readonly IMediator _mediator;

    public FinanceController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("transactions")]
    public async Task<ActionResult<PaginatedResponse<TransactionDto>>> GetTransactions(
        [FromQuery] int page = 1,
        [FromQuery] int limit = 10,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] string? type = null,
        [FromQuery] Guid? categoryId = null,
        [FromQuery] Guid? bankAccountId = null)
    {
        // Extract TenantId from claims or header if not handled by middleware deeply enough for MediatR
        // Using a helper or assumes Mediator/Handlers have access via ICurrentUserService.
        // But my Handlers use request.TenantId.
        // I need to extract it here.
        var tenantIdClaim = User.FindFirst("tenant_id")?.Value;
        if (string.IsNullOrEmpty(tenantIdClaim)) return BadRequest("Tenant ID missing");
        var tenantId = Guid.Parse(tenantIdClaim);

        var query = new GetTransactionsQuery
        {
            PageNumber = page,
            PageSize = limit,
            FromDate = fromDate,
            ToDate = toDate,
            Type = type,
            CategoryId = categoryId,
            BankAccountId = bankAccountId,
            TenantId = tenantId
        };

        return Ok(await _mediator.Send(query));
    }

    [HttpPost("transactions")]
    public async Task<ActionResult<Guid>> CreateTransaction([FromBody] CreateTransactionCommand command)
    {
        var tenantIdClaim = User.FindFirst("tenant_id")?.Value;
        if (string.IsNullOrEmpty(tenantIdClaim)) return BadRequest("Tenant ID missing");
        // Ensure command uses the authenticated tenant context
        var commandWithTenant = command with { TenantId = Guid.Parse(tenantIdClaim) };
        
        var id = await _mediator.Send(commandWithTenant);
        return CreatedAtAction(nameof(GetTransactions), new { id }, id);
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<FinancialDashboardStats>> GetDashboard(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var tenantIdClaim = User.FindFirst("tenant_id")?.Value;
        if (string.IsNullOrEmpty(tenantIdClaim)) return BadRequest("Tenant ID missing");

        // Ensure dates are in UTC to avoid PostgreSQL timestamp with time zone error
        var now = DateTime.UtcNow;
        var startDate = fromDate.HasValue 
            ? DateTime.SpecifyKind(fromDate.Value, DateTimeKind.Utc) 
            : new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var endDate = toDate.HasValue 
            ? DateTime.SpecifyKind(toDate.Value, DateTimeKind.Utc) 
            : startDate.AddMonths(1).AddDays(-1);

        var query = new GetFinancialDashboardQuery(Guid.Parse(tenantIdClaim), startDate, endDate);
        return Ok(await _mediator.Send(query));
    }

    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<FinancialCategory>>> GetCategories()
    {
        return Ok(await _mediator.Send(new GetCategoriesQuery()));
    }

    [HttpGet("bank-accounts")]
    public async Task<ActionResult<IEnumerable<BankAccount>>> GetBankAccounts()
    {
        var tenantIdClaim = User.FindFirst("tenant_id")?.Value;
        if (string.IsNullOrEmpty(tenantIdClaim)) return BadRequest("Tenant ID missing");
        
        return Ok(await _mediator.Send(new GetBankAccountsQuery(Guid.Parse(tenantIdClaim))));
    }

    [HttpPost("seed")]
    public async Task<ActionResult<bool>> SeedDefaults()
    {
        var tenantIdClaim = User.FindFirst("tenant_id")?.Value;
        if (string.IsNullOrEmpty(tenantIdClaim)) return BadRequest("Tenant ID missing");

        return Ok(await _mediator.Send(new SeedFinancialDefaultsCommand(Guid.Parse(tenantIdClaim))));
    }
}
