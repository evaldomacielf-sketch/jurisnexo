using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using StackExchange.Redis;
using JurisNexo.Infrastructure.Data;
using JurisNexo.Infrastructure.Repositories;
using JurisNexo.Infrastructure.Services;
using JurisNexo.Application.Services;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Application.Common.Settings;
using JurisNexo.Domain.Interfaces;
using JurisNexo.Infrastructure.Hubs;
using JurisNexo.API.Controllers;
using JurisNexo.API.BackgroundJobs;
using JurisNexo.API.Configuration;
using JurisNexo.API.Startup;
using JurisNexo.Infrastructure.Monitoring;
using Amazon.CloudWatch;
using Amazon.Extensions.NETCore.Setup;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

using Serilog;
using Sentry;

// Initialize Serilog first
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

var builder = WebApplication.CreateBuilder(args);

// Add Serilog
builder.Host.UseSerilog((context, services, configuration) => configuration
    .ReadFrom.Configuration(context.Configuration)
    .ReadFrom.Services(services)
    .Enrich.FromLogContext()
    .WriteTo.Console());

// Add Sentry
var sentryDsn = builder.Configuration["Sentry:Dsn"];
if (!string.IsNullOrEmpty(sentryDsn))
{
    builder.WebHost.UseSentry(options =>
    {
        options.Dsn = sentryDsn;
        options.TracesSampleRate = 1.0;
        options.Debug = false;
        options.Environment = builder.Environment.EnvironmentName;
    });
}

// Add X-Ray Tracing
// builder.Services.AddXRayTracing();

// Configuration
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));
builder.Services.Configure<SmtpSettings>(builder.Configuration.GetSection("Smtp"));

// Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Redis
// builder.Services.AddStackExchangeRedisCache(options =>
// {
//     options.Configuration = builder.Configuration.GetConnectionString("Redis");
// });
builder.Services.AddDistributedMemoryCache();

// Redis Connection Multiplexer for Queue Service
var redisConnectionString = builder.Configuration.GetConnectionString("Redis") ?? "localhost:6379";
// builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
//    ConnectionMultiplexer.Connect(redisConnectionString));
// builder.Services.AddScoped<IWhatsAppQueueService, WhatsAppQueueService>();

// Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IContactRepository, ContactRepository>();
builder.Services.AddScoped<ICaseRepository, CaseRepository>();
builder.Services.AddScoped<IConversationRepository, ConversationRepository>();
builder.Services.AddScoped<IMessageRepository, MessageRepository>();
builder.Services.AddScoped<IPipelineRepository, PipelineRepository>();
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddScoped<IEmailService, JurisNexo.Infrastructure.Services.DevEmailService>();
}
else
{
    builder.Services.AddScoped<IEmailService, EmailService>();
}
builder.Services.AddScoped<IStorageService, LocalStorageService>();
builder.Services.AddScoped<IPipelineService, PipelineService>();
builder.Services.AddScoped<ILeadService, LeadService>();
builder.Services.AddScoped<ILeadRepository, LeadRepository>();
builder.Services.AddScoped<IPipelineSeeder, PipelineSeeder>();
builder.Services.AddScoped<ILeadQualificationService, LeadQualificationService>();
builder.Services.AddScoped<ILeadQualificationBot, LeadQualificationBot>();
builder.Services.AddScoped<ISettingsService, SettingsService>();
builder.Services.AddScoped<ILeadScoringService, LeadScoringService>();
builder.Services.AddScoped<ISmartLeadRoutingService, SmartLeadRoutingService>();
builder.Services.AddScoped<ILeadAnalyticsService, LeadAnalyticsService>();

