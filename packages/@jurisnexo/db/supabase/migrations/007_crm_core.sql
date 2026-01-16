-- Create Enums
CREATE TYPE crm_urgency_level AS ENUM ('NORMAL', 'HIGH', 'PLANTAO');
CREATE TYPE crm_conversation_status AS ENUM ('OPEN', 'CLOSED', 'ARCHIVED');
CREATE TYPE crm_message_direction AS ENUM ('INBOUND', 'OUTBOUND');
CREATE TYPE crm_message_status AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'FAILED');
-- CRM Contacts
CREATE TABLE crm_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- CRM Conversations
CREATE TABLE crm_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES crm_contacts(id) ON DELETE CASCADE,
    assignee_id UUID REFERENCES auth.users(id) ON DELETE
    SET NULL,
        status crm_conversation_status NOT NULL DEFAULT 'OPEN',
        urgency crm_urgency_level NOT NULL DEFAULT 'NORMAL',
        last_message_at TIMESTAMPTZ DEFAULT NOW(),
        first_human_reply_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- CRM Messages
CREATE TABLE crm_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES crm_conversations(id) ON DELETE CASCADE,
    direction crm_message_direction NOT NULL,
    content TEXT NOT NULL,
    status crm_message_status NOT NULL DEFAULT 'QUEUED',
    provider_message_id TEXT,
    -- For Idempotency
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Unique constraint for Inbound Idempotency
CREATE UNIQUE INDEX idx_crm_messages_provider_id ON crm_messages(tenant_id, provider_message_id)
WHERE provider_message_id IS NOT NULL;
-- CRM Tags
CREATE TABLE crm_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#94A3B8',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- CRM Conversation Tags
CREATE TABLE crm_conversation_tags (
    conversation_id UUID NOT NULL REFERENCES crm_conversations(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES crm_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (conversation_id, tag_id)
);
-- CRM Audit Logs
CREATE TABLE crm_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,
    -- 'CONVERSATION', 'MESSAGE'
    entity_id UUID NOT NULL,
    action TEXT NOT NULL,
    -- 'URGENCY_CHANGED', 'SLA_BREACH', 'MESSAGE_RECEIVED'
    actor_id UUID REFERENCES auth.users(id) ON DELETE
    SET NULL,
        -- Null if system
        old_value JSONB,
        new_value JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- RLS Policies (Simple Tenant Isolation)
ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_conversation_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_audit_logs ENABLE ROW LEVEL SECURITY;
-- Policies for Contacts
CREATE POLICY "Tenant isolation for contacts" ON crm_contacts USING (
    tenant_id IN (
        SELECT tenant_id
        FROM memberships
        WHERE user_id = auth.uid()
    )
);
-- Policies for Conversations
CREATE POLICY "Tenant isolation for conversations" ON crm_conversations USING (
    tenant_id IN (
        SELECT tenant_id
        FROM memberships
        WHERE user_id = auth.uid()
    )
);
-- Policies for Messages
CREATE POLICY "Tenant isolation for messages" ON crm_messages USING (
    tenant_id IN (
        SELECT tenant_id
        FROM memberships
        WHERE user_id = auth.uid()
    )
);
-- Policies for Tags
CREATE POLICY "Tenant isolation for tags" ON crm_tags USING (
    tenant_id IN (
        SELECT tenant_id
        FROM memberships
        WHERE user_id = auth.uid()
    )
);
-- Policies for Audit Logs
CREATE POLICY "Tenant isolation for audit logs" ON crm_audit_logs USING (
    tenant_id IN (
        SELECT tenant_id
        FROM memberships
        WHERE user_id = auth.uid()
    )
);