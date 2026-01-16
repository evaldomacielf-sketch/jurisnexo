using JurisNexo.Api.Middleware;
using JurisNexo.Application;
using JurisNexo.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ====================================
// 🔧 CONFIGURAÇÃO DE SERVIÇOS
// ====================================

// CORS para Next.js
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://app.jurisnexo.com.br")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Controllers + OpenAPI
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { 
        Title = "JurisNexo API", 
        Version = "v1",
        Description = "API principal do CRM Jurídico JurisNexo"
    });
    
    // Autenticação JWT no Swagger
    c.AddSecurityDefinition("Bearer", new()
    {
        Description = "JWT Authorization header usando Bearer scheme. Ex: \"Bearer {token}\"",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
});

// Autenticação Supabase JWT
var supabaseJwtSecret = builder.Configuration["Supabase:JwtSecret"] 
    ?? throw new InvalidOperationException("Supabase JWT Secret não configurado");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(supabaseJwtSecret)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

// Injeção de Dependências - Camadas
builder.Services.AddApplicationServices();      // Application layer
builder.Services.AddInfrastructureServices(builder.Configuration); // Infrastructure layer

// Health Checks
builder.Services.AddHealthChecks()
    .AddNpgSql(builder.Configuration.GetConnectionString("DefaultConnection")!)
    .AddRedis(builder.Configuration.GetConnectionString("Redis")!);

var app = builder.Build();

// ====================================
// 🚀 PIPELINE DE MIDDLEWARE
// ====================================

// Swagger (desenvolvimento)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "JurisNexo API v1");
        c.RoutePrefix = "swagger"; // Acessar via /swagger
    });
}

// Middleware customizado
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseMiddleware<TenantMiddleware>();

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

// Rota raiz
app.MapGet("/", () => Results.Ok(new { 
    service = "JurisNexo API",
    version = "1.0.0",
    status = "running",
    docs = "/swagger"
}));

app.Run();
