-- Otimização de Indices baseada na Query Principal de Conversas
-- 1. Melhorar a busca e ordenação da lista de conversas
-- Query: WHERE tenant_id = ? AND status = ? ORDER BY last_message_at DESC
DROP INDEX IF EXISTS idx_conversations_tenant;
-- Substituído pelo índice composto mais específico
CREATE INDEX idx_conversations_perf_list ON conversations(tenant_id, status, last_message_at DESC);
-- 2. Otimizar o JOIN LATERAL para pegar a última mensagem
-- Query: WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 1
DROP INDEX IF EXISTS idx_messages_conversation;
-- Substituído pelo índice composto
CREATE INDEX idx_messages_perf_latest ON messages(conversation_id, created_at DESC);
-- 3. Índices adicionais para filtros comuns não cobertos
CREATE INDEX idx_conversations_status ON conversations(status);