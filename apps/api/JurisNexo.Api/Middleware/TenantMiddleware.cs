using JurisNexo.Core.Interfaces;

namespace JurisNexo.Api.Middleware;

public class TenantMiddleware
{
    private readonly RequestDelegate _next;

    public TenantMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ITenantResolver tenantResolver)
    {
        var tenantId = context.User.FindFirst("tenant_id")?.Value;
        
        if (!string.IsNullOrEmpty(tenantId) && Guid.TryParse(tenantId, out var parsedTenantId))
        {
            tenantResolver.SetCurrentTenantId(parsedTenantId);
        }

        await _next(context);
    }
}

public interface ITenantResolver
{
    Guid? CurrentTenantId { get; }
    void SetCurrentTenantId(Guid tenantId);
}

public class TenantResolver : ITenantResolver
{
    public Guid? CurrentTenantId { get; private set; }

    public void SetCurrentTenantId(Guid tenantId)
    {
        CurrentTenantId = tenantId;
    }
}
