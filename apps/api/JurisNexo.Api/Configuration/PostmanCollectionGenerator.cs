using System.Text.Json;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.Extensions.DependencyInjection;

namespace JurisNexo.API.Configuration;

public static class PostmanCollectionGenerator
{
    public static string GenerateCollection(IServiceProvider services)
    {
        var apiDescriptionProvider = services.GetRequiredService<IApiDescriptionGroupCollectionProvider>();
        
        var collection = new
        {
            info = new
            {
                name = "JurisNexo API",
                description = "Coleção completa de endpoints da API JurisNexo",
                schema = "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
            },
            auth = new
            {
                type = "bearer",
                bearer = new[]
                {
                    new { key = "token", value = "{{jwt_token}}", type = "string" }
                }
            },
            variable = new[]
            {
                new { key = "base_url", value = "http://localhost:5000/api", type = "string" },
                new { key = "jwt_token", value = "", type = "string" }
            },
            item = GenerateItems(apiDescriptionProvider)
        };

        return JsonSerializer.Serialize(collection, new JsonSerializerOptions 
        { 
            WriteIndented = true 
        });
    }

    private static List<object> GenerateItems(IApiDescriptionGroupCollectionProvider provider)
    {
        var items = new List<object>();

        // Agrupa por Controller
        var groups = provider.ApiDescriptionGroups.Items
            .SelectMany(g => g.Items)
            .GroupBy(x => x.ActionDescriptor.RouteValues["controller"]);

        foreach (var group in groups)
        {
            var folderItems = new List<object>();

            foreach (var apiDescription in group)
            {
                var method = apiDescription.HttpMethod ?? "GET";
                // Ajusta URL para formato do Postman
                var rawUrl = $"{{{{base_url}}}}/{apiDescription.RelativePath?.Replace("api/", "")}";
                
                var request = new
                {
                    method = method,
                    header = new[]
                    {
                        new { key = "Content-Type", value = "application/json" }
                    },
                    url = new
                    {
                        raw = rawUrl,
                        host = new[] { "{{base_url}}" },
                        path = apiDescription.RelativePath?.Replace("api/", "").Split('/').ToArray() ?? Array.Empty<string>()
                    }
                };

                // Nome amigável: [GET] ActionName
                var actionName = apiDescription.ActionDescriptor.RouteValues["action"] ?? apiDescription.RelativePath;
                
                folderItems.Add(new
                {
                    name = $"[{method}] {actionName}",
                    request
                });
            }

            items.Add(new
            {
                name = group.Key ?? "General",
                item = folderItems
            });
        }

        return items;
    }
}
