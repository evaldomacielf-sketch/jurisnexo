using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Application.DTOs;
using JurisNexo.Domain.Entities;
using JurisNexo.API.Extensions;

namespace JurisNexo.API.Controllers
{
    [ApiController]
    [Route("api/lead-qualification")]
    [Authorize]
    public class LeadQualificationController : ControllerBase
    {
        private readonly ILeadQualificationService _leadService;

        public LeadQualificationController(ILeadQualificationService leadService)
        {
            _leadService = leadService;
        }

        // 1. Listar leads com filtros
        [HttpGet]
        public async Task<ActionResult<PagedResult<LeadDto>>> GetLeads(
            [FromQuery] LeadStatus? status = null,
            [FromQuery] LeadQuality? quality = null,
            [FromQuery] string? caseType = null,
            [FromQuery] Guid? assignedTo = null,
            [FromQuery] DateTime? dateFrom = null,
            [FromQuery] DateTime? dateTo = null,
            [FromQuery] string? search = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 25)
        {
            var escritorioId = User.GetEscritorioId();
            var leads = await _leadService.GetLeadsAsync(
                escritorioId, status, quality, caseType, assignedTo, 
                dateFrom, dateTo, search, page, pageSize);
            return Ok(leads);
        }
        
        // 2. Detalhes do lead
        [HttpGet("{leadId}")]
        public async Task<ActionResult<LeadDetailsDto>> GetLeadDetails(Guid leadId)
        {
            var lead = await _leadService.GetLeadDetailsAsync(leadId);
            if (lead == null)
                return NotFound();
            return Ok(lead);
        }
        
        // 3. Atribuir lead manualmente
        [HttpPost("{leadId}/assign")]
        public async Task<IActionResult> AssignLead(
            Guid leadId,
            [FromBody] AssignLeadRequest request)
        {
            await _leadService.AssignLeadToAdvogadoAsync(leadId, request.AdvogadoId);
            return NoContent();
        }
        
        // 4. Recalcular score
        [HttpPost("{leadId}/recalculate-score")]
        public async Task<ActionResult<LeadScore>> RecalculateScore(Guid leadId)
        {
            var score = await _leadService.CalculateScoreAsync(leadId);
            return Ok(score);
        }
        
        // 5. Converter em cliente
        [HttpPost("{leadId}/convert")]
        public async Task<IActionResult> ConvertToCliente(
            Guid leadId,
            [FromBody] ConvertLeadRequest request)
        {
            var success = await _leadService.ConvertLeadToClienteAsync(
                leadId, request.AdvogadoId);
            if (!success)
                return BadRequest("Falha ao converter lead");
            return NoContent();
        }
        
        // 6. Marcar como perdido
        [HttpPost("{leadId}/mark-lost")]
        public async Task<IActionResult> MarkAsLost(
            Guid leadId,
            [FromBody] MarkLeadLostRequest request)
        {
            await _leadService.MarkLeadAsLostAsync(leadId, request.Reason);
            return NoContent();
        }
        
        // 7. Criar tarefa de follow-up
        [HttpPost("{leadId}/follow-up")]
        public async Task<IActionResult> CreateFollowUp(
            Guid leadId,
            [FromBody] CreateFollowUpRequest request)
        {
            await _leadService.CreateFollowUpTaskAsync(
                leadId, request.DueDate, request.Description);
            return NoContent();
        }
        
        // 8. Funil de conversão
        [HttpGet("funnel")]
        public async Task<ActionResult<LeadFunnelDto>> GetConversionFunnel(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var escritorioId = User.GetEscritorioId();
            var funnel = await _leadService.GetConversionFunnelAsync(
                escritorioId, startDate ?? DateTime.Today.AddMonths(-1), 
                endDate ?? DateTime.Today);
            return Ok(funnel);
        }
        
        // 9. Métricas de leads
        [HttpGet("metrics")]
        public async Task<ActionResult<LeadMetricsDto>> GetMetrics(
            [FromQuery] Guid? advogadoId = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var escritorioId = User.GetEscritorioId();
            var metrics = await _leadService.GetLeadMetricsAsync(
                escritorioId, advogadoId, 
                startDate ?? DateTime.Today.AddMonths(-1), 
                endDate ?? DateTime.Today);
            return Ok(metrics);
        }
        
        // 10. Dashboard de leads
        [HttpGet("dashboard")]
        public async Task<ActionResult<LeadDashboardDto>> GetDashboard()
        {
            var userId = User.GetUserId();
            var dashboard = await _leadService.GetLeadDashboardAsync(userId);
            return Ok(dashboard);
        }
    }
}
