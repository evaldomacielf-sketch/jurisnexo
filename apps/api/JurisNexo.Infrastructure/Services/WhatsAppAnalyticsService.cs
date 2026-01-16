using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using JurisNexo.Application.Common.Interfaces;

namespace JurisNexo.Infrastructure.Services
{
    public class WhatsAppAnalyticsService : IWhatsAppAnalyticsService
    {
        public async Task<WhatsAppMetricsDto> GetMetricsAsync(DateTime startDate, DateTime endDate)
        {
            // Placeholder: Query DB for count of messages, delivery status, etc.
            return await Task.FromResult(new WhatsAppMetricsDto
            {
                TotalMessagesSent = 150,
                TotalMessagesReceived = 120,
                TotalConversations = 45,
                AverageResponseTimeMinutes = 5.5,
                DeliveryRate = 98.5,
                ReadRate = 85.0,
                
                MessageTypeDistribution = new Dictionary<string, int>
                {
                    { "Text", 200 },
                    { "Image", 45 },
                    { "Document", 15 },
                    { "Audio", 10 }
                },
                AgentPerformance = new List<AgentPerformanceDto>
                {
                    new AgentPerformanceDto { AgentName = "Ana Silva", MessagesSent = 120, AvgResponseTime = 4.5 },
                    new AgentPerformanceDto { AgentName = "Carlos Souza", MessagesSent = 95, AvgResponseTime = 6.2 },
                    new AgentPerformanceDto { AgentName = "Bot IA", MessagesSent = 55, AvgResponseTime = 0.1 }
                },
                FunnelStats = new Dictionary<string, int>
                {
                    { "Leads Capturados", 50 },
                    { "Qualificados", 35 },
                    { "Agendamentos", 20 },
                    { "Contratos Fechados", 8 }
                }
            });
        }

        public async Task<IEnumerable<DailyMessageStatsDto>> GetDailyStatsAsync(DateTime startDate, DateTime endDate)
        {
            // Placeholder mock data
            var stats = new List<DailyMessageStatsDto>
            {
                new DailyMessageStatsDto { Date = DateTime.Today.AddDays(-2), Sent = 50, Received = 40 },
                new DailyMessageStatsDto { Date = DateTime.Today.AddDays(-1), Sent = 60, Received = 45 },
                new DailyMessageStatsDto { Date = DateTime.Today, Sent = 40, Received = 35 }
            };
            return await Task.FromResult(stats);
        }
    }
}
