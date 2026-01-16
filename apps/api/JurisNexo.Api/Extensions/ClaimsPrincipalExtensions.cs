using System.Security.Claims;

namespace JurisNexo.API.ExtensionMethods
{
    public static class ClaimsPrincipalExtensions
    {
        public static Guid GetUserId(this ClaimsPrincipal principal)
        {
            var value = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return value != null ? Guid.Parse(value) : Guid.Empty;
        }

        public static Guid GetTenantId(this ClaimsPrincipal principal)
        {
             // Try standard claim names or custom ones
             var value = principal.FindFirst("tenant_id")?.Value 
                      ?? principal.FindFirst("TenantId")?.Value;
             return value != null ? Guid.Parse(value) : Guid.Empty;
        }

        // Alias for GetTenantId for compatibility
        public static Guid GetEscritorioId(this ClaimsPrincipal principal)
        {
            return principal.GetTenantId();
        }
    }
}
