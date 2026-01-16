using JurisNexo.Core.Enums;

namespace JurisNexo.Application.DTOs
{
    public class QueueStatsDto
    {
        public int WaitingCount { get; set; }
        public int ActiveCount { get; set; }
        public int PausedCount { get; set; }
        
        public double AvgWaitTimeMinutes { get; set; }
        public double LongestWaitTimeMinutes { get; set; }
        
        public int AdvogadosDisponiveis { get; set; }
        public int AdvogadosOcupados { get; set; }
        public int AdvogadosAusentes { get; set; }
        
        public int CriticalInQueue { get; set; }
        public int HighInQueue { get; set; }
        public int MediumInQueue { get; set; }
        public int LowInQueue { get; set; }
    }

    public class QueueItemDto
    {
        public Guid ConversationId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public QueuePriority Priority { get; set; }
        public DateTime EnteredQueueAt { get; set; }
        public int PositionInQueue { get; set; }
        public double WaitTimeMinutes { get; set; }
    }

    public class AdvogadoQueueStatusDto
    {
        public Guid AdvogadoId { get; set; }
        public string Name { get; set; } = string.Empty;
        public AdvogadoStatus Status { get; set; }
        public int CurrentLoad { get; set; }
        public int MaxLoad { get; set; }
        public int CompletedToday { get; set; }
        public double AvgResponseTimeMinutes { get; set; }
    }
}
