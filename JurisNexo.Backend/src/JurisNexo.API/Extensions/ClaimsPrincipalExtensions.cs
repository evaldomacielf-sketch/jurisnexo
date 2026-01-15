using System;
using System.Security.Claims;

namespace JurisNexo.API.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        public static Guid GetUserId(this ClaimsPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException(nameof(principal));
            var idClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(idClaim, out var guid) ? guid : Guid.Empty;
        }

        public static Guid GetEscritorioId(this ClaimsPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException(nameof(principal));
            // Assuming "tenant_id" or "escritorio_id" claim, or matching configuration.
            // Adjust claim type based on Auth implementation (e.g. "tenantId" or generic).
            var idClaim = principal.FindFirst("tenantId")?.Value ?? principal.FindFirst("escritorioId")?.Value;
            
            // If not found, check standard claims if mapped differently
            if (string.IsNullOrEmpty(idClaim)) return Guid.Empty;

            return Guid.TryParse(idClaim, out var guid) ? guid : Guid.Empty;
        }
    }
}
