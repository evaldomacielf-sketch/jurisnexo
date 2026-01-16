using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Application.Common.Settings;
using JurisNexo.Core.Interfaces;
using JurisNexo.Infrastructure.Data;
using JurisNexo.Infrastructure.Repositories;
using JurisNexo.Infrastructure.Services;
using JurisNexo.Infrastructure.Services.CRM;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using StackExchange.Redis;
using JurisNexo.Infrastructure.BackgroundJobs;

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

        // Infrastructure Services implementations
        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<IEmailService, EmailService>();

        services.AddScoped<IPushNotificationService, PushNotificationService>();
        services.AddScoped<ISmsService, SmsService>();
        services.AddScoped<ILeadQualificationService, LeadQualificationService>();
        services.AddScoped<ILeadQualificationBot, LeadQualificationBot>();
        services.AddScoped<ISmartLeadRoutingService, SmartLeadRoutingService>();
        services.AddScoped<ILeadScoringService, LeadScoringService>();
        services.AddScoped<IPipelineSeeder, PipelineSeeder>();
        
        services.AddScoped<IAIClassifierService, OpenAIClassifierService>();
        services.AddHttpClient<IAIClassifierService, OpenAIClassifierService>();
        services.AddScoped<ILeadAnalyticsService, LeadAnalyticsService>();
        services.AddScoped<ILeadNotificationService, LeadNotificationService>();
        
        // WhatsApp Services
        services.AddScoped<IWhatsAppSchedulingService, WhatsAppSchedulingService>();
        services.AddScoped<IWhatsAppMessageProcessor, WhatsAppMessageProcessor>();
        services.AddScoped<IWhatsAppTemplateService, WhatsAppTemplateService>();
        services.AddScoped<IWhatsAppChatbotService, WhatsAppChatbotService>();
        services.AddScoped<IWhatsAppAnalyticsService, WhatsAppAnalyticsService>();
        services.AddScoped<IExecutiveDashboardService, ExecutiveDashboardService>();
        
        // CRM Integration Services
        services.AddScoped<JurisNexo.Infrastructure.Services.CRM.SalesforceIntegrationService>();
        services.AddScoped<JurisNexo.Infrastructure.Services.CRM.HubSpotIntegrationService>();
        services.AddScoped<JurisNexo.Infrastructure.Services.CRM.PipedriveIntegrationService>();
        services.AddScoped<JurisNexo.Infrastructure.Services.CRM.RDStationIntegrationService>();
        
        services.AddScoped<ICRMAutoSyncSettingsService, CRMAutoSyncSettingsService>();
        services.AddScoped<ICRMSyncService, CRMSyncService>();

        // Background Workers - Some disabled due to missing dependencies
        // TODO: Register IWhatsAppClient, IInboxNotificationService to enable these
        // services.AddHostedService<WhatsAppMessageWorker>();
        // services.AddHostedService<WhatsAppSyncWorker>();
        // services.AddHostedService<WhatsAppCleanupWorker>();
        // services.AddHostedService<CheckSLAWorker>();
        // services.AddHostedService<CheckSLAWorker>(); // Duplicate removed
        services.AddHostedService<CRMSyncEngine>();
        // services.AddHostedService<RedisDomainEventListener>(); // Replaced by CRMSyncEventHandler
        services.AddHostedService<CRMSyncEventHandler>();

        // Redis Connection
        services.AddSingleton<IConnectionMultiplexer>(sp => 
        {
            var config = configuration.GetConnectionString("Redis") ?? "localhost";
            return ConnectionMultiplexer.Connect(config);
        });
        services.AddScoped<IEventPublisher, EventPublisher>();

        // Configuration Settings
        services.Configure<OpenAISettings>(configuration.GetSection("OpenAI"));

        // HttpContext Accessor
        services.AddHttpContextAccessor();

        return services;
    }
}
