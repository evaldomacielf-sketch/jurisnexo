export const CacheTTL = {
    // Dados que mudam raramente
    TENANT_CONFIG: 3600,        // 1 hora
    USER_PROFILE: 1800,         // 30 minutos
    PARTNER_DIRECTORY: 900,     // 15 minutos

    // Dados que mudam moderadamente
    CONVERSATION: 300,          // 5 minutos
    CONTACT: 300,               // 5 minutos
    CASE: 300,                  // 5 minutos

    // Dados que mudam frequentemente
    CONVERSATION_LIST: 60,      // 1 minuto
    MESSAGE_LIST: 30,           // 30 segundos

    // Dados em tempo real (cache curto apenas para aliviar DB)
    INBOX_UNREAD_COUNT: 10,    // 10 segundos
    ONLINE_STATUS: 5,           // 5 segundos

    // Sessões e auth
    SESSION: 7200,              // 2 horas
    AUTH_TOKEN: 900,            // 15 minutos
    RATE_LIMIT: 60,             // 1 minuto
} as const;
