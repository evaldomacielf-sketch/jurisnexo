using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;
using JurisNexo.Application.Services;
using JurisNexo.Application.Common.Interfaces;

namespace JurisNexo.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // MediatR - CQRS
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));
        
        // FluentValidation
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
        
        // Application Services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IPipelineService, PipelineService>();
        services.AddScoped<ILeadService, LeadService>();
        
        // AutoMapper (opcional)
        // services.AddAutoMapper(Assembly.GetExecutingAssembly());

        return services;
    }
}
