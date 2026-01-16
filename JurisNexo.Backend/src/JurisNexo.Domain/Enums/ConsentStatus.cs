namespace JurisNexo.Domain.Enums
{
    public enum ConsentStatus
    {
        None,        // Nunca solicitado
        Pending,     // Aguardando resposta
        Granted,     // Concedido
        Denied,      // Negado
        Revoked      // Revogado
    }
}
