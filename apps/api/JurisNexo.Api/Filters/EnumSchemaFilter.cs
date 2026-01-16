using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace JurisNexo.API.Filters;

/// <summary>
/// Adiciona descrições de enum no Swagger
/// </summary>
public class EnumSchemaFilter : ISchemaFilter
{
    public void Apply(OpenApiSchema schema, SchemaFilterContext context)
    {
        if (context.Type.IsEnum)
        {
            schema.Enum.Clear();
            
            var enumValues = Enum.GetValues(context.Type);
            foreach (var value in enumValues)
            {
                schema.Enum.Add(new OpenApiString(value.ToString()));
            }

            schema.Type = "string";
            schema.Format = null;

            // Adiciona descrição com todos os valores possíveis
            var enumNames = Enum.GetNames(context.Type);
            schema.Description = $"Valores possíveis: {string.Join(", ", enumNames)}";
        }
    }
}
