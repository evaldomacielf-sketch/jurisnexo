-- Create Enums
CREATE TYPE crm_partner_status AS ENUM ('ACTIVE', 'BUSY', 'INACTIVE');
CREATE TYPE crm_referral_status AS ENUM (
    'PENDING',
    'ACCEPTED',
    'REJECTED',
    'COMPLETED',
    'FAILED'
);
CREATE TYPE crm_referral_state AS ENUM ('NONE', 'WAITING_CONSENT', 'REFERRED');
-- CRM Partners Directory
CREATE TABLE crm_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    areas TEXT [] DEFAULT '{}',
    -- e.g. ['CRIMINAL', 'CIVIL']
    status crm_partner_status NOT NULL DEFAULT 'ACTIVE',
    last_referral_at TIMESTAMPTZ,
    -- for Round Robin
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- CRM Referrals (History)
CREATE TABLE crm_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES crm_conversations(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES crm_partners(id) ON DELETE CASCADE,
    status crm_referral_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Update Conversations with Referral State
ALTER TABLE crm_conversations
ADD COLUMN referral_state crm_referral_state NOT NULL DEFAULT 'NONE';
-- RLS Policies
ALTER TABLE crm_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation for partners" ON crm_partners USING (
    tenant_id IN (
        SELECT tenant_id
        FROM memberships
        WHERE user_id = auth.uid()
    )
);
CREATE POLICY "Tenant isolation for referrals" ON crm_referrals USING (
    tenant_id IN (
        SELECT tenant_id
        FROM memberships
        WHERE user_id = auth.uid()
    )
);