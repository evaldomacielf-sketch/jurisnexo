using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using JurisNexo.Application.Common.Exceptions; // Namespace assumido para as exceções

namespace JurisNexo.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    protected Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return userIdClaim != null ? Guid.Parse(userIdClaim) : Guid.Empty;
    }

    protected Guid GetCurrentTenantId()
    {
        var tenantIdClaim = User.FindFirst("tenant_id")?.Value;
        return tenantIdClaim != null ? Guid.Parse(tenantIdClaim) : Guid.Empty;
    }

    protected IActionResult HandleException(Exception ex)
    {
        return ex switch
        {
            UnauthorizedException => Unauthorized(new { message = ex.Message }),
            NotFoundException => NotFound(new { message = ex.Message }),
            BadRequestException => BadRequest(new { message = ex.Message }),
            _ => StatusCode(500, new { message = "Erro interno do servidor" })
        };
    }
}
