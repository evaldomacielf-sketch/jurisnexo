-- Create Enums
CREATE TYPE crm_meeting_mode AS ENUM ('REMOTE', 'PRESENCIAL');
CREATE TYPE crm_meeting_status AS ENUM ('PENDING', 'CONFIRMED', 'FAILED');
-- OAuth Credentials (per User)
CREATE TABLE crm_oauth_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    -- 'GOOGLE'
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expiry_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, provider)
);
-- Meetings
CREATE TABLE crm_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    conversation_id UUID NOT NULL REFERENCES crm_conversations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    mode crm_meeting_mode NOT NULL,
    location TEXT,
    -- 'Google Meet' or Address
    meet_link TEXT,
    google_event_id TEXT,
    status crm_meeting_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Idempotency Index for Event Creation
CREATE UNIQUE INDEX idx_crm_meetings_idempotency ON crm_meetings(conversation_id, start_time);
-- RLS Policies
ALTER TABLE crm_oauth_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_meetings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users perceive own credentials" ON crm_oauth_credentials USING (user_id = auth.uid());
CREATE POLICY "Tenant isolation for meetings" ON crm_meetings USING (
    tenant_id IN (
        SELECT tenant_id
        FROM memberships
        WHERE user_id = auth.uid()
    )
);