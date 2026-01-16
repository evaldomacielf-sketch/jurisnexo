using System.Security.Claims;

namespace JurisNexo.Api.Middleware;

public class TenantMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<TenantMiddleware> _logger;

    public TenantMiddleware(RequestDelegate next, ILogger<TenantMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Extrai TenantId do JWT (claim customizado)
        var tenantIdClaim = context.User.FindFirst("tenant_id")?.Value;

        if (!string.IsNullOrEmpty(tenantIdClaim) && Guid.TryParse(tenantIdClaim, out var tenantId))
        {
            // Armazena no contexto da requisição
            context.Items["TenantId"] = tenantId;
            _logger.LogInformation("Tenant {TenantId} identificado", tenantId);
        }
        else if (context.Request.Path.StartsWithSegments("/api") && 
                 !context.Request.Path.StartsWithSegments("/api/auth"))
        {
            // Rotas protegidas precisam de tenant
            _logger.LogWarning("Requisição sem TenantId: {Path}", context.Request.Path);
            context.Response.StatusCode = 400;
            await context.Response.WriteAsJsonAsync(new { error = "Tenant não identificado" });
            return;
        }

        await _next(context);
    }
}
