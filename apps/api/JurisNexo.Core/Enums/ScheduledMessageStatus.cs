namespace JurisNexo.Core.Enums
{
    public enum ScheduledMessageStatus
    {
        Pending,              // Aguardando horário
        Sent,                 // Enviada com sucesso
        AwaitingConfirmation, // Aguardando confirmação do cliente
        Confirmed,            // Confirmada pelo cliente
        Cancelled,            // Cancelada
        Failed,               // Falha no envio
        Expired               // Expirada (sem resposta)
    }
}
