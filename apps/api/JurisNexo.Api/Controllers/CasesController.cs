using JurisNexo.Application.DTOs;
using JurisNexo.Application.UseCases.Cases.CreateCase;
using JurisNexo.Application.UseCases.Cases.ListCases;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CaseDto = JurisNexo.Application.DTOs.CaseDtoSimple;

namespace JurisNexo.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CasesController : ControllerBase
{
    private readonly ILogger<CasesController> _logger;
    private readonly IMediator _mediator;

    public CasesController(ILogger<CasesController> logger, IMediator mediator)
    {
        _logger = logger;
        _mediator = mediator;
    }

    /// <summary>
    /// Lista todos os casos do escritório (tenant)
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResult<CaseDto>), 200)]
    public async Task<IActionResult> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null,
        [FromQuery] string? search = null)
    {
        var tenantId = (Guid)HttpContext.Items["TenantId"]!;
        _logger.LogInformation("Listando casos do tenant {TenantId}", tenantId);
        
        var result = await _mediator.Send(new ListCasesQuery(page, pageSize, search, status, null, tenantId));
        
        return Ok(result);
    }

    /// <summary>
    /// Busca caso por ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(CaseDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var tenantId = (Guid)HttpContext.Items["TenantId"]!;
        _logger.LogInformation("Buscando caso {CaseId} do tenant {TenantId}", id, tenantId);
        
        // TODO: Implementar GetCaseByIdQuery
        // var result = await _mediator.Send(new GetCaseByIdQuery(id));
        
        return Ok(new CaseDto(
            id, "Caso Exemplo", "0001234-56.2026.8.19.0001", 
            "Descrição do caso", "Open", Guid.NewGuid(), "Cliente Exemplo",
            null, null, "1ª Vara Cível", DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow
        ));
    }

    /// <summary>
    /// Cria novo caso
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(CaseDto), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Create([FromBody] CreateCaseCommand command)
    {
        var tenantId = (Guid)HttpContext.Items["TenantId"]!;
        _logger.LogInformation("Criando novo caso para tenant {TenantId}", tenantId);
        
        var result = await _mediator.Send(command);
        
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Atualiza caso existente
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(CaseDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCaseDto dto)
    {
        var tenantId = (Guid)HttpContext.Items["TenantId"]!;
        _logger.LogInformation("Atualizando caso {CaseId} do tenant {TenantId}", id, tenantId);
        
        // TODO: Implementar UpdateCaseCommand
        // var result = await _mediator.Send(new UpdateCaseCommand(id, dto));
        
        return Ok(new CaseDto(
            id, dto.Title ?? "Caso Atualizado", dto.Number ?? "0001234-56.2026.8.19.0001",
            dto.Description, "Open", Guid.NewGuid(), "Cliente",
            null, null, dto.Court, null, DateTime.UtcNow, DateTime.UtcNow
        ));
    }

    /// <summary>
    /// Deleta caso (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var tenantId = (Guid)HttpContext.Items["TenantId"]!;
        _logger.LogInformation("Deletando caso {CaseId} do tenant {TenantId}", id, tenantId);
        
        // TODO: Implementar DeleteCaseCommand
        // await _mediator.Send(new DeleteCaseCommand(id));
        
        return NoContent();
    }
}

// DTOs auxiliares
public record CreateCaseDto(
    string Title,
    string Number,
    string? Description,
    Guid ClientId,
    Guid? ResponsibleUserId,
    string? Court,
    DateTime? DistributionDate
);

public record UpdateCaseDto(
    string? Title,
    string? Number,
    string? Description,
    string? Status,
    Guid? ResponsibleUserId,
    string? Court
);
