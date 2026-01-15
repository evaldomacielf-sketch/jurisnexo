using JurisNexo.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JurisNexo.API.Controllers;

[Authorize]
[Route("api/whatsapp/analytics")]
public class WhatsAppAnalyticsController : BaseApiController
{
    private readonly IWhatsAppAnalyticsService _analyticsService;

    public WhatsAppAnalyticsController(IWhatsAppAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    [HttpGet("overview")]
    public async Task<IActionResult> GetOverview([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate, CancellationToken cancellationToken)
    {
        var tenantId = GetCurrentTenantId();
        var start = startDate ?? DateTime.UtcNow.AddDays(-30);
        var end = endDate ?? DateTime.UtcNow;

        var stats = await _analyticsService.GetOverviewStatsAsync(tenantId, start, end, cancellationToken);
        return Ok(stats);
    }
}