// WhatsApp Services
builder.Services.AddScoped<IWhatsAppWebhookHandler, WhatsAppWebhookHandler>();
builder.Services.AddScoped<IWhatsAppMessageProcessor, WhatsAppWebhookHandler>();
builder.Services.AddScoped<IWhatsAppWebhookValidator, WhatsAppWebhookValidator>();
builder.Services.AddScoped<IWhatsAppChatbotService, WhatsAppChatbotService>();
builder.Services.AddScoped<IAIClassifierService, AIClassifierService>();
builder.Services.AddHttpClient<IWhatsAppClient, MetaWhatsAppService>();
builder.Services.AddScoped<IWhatsAppService, WhatsAppService>();
builder.Services.AddScoped<IWhatsAppAnalyticsService, WhatsAppAnalyticsService>();
builder.Services.AddScoped<IWhatsApp24HourWindowService, WhatsApp24HourWindowService>();
builder.Services.AddScoped<IStorageService, AzureBlobStorageService>();
builder.Services.AddScoped<IInboxNotificationService, SignalRInboxNotificationService>();

// Notification Services
builder.Services.AddScoped<IPushNotificationService, PushNotificationService>();
builder.Services.AddScoped<ISmsService, SmsService>();
builder.Services.AddScoped<ILeadNotificationService, LeadNotificationService>();
builder.Services.AddScoped<ILGPDConsentService, LGPDConsentService>();
// builder.Services.AddScoped<IConversationTransferService, ConversationTransferService>();
// builder.Services.AddScoped<IWhatsAppSchedulingService, WhatsAppSchedulingService>();
builder.Services.AddScoped<IAuditService, AuditService>();

// Background Workers
// builder.Services.AddHostedService<WhatsAppMessageWorker>();
// builder.Services.AddHostedService<SLAMonitorService>();
// builder.Services.AddHostedService<ScheduledMessageWorker>();

// Monitoring
// builder.Services.AddAWSService<IAmazonCloudWatch>();
// builder.Services.AddSingleton<IMetricsPublisher, CloudWatchMetricsPublisher>();

// HttpContext
builder.Services.AddHttpContextAccessor();

// JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSettings>();
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey))
        };
    });

// SignalR
builder.Services.AddSignalR();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(builder.Configuration["Cors:AllowedOrigins"]!.Split(','))
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Controllers
builder.Services.AddControllers();
builder.Services.AddApiVersioningConfiguration();
builder.Services.AddSwaggerDocumentation();

// Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // Policy for Authentication (Login)
    options.AddFixedWindowLimiter("auth", opt =>
    {
        opt.Window = TimeSpan.FromMinutes(1);
        opt.PermitLimit = 5;
        opt.QueueLimit = 0;
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
    });

    // Global Policy
    options.AddFixedWindowLimiter("global", opt =>
    {
        opt.Window = TimeSpan.FromMinutes(1);
        opt.PermitLimit = 100;
        opt.QueueLimit = 2;
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
    });
});

// Enable XML documentation & JSON Defaults
builder.Services.Configure<Microsoft.AspNetCore.Mvc.MvcOptions>(options =>
{
    options.Filters.Add(new Microsoft.AspNetCore.Mvc.ProducesAttribute("application/json"));
    options.Filters.Add(new Microsoft.AspNetCore.Mvc.ConsumesAttribute("application/json"));
});

var app = builder.Build();

// X-Ray Tracing Middleware
// app.UseXRayTracing();

// Middleware
if (app.Environment.IsDevelopment() || app.Environment.IsStaging())
{
    app.UseSwaggerDocumentation();
    app.UseReDocDocumentation();
    app.UseStaticFiles();
    
    app.MapGet("/api/docs/postman", (IServiceProvider services) =>
    {
        var collection = PostmanCollectionGenerator.GenerateCollection(services);
        return Results.Content(collection, "application/json", System.Text.Encoding.UTF8);
    }).ExcludeFromDescription();

    /*
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        db.Database.Migrate(); 
    }
    */
}

app.UseSerilogRequestLogging();
app.UseRateLimiter();
// app.UseMiddleware<PerformanceMonitoringMiddleware>();
app.UseCors("AllowFrontend");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<InboxHub>("/hubs/inbox");

app.Run();
