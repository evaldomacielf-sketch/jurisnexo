using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerUI;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Reflection;
using JurisNexo.API.Filters;
using Swashbuckle.AspNetCore.Filters;

namespace JurisNexo.API.Configuration;

public static class SwaggerConfiguration
{
    public static IServiceCollection AddSwaggerDocumentation(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            // API Info
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Version = "v1",
                Title = "JurisNexo API",
                Description = "API completa para gestão de escritórios de advocacia com CRM, Inbox WhatsApp, Processos e Agendamentos",
                Contact = new OpenApiContact
                {
                    Name = "JurisNexo Support",
                    Email = "support@jurisnexo.com",
                    Url = new Uri("https://jurisnexo.com/support")
                },
                License = new OpenApiLicense
                {
                    Name = "Proprietary",
                    Url = new Uri("https://jurisnexo.com/license")
                }
            });

            // JWT Bearer Authentication
            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Description = @"JWT Authorization header usando Bearer scheme. 
                              Digite 'Bearer' [espaço] e então seu token na entrada abaixo.
                              Exemplo: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'",
                Name = "Authorization",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.ApiKey,
                Scheme = "Bearer",
                BearerFormat = "JWT"
            });

            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        },
                        Scheme = "oauth2",
                        Name = "Bearer",
                        In = ParameterLocation.Header
                    },
                    new List<string>()
                }
            });

            // XML Documentation
            var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
            var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            if (File.Exists(xmlPath))
            {
                options.IncludeXmlComments(xmlPath);
            }


            // Application layer XML
            var applicationXmlFile = "JurisNexo.Application.xml";
            var applicationXmlPath = Path.Combine(AppContext.BaseDirectory, applicationXmlFile);
            if (File.Exists(applicationXmlPath))
            {
                options.IncludeXmlComments(applicationXmlPath);
            }

            // Filters
            options.ExampleFilters(); // Enable Examples
            options.OperationFilter<SwaggerDefaultValues>();
            options.SchemaFilter<EnumSchemaFilter>();
            options.OperationFilter<AuthorizeCheckOperationFilter>();

            // Group by tags
            options.TagActionsBy(api =>
            {
                if (api.GroupName != null)
                {
                    return new[] { api.GroupName };
                }

                if (api.ActionDescriptor is ControllerActionDescriptor descriptor)
                {
                    return new[] { descriptor.ControllerName };
                }

                throw new InvalidOperationException("Unable to determine tag for endpoint.");
            });

            options.DocInclusionPredicate((name, api) => true);

            // Custom operation ordering
            options.OrderActionsBy(api => 
                $"{api.ActionDescriptor.RouteValues["controller"]}_{api.HttpMethod}");
        });

        services.AddSwaggerExamplesFromAssemblyOf<JurisNexo.Application.DTOs.Examples.LoginRequestExample>();

        return services;
    }

    public static IApplicationBuilder UseSwaggerDocumentation(this IApplicationBuilder app)
    {
        app.UseSwagger(options =>
        {
            options.RouteTemplate = "api/docs/{documentName}/swagger.json";
        });

        app.UseSwaggerUI(options =>
        {
            options.SwaggerEndpoint("/api/docs/v1/swagger.json", "JurisNexo API v1");
            options.RoutePrefix = "api/docs";
            options.DocumentTitle = "JurisNexo API Documentation";
            options.DocExpansion(DocExpansion.List);
            options.DefaultModelsExpandDepth(2);
            options.EnableDeepLinking();
            options.DisplayRequestDuration();
            options.EnableFilter();
            options.EnableTryItOutByDefault();
            
            // Custom CSS
            options.InjectStylesheet("/swagger-ui/custom.css");
        });

        return app;
    }
}
