-- Migration: Calendar & Chat Tables
-- Supports calendar sync, chat messaging, and real-time features
-- ============================================
-- User Integrations (for Google Calendar OAuth)
-- ============================================
CREATE TABLE IF NOT EXISTS user_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    -- 'google_calendar', 'microsoft_outlook', etc.
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expiry_date BIGINT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, provider)
);
CREATE INDEX idx_integrations_user ON user_integrations(user_id);
CREATE INDEX idx_integrations_provider ON user_integrations(provider);
-- ============================================
-- Calendar Events
-- ============================================
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'outro' CHECK (
        type IN (
            'audiencia',
            'reuniao',
            'prazo',
            'consulta',
            'depoimento',
            'pericia',
            'mediacao',
            'outro'
        )
    ),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    all_day BOOLEAN DEFAULT false,
    location TEXT,
    video_link TEXT,
    case_id UUID REFERENCES cases(id) ON DELETE
    SET NULL,
        client_id UUID REFERENCES clients(id) ON DELETE
    SET NULL,
        participant_ids UUID [] DEFAULT '{}',
        reminders JSONB DEFAULT '[]',
        recurrence JSONB,
        color TEXT,
        google_event_id TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_events_tenant ON calendar_events(tenant_id);
CREATE INDEX idx_events_dates ON calendar_events(start_date, end_date);
CREATE INDEX idx_events_case ON calendar_events(case_id);
CREATE INDEX idx_events_client ON calendar_events(client_id);
CREATE INDEX idx_events_type ON calendar_events(type);
CREATE INDEX idx_events_google ON calendar_events(google_event_id)
WHERE google_event_id IS NOT NULL;
-- ============================================
-- Chats
-- ============================================
CREATE TABLE IF NOT EXISTS chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),
    type TEXT NOT NULL DEFAULT 'direct' CHECK (type IN ('direct', 'group', 'case', 'client')),
    name TEXT,
    case_id UUID REFERENCES cases(id) ON DELETE
    SET NULL,
        client_id UUID REFERENCES clients(id) ON DELETE
    SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_chats_tenant ON chats(tenant_id);
CREATE INDEX idx_chats_case ON chats(case_id);
CREATE INDEX idx_chats_client ON chats(client_id);
CREATE INDEX idx_chats_updated ON chats(updated_at DESC);
-- ============================================
-- Chat Participants
-- ============================================
CREATE TABLE IF NOT EXISTS chat_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_read_at TIMESTAMPTZ,
    UNIQUE(chat_id, user_id)
);
CREATE INDEX idx_participants_chat ON chat_participants(chat_id);
CREATE INDEX idx_participants_user ON chat_participants(user_id);
-- ============================================
-- Chat Messages
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    type TEXT NOT NULL DEFAULT 'text' CHECK (
        type IN ('text', 'file', 'image', 'audio', 'system')
    ),
    content TEXT NOT NULL,
    file_url TEXT,
    file_name TEXT,
    reply_to_id UUID REFERENCES chat_messages(id),
    read_by UUID [] DEFAULT '{}',
    is_edited BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_messages_chat ON chat_messages(chat_id);
CREATE INDEX idx_messages_sender ON chat_messages(sender_id);
CREATE INDEX idx_messages_created ON chat_messages(chat_id, created_at DESC);
-- ============================================
-- RLS Policies
-- ============================================
-- User Integrations
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY integrations_user_policy ON user_integrations FOR ALL USING (user_id = auth.uid());
-- Calendar Events
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY events_tenant_policy ON calendar_events FOR ALL USING (
    tenant_id = current_setting('app.tenant_id')::UUID
);
-- Chats
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
CREATE POLICY chats_tenant_policy ON chats FOR ALL USING (
    tenant_id = current_setting('app.tenant_id')::UUID
);
-- Chat Participants
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY participants_policy ON chat_participants FOR ALL USING (
    user_id = auth.uid()
    OR chat_id IN (
        SELECT chat_id
        FROM chat_participants
        WHERE user_id = auth.uid()
    )
);
-- Chat Messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY messages_policy ON chat_messages FOR ALL USING (
    chat_id IN (
        SELECT chat_id
        FROM chat_participants
        WHERE user_id = auth.uid()
    )
);
-- ============================================
-- Function for adding to read_by array
-- ============================================
CREATE OR REPLACE FUNCTION add_to_read_by(p_message_id UUID, p_user_id UUID) RETURNS VOID AS $$ BEGIN
UPDATE chat_messages
SET read_by = array_append(read_by, p_user_id)
WHERE id = p_message_id
    AND NOT (p_user_id = ANY(read_by));
END;
$$ LANGUAGE plpgsql;
-- ============================================
-- Comments
-- ============================================
COMMENT ON TABLE user_integrations IS 'OAuth tokens for external service integrations';
COMMENT ON TABLE calendar_events IS 'Calendar events with Google Calendar sync support';
COMMENT ON TABLE chats IS 'Chat conversations (direct, group, case-related)';
COMMENT ON TABLE chat_participants IS 'Chat membership and read tracking';
COMMENT ON TABLE chat_messages IS 'Individual chat messages with read receipts';