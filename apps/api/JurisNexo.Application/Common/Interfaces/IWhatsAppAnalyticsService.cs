using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace JurisNexo.Application.Common.Interfaces
{
    public interface IWhatsAppAnalyticsService
    {
        Task<WhatsAppMetricsDto> GetMetricsAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<DailyMessageStatsDto>> GetDailyStatsAsync(DateTime startDate, DateTime endDate);
    }

    public class WhatsAppMetricsDto
    {
        public int TotalMessagesSent { get; set; }
        public int TotalMessagesReceived { get; set; }
        public int TotalConversations { get; set; }
        public double AverageResponseTimeMinutes { get; set; }
        public double DeliveryRate { get; set; }
        public double ReadRate { get; set; }
        
        // New charts support
        public Dictionary<string, int> MessageTypeDistribution { get; set; } = new();
        public List<AgentPerformanceDto> AgentPerformance { get; set; } = new();
        public Dictionary<string, int> FunnelStats { get; set; } = new();
    }

    public class AgentPerformanceDto
    {
        public string AgentName { get; set; } = string.Empty;
        public int MessagesSent { get; set; }
        public double AvgResponseTime { get; set; }
    }

    public class DailyMessageStatsDto
    {
        public DateTime Date { get; set; }
        public int Sent { get; set; }
        public int Received { get; set; }
    }
}
