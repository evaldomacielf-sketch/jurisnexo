using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Application.DTOs.Pipeline;

namespace JurisNexo.API.Controllers;

/// <summary>
/// Endpoints para gestão de pipelines e estágios
/// </summary>
[Authorize]
[ApiController]
[Route("api/pipelines")]
[Produces("application/json")]
public class PipelinesController : BaseApiController
{
    private readonly IPipelineService _pipelineService;

    public PipelinesController(IPipelineService pipelineService)
    {
        _pipelineService = pipelineService;
    }

    /// <summary>
    /// Lista todos os pipelines do tenant
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<PipelineDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPipelines(CancellationToken cancellationToken)
    {
        try
        {
            var tenantId = GetCurrentTenantId();
            var pipelines = await _pipelineService.GetPipelinesAsync(tenantId, cancellationToken);
            return Ok(pipelines);
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    /// <summary>
    /// Busca pipeline por ID com seus estágios
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(PipelineDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPipeline(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var tenantId = GetCurrentTenantId();
            var pipeline = await _pipelineService.GetPipelineAsync(tenantId, id, cancellationToken);
            if (pipeline == null) return NotFound();
            return Ok(pipeline);
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    /// <summary>
    /// Busca métricas do pipeline
    /// </summary>
    [HttpGet("{id:guid}/metrics")]
    [ProducesResponseType(typeof(PipelineMetricsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPipelineMetrics(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var tenantId = GetCurrentTenantId();
            var metrics = await _pipelineService.GetPipelineMetricsAsync(tenantId, id, cancellationToken);
            return Ok(metrics);
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    /// <summary>
    /// Cria novo pipeline
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(PipelineDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreatePipeline(
        [FromBody] CreatePipelineRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var tenantId = GetCurrentTenantId();
            var pipeline = await _pipelineService.CreatePipelineAsync(tenantId, request, cancellationToken);
            return CreatedAtAction(nameof(GetPipeline), new { id = pipeline.Id }, pipeline);
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }
}
