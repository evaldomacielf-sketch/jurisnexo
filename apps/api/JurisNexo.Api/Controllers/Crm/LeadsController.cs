using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Application.DTOs.Lead;
using JurisNexo.Application.Common.Models;

namespace JurisNexo.API.Controllers;

/// <summary>
/// Endpoints para gestão de leads e oportunidades no funil de vendas
/// </summary>
[Authorize]
[ApiController]
[Route("api/leads")]
[Produces("application/json")]
public class LeadsController : BaseApiController
{
    private readonly ILeadService _leadService;

    public LeadsController(ILeadService leadService)
    {
        _leadService = leadService;
    }

    /// <summary>
    /// Lista todos os leads com filtros
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResponse<LeadDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLeads(
        [FromQuery] Guid? pipelineId,
        [FromQuery] Guid? stageId,
        [FromQuery] string? status,
        [FromQuery] string? priority,
        [FromQuery] Guid? assignedTo,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 20,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var tenantId = GetCurrentTenantId();
            var result = await _leadService.GetLeadsAsync(
                tenantId,
                pipelineId,
                stageId,
                status,
                priority,
                assignedTo,
                search,
                page,
                limit,
                cancellationToken);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    /// <summary>
    /// Busca lead por ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(LeadDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetLead(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var lead = await _leadService.GetLeadAsync(id, cancellationToken);
            if (lead == null) return NotFound();
            return Ok(lead);
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    /// <summary>
    /// Cria novo lead
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(LeadDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateLead(
        [FromBody] CreateLeadRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var tenantId = GetCurrentTenantId();
            var userId = GetCurrentUserId();
            var lead = await _leadService.CreateLeadAsync(tenantId, request, userId, cancellationToken);
            
            return CreatedAtAction(nameof(GetLead), new { id = lead.Id }, lead);
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    /// <summary>
    /// Atualiza lead
    /// </summary>
    [HttpPatch("{id:guid}")]
    [ProducesResponseType(typeof(LeadDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateLead(
        Guid id,
        [FromBody] UpdateLeadRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var lead = await _leadService.UpdateLeadAsync(id, request, cancellationToken);
            return Ok(lead);
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    /// <summary>
    /// Remove lead
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DeleteLead(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            await _leadService.DeleteLeadAsync(id, cancellationToken);
            return NoContent();
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    /// <summary>
    /// Move lead para outro estágio (drag and drop)
    /// </summary>
    [HttpPost("{id:guid}/move")]
    [ProducesResponseType(typeof(LeadDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> MoveLead(
        Guid id,
        [FromBody] MoveLeadRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetCurrentUserId();
            var lead = await _leadService.MoveLeadAsync(id, request, userId, cancellationToken);
            return Ok(lead);
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    /// <summary>
    /// Lista atividades do lead
    /// </summary>
    [HttpGet("{id:guid}/activities")]
    [ProducesResponseType(typeof(List<LeadActivityDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLeadActivities(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var activities = await _leadService.GetLeadActivitiesAsync(id, cancellationToken);
            return Ok(activities);
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    /// <summary>
    /// Adiciona atividade ao lead
    /// </summary>
    [HttpPost("{id:guid}/activities")]
    [ProducesResponseType(typeof(LeadActivityDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> AddActivity(
        Guid id,
        [FromBody] CreateLeadActivityRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetCurrentUserId();
            var activity = await _leadService.AddActivityAsync(id, request, userId, cancellationToken);
            return Created("", activity);
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    /// <summary>
    /// Marca lead como ganho
    /// </summary>
    [HttpPost("{id:guid}/win")]
    [ProducesResponseType(typeof(LeadDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> MarkAsWon(
        Guid id,
        [FromBody] MarkAsWonRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetCurrentUserId();
            var lead = await _leadService.MarkAsWonAsync(id, request.ActualValue, userId, cancellationToken);
            return Ok(lead);
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    /// <summary>
    /// Marca lead como perdido
    /// </summary>
    [HttpPost("{id:guid}/lose")]
    [ProducesResponseType(typeof(LeadDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> MarkAsLost(
        Guid id,
        [FromBody] MarkAsLostRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetCurrentUserId();
            var lead = await _leadService.MarkAsLostAsync(id, request.Reason, userId, cancellationToken);
            return Ok(lead);
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }
}
