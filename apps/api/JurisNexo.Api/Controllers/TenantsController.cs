using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using JurisNexo.Application.DTOs.Tenant;
using JurisNexo.Infrastructure.Data;

namespace JurisNexo.API.Controllers;

/// <summary>
/// Endpoints para resolução de tenant
/// </summary>
[ApiController]
[Route("api/tenants")]
[Produces("application/json")]
public class TenantsController : BaseApiController
{
    private readonly ApplicationDbContext _context;

    public TenantsController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Busca tenant pelo slug (para resolução de subdomínio)
    /// </summary>
    [HttpGet("lookup/{slug}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(TenantDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> LookupBySlug(string slug, CancellationToken cancellationToken)
    {
        try
        {
            var tenant = await GetTenantBySlugAsync(slug, cancellationToken);
            if (tenant == null)
                return NotFound(new { message = "Tenant não encontrado" });

            return Ok(tenant);
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    /// <summary>
    /// Obtém o tenant do usuário autenticado
    /// </summary>
    [Authorize]
    [HttpGet("current")]
    [ProducesResponseType(typeof(TenantDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCurrent(CancellationToken cancellationToken)
    {
        try
        {
            var tenantId = GetCurrentTenantId();
            if (tenantId == Guid.Empty)
                return NotFound(new { message = "Nenhum tenant associado ao usuário" });

            var tenant = await GetTenantByIdAsync(tenantId, cancellationToken);
            if (tenant == null)
                return NotFound(new { message = "Tenant não encontrado" });

            return Ok(tenant);
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    private async Task<TenantDto?> GetTenantBySlugAsync(string slug, CancellationToken cancellationToken)
    {
        // Query the existing "tenants" table directly (lowercase, Supabase schema)
        var sql = @"
            SELECT id, slug, name, plan, status, trial_ends_at, created_at, updated_at
            FROM tenants
            WHERE slug = @slug
            LIMIT 1";

        await using var connection = new NpgsqlConnection(_context.Database.GetConnectionString());
        await connection.OpenAsync(cancellationToken);

        await using var command = new NpgsqlCommand(sql, connection);
        command.Parameters.AddWithValue("@slug", slug);
        
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        if (await reader.ReadAsync(cancellationToken))
        {
            return MapToTenantDto(reader);
        }

        return null;
    }

    private async Task<TenantDto?> GetTenantByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var sql = @"
            SELECT id, slug, name, plan, status, trial_ends_at, created_at, updated_at
            FROM tenants
            WHERE id = @id
            LIMIT 1";

        await using var connection = new NpgsqlConnection(_context.Database.GetConnectionString());
        await connection.OpenAsync(cancellationToken);

        await using var command = new NpgsqlCommand(sql, connection);
        command.Parameters.AddWithValue("@id", id);
        
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        if (await reader.ReadAsync(cancellationToken))
        {
            return MapToTenantDto(reader);
        }

        return null;
    }

    private static TenantDto MapToTenantDto(NpgsqlDataReader reader)
    {
        return new TenantDto(
            Id: reader.GetGuid(reader.GetOrdinal("id")),
            Slug: reader.GetString(reader.GetOrdinal("slug")),
            Name: reader.GetString(reader.GetOrdinal("name")),
            Plan: reader.IsDBNull(reader.GetOrdinal("plan")) ? null : reader.GetString(reader.GetOrdinal("plan")),
            Status: reader.IsDBNull(reader.GetOrdinal("status")) ? null : reader.GetString(reader.GetOrdinal("status")),
            TrialEndsAt: reader.IsDBNull(reader.GetOrdinal("trial_ends_at")) ? null : reader.GetDateTime(reader.GetOrdinal("trial_ends_at")),
            CreatedAt: reader.GetDateTime(reader.GetOrdinal("created_at")),
            UpdatedAt: reader.GetDateTime(reader.GetOrdinal("updated_at"))
        );
    }
}
