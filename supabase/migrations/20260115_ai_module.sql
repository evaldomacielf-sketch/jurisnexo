-- Migration: AI Module Tables
-- Supports chatbot conversations, embeddings, and usage tracking
-- Enable pgvector extension if not exists
CREATE EXTENSION IF NOT EXISTS vector;
-- ============================================
-- AI Conversations Table
-- ============================================
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_ai_conversations_tenant ON ai_conversations(tenant_id);
CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_updated ON ai_conversations(updated_at DESC);
-- ============================================
-- AI Messages Table
-- ============================================
CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    tokens_used INTEGER,
    cost DECIMAL(10, 6),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_ai_messages_conversation ON ai_messages(conversation_id);
CREATE INDEX idx_ai_messages_created ON ai_messages(created_at);
-- ============================================
-- AI Document Embeddings Table (for RAG)
-- ============================================
CREATE TABLE IF NOT EXISTS ai_document_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL CHECK (
        document_type IN (
            'jurisprudence',
            'legislation',
            'case',
            'contract'
        )
    ),
    source_id UUID,
    -- Reference to original document (case, contract, etc.)
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding vector(3072),
    -- text-embedding-3-large dimension
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- IVFFlat index for approximate nearest neighbor search
CREATE INDEX idx_ai_embeddings_vector ON ai_document_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_ai_embeddings_tenant ON ai_document_embeddings(tenant_id);
CREATE INDEX idx_ai_embeddings_type ON ai_document_embeddings(document_type);
CREATE INDEX idx_ai_embeddings_source ON ai_document_embeddings(source_id);
CREATE INDEX idx_ai_embeddings_metadata ON ai_document_embeddings USING gin(metadata);
-- Full-text search index for hybrid search
ALTER TABLE ai_document_embeddings
ADD COLUMN IF NOT EXISTS search_vector tsvector GENERATED ALWAYS AS (to_tsvector('portuguese', content)) STORED;
CREATE INDEX idx_ai_embeddings_fts ON ai_document_embeddings USING gin(search_vector);
-- ============================================
-- AI Usage Tracking Table (for billing)
-- ============================================
CREATE TABLE IF NOT EXISTS ai_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    input_tokens INTEGER NOT NULL DEFAULT 0,
    output_tokens INTEGER NOT NULL DEFAULT 0,
    cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_ai_usage_tenant ON ai_usage(tenant_id);
CREATE INDEX idx_ai_usage_created ON ai_usage(created_at);
-- ============================================
-- Vector Search Function (for semantic search)
-- ============================================
CREATE OR REPLACE FUNCTION search_embeddings(
        query_embedding vector(3072),
        filter_clause TEXT DEFAULT '',
        match_threshold FLOAT DEFAULT 0.3,
        match_count INT DEFAULT 10
    ) RETURNS TABLE (
        id UUID,
        tenant_id UUID,
        document_type TEXT,
        source_id UUID,
        chunk_index INTEGER,
        content TEXT,
        metadata JSONB,
        similarity FLOAT
    ) LANGUAGE plpgsql AS $$
DECLARE query_text TEXT;
BEGIN query_text := FORMAT(
    'SELECT 
            e.id,
            e.tenant_id,
            e.document_type,
            e.source_id,
            e.chunk_index,
            e.content,
            e.metadata,
            1 - (e.embedding <=> $1) AS similarity
        FROM ai_document_embeddings e
        WHERE 1=1 %s
        AND 1 - (e.embedding <=> $1) > $2
        ORDER BY e.embedding <=> $1
        LIMIT $3',
    CASE
        WHEN filter_clause != '' THEN 'AND ' || filter_clause
        ELSE ''
    END
);
RETURN QUERY EXECUTE query_text USING query_embedding,
match_threshold,
match_count;
END;
$$;
-- ============================================
-- RLS Policies
-- ============================================
-- Conversations
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY ai_conversations_tenant_policy ON ai_conversations FOR ALL USING (
    tenant_id = current_setting('app.tenant_id')::UUID
);
CREATE POLICY ai_conversations_user_policy ON ai_conversations FOR ALL USING (user_id = auth.uid());
-- Messages (inherit from conversation)
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY ai_messages_policy ON ai_messages FOR ALL USING (
    conversation_id IN (
        SELECT id
        FROM ai_conversations
        WHERE tenant_id = current_setting('app.tenant_id')::UUID
    )
);
-- Embeddings
ALTER TABLE ai_document_embeddings ENABLE ROW LEVEL SECURITY;
CREATE POLICY ai_embeddings_tenant_policy ON ai_document_embeddings FOR ALL USING (
    tenant_id = current_setting('app.tenant_id')::UUID
);
-- Usage
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY ai_usage_tenant_policy ON ai_usage FOR ALL USING (
    tenant_id = current_setting('app.tenant_id')::UUID
);
-- ============================================
-- Auto-update timestamps trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_ai_conversation_timestamp() RETURNS TRIGGER AS $$ BEGIN
UPDATE ai_conversations
SET updated_at = NOW()
WHERE id = NEW.conversation_id;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_update_conversation_timestamp
AFTER
INSERT ON ai_messages FOR EACH ROW EXECUTE FUNCTION update_ai_conversation_timestamp();
-- ============================================
-- Usage aggregation view
-- ============================================
CREATE OR REPLACE VIEW ai_usage_monthly AS
SELECT tenant_id,
    DATE_TRUNC('month', created_at) AS month,
    SUM(input_tokens) AS total_input_tokens,
    SUM(output_tokens) AS total_output_tokens,
    SUM(cost) AS total_cost,
    COUNT(*) AS request_count
FROM ai_usage
GROUP BY tenant_id,
    DATE_TRUNC('month', created_at);
COMMENT ON TABLE ai_conversations IS 'Stores chatbot conversation threads';
COMMENT ON TABLE ai_messages IS 'Stores individual messages in conversations';
COMMENT ON TABLE ai_document_embeddings IS 'Vector embeddings for semantic search (RAG)';
COMMENT ON TABLE ai_usage IS 'Tracks AI token usage for billing';