using JurisNexo.Api.Middleware;
using JurisNexo.Core.Interfaces;
using JurisNexo.Infrastructure.Data;
using JurisNexo.Infrastructure.Repositories;
using JurisNexo.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace JurisNexo.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services, 
        IConfiguration configuration)
    {
        // Database
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        // Unit of Work
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Repositories
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ICaseRepository, CaseRepository>();
        services.AddScoped<IContactRepository, ContactRepository>();
        services.AddScoped<IPipelineRepository, PipelineRepository>();
        services.AddScoped<ILeadRepository, LeadRepository>();
        services.AddScoped<IConversationRepository, ConversationRepository>();
        services.AddScoped<IMessageRepository, MessageRepository>();
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

        // Services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<IPipelineService, PipelineService>();
        services.AddScoped<ILeadService, LeadService>();

        // Tenant Resolver (Scoped para request)
        services.AddScoped<ITenantResolver, TenantResolver>();

        // HttpContext Accessor
        services.AddHttpContextAccessor();

        return services;
    }
}
