namespace JurisNexo.Core.Enums
{
    public enum QueuePriority
    {
        Low = 0,        // SLA 24h
        Medium = 1,     // SLA 4h
        High = 2,       // SLA 1h
        Critical = 3    // SLA 15min
    }

    public enum AdvogadoStatus
    {
        Disponivel,
        Ocupado,
        Ausente,
        Pausa,
        Offline
    }
}
