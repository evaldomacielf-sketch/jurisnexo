using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using JurisNexo.Application.UseCases.Analytics.GetLeadMetrics;

namespace JurisNexo.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/analytics")]
public class AnalyticsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AnalyticsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("leads")]
    public async Task<IActionResult> GetLeadMetrics(
        [FromQuery] DateTime? startDate, 
        [FromQuery] DateTime? endDate, 
        [FromQuery] Guid? advogadoId)
    {
        var query = new GetLeadMetricsQuery(startDate, endDate, advogadoId);
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}
