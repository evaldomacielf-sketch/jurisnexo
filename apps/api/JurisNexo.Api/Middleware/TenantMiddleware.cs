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
        // 🚨 CRITICAL FIX: Ignore OPTIONS request (Preflight for CORS)
        if (context.Request.Method == HttpMethods.Options)
        {
            await _next(context);
            return;
        }

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
            
            // 🚨 CRITICAL FIX: Manually inject CORS headers because UseCors middleware might not catch this short-circuit
            context.Response.Headers.Append("Access-Control-Allow-Origin", context.Request.Headers["Origin"]); 
            context.Response.Headers.Append("Access-Control-Allow-Credentials", "true");
            context.Response.Headers.Append("Access-Control-Allow-Headers", "authorization,content-type");
            context.Response.Headers.Append("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");

            context.Response.StatusCode = 400;
            await context.Response.WriteAsJsonAsync(new { error = "Tenant não identificado" });
            return;
        }

        await _next(context);
    }
}
