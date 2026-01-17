using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Application.Common.Settings;
using JurisNexo.Core.Interfaces;
using JurisNexo.Infrastructure.Data;
using JurisNexo.Infrastructure.Repositories;
using JurisNexo.Infrastructure.Services;
// Remove ambiguous using: using JurisNexo.Application.Services;
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

        // Caching
        services.AddMemoryCache();
        services.AddDistributedMemoryCache();

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
        services.AddScoped<ITransactionRepository, TransactionRepository>();

        // Infrastructure Services implementations
        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();

        // Fix: Use fully qualified name to avoid ambiguity
        services.AddScoped<JurisNexo.Application.Services.IAuthService, JurisNexo.Application.Services.AuthService>(); 
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<ISettingsService, SettingsService>();
        services.AddScoped<IStorageService, LocalStorageService>();

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
        services.AddScoped<IInboxNotificationService, SignalRInboxNotificationService>();
        
        // WhatsApp Services
        services.AddScoped<IWhatsAppClient, TwilioWhatsAppService>();
        services.AddScoped<IWhatsAppService, WhatsAppService>();
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

        // Background Workers
        services.AddHostedService<CRMSyncEngine>();
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
        services.Configure<JwtSettings>(configuration.GetSection("Jwt"));

        // HttpContext Accessor
        services.AddHttpContextAccessor();

        return services;
    }
}
