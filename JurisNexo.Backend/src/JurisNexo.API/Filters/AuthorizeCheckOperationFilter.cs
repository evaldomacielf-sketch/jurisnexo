using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace JurisNexo.API.Filters;

/// <summary>
/// Adiciona indicador de autenticação necessária nos endpoints
/// </summary>
public class AuthorizeCheckOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var hasAuthorize = context.MethodInfo.DeclaringType != null &&
            (context.MethodInfo.DeclaringType.GetCustomAttributes(true).OfType<AuthorizeAttribute>().Any()
            || context.MethodInfo.GetCustomAttributes(true).OfType<AuthorizeAttribute>().Any());

        var hasAllowAnonymous = context.MethodInfo.DeclaringType != null &&
            (context.MethodInfo.DeclaringType.GetCustomAttributes(true).OfType<AllowAnonymousAttribute>().Any()
            || context.MethodInfo.GetCustomAttributes(true).OfType<AllowAnonymousAttribute>().Any());

        if (hasAuthorize && !hasAllowAnonymous)
        {
            operation.Summary = $"🔒 {operation.Summary ?? ""}";
            
            operation.Responses.TryAdd("401", new OpenApiResponse 
            { 
                Description = "Não autenticado - Token JWT inválido ou ausente" 
            });
            
            operation.Responses.TryAdd("403", new OpenApiResponse 
            { 
                Description = "Não autorizado - Sem permissão para acessar este recurso" 
            });
        }
    }
}
