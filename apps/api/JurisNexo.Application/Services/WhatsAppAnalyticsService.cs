using JurisNexo.Core.Entities;
using JurisNexo.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JurisNexo.Application.Services;

public interface IWhatsAppAnalyticsService
{
    Task<WhatsAppDashboardStats> GetOverviewStatsAsync(Guid tenantId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
}

public class WhatsAppAnalyticsService : IWhatsAppAnalyticsService
{
    private readonly IRepository<WhatsAppConversation> _conversationRepo;
    private readonly IRepository<Message> _messageRepo;
    private readonly IRepository<WhatsAppTemplate> _templateRepo;

    public WhatsAppAnalyticsService(
        IRepository<WhatsAppConversation> conversationRepo,
        IRepository<Message> messageRepo,
        IRepository<WhatsAppTemplate> templateRepo)
    {
        _conversationRepo = conversationRepo;
        _messageRepo = messageRepo;
        _templateRepo = templateRepo;
    }

    public async Task<WhatsAppDashboardStats> GetOverviewStatsAsync(Guid tenantId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        // Note: In a real implementation with EF Core Repository pattern, 
        // we might need more direct access to IQueryable or use specifications.
        // Assuming Repository exposes a way to get IQueryable or we fetch and filter (not ideal for analytics but works for MVP).
        // For performance, direct SQL or Dapper is better for analytics.
        // Here we will rely on fetching data for the MVP scope or using CountAsync if exposed.
        
        // This is a simplified "mock" logic because generic repository might not expose complex aggregations easily 
        // without adding specific methods to the repo interface.
        
        var stats = new WhatsAppDashboardStats
        {
            ActiveConversations = 120, // Mocked for now, implies count of Open status
            MessagesSent = 1500,
            MessagesReceived = 1450,
            ResponseRate = 98.5,
            AvgResponseTime = TimeSpan.FromMinutes(15),
            TopTemplates = new List<TemplateStat>
            {
                new("Confirmação de Agendamento", 150),
                new("Lembrete de Prazo", 89),
                new("Solicitação de Documentos", 45)
            },
            MessageVolume = new List<TimeSeriesData>
            {
                new(DateTime.Now.AddDays(-6), 120),
                new(DateTime.Now.AddDays(-5), 180),
                new(DateTime.Now.AddDays(-4), 150),
                new(DateTime.Now.AddDays(-3), 200),
                new(DateTime.Now.AddDays(-2), 170),
                new(DateTime.Now.AddDays(-1), 210),
                new(DateTime.Now, 230)
            }
        };

        return await Task.FromResult(stats);
    }
}

public record WhatsAppDashboardStats
{
    public int ActiveConversations { get; init; }
    public int MessagesSent { get; init; }
    public int MessagesReceived { get; init; }
    public double ResponseRate { get; init; }
    public TimeSpan AvgResponseTime { get; init; }
    public List<TemplateStat> TopTemplates { get; init; } = new();
    public List<TimeSeriesData> MessageVolume { get; init; } = new();
}

public record TemplateStat(string Name, int UsageCount);
public record TimeSeriesData(DateTime Date, int Count);
