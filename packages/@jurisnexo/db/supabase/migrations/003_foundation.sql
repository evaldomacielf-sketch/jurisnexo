/*
 Migration: 003_foundation.sql
 Description: Adds user_preferences, tenant_branding, and audit_events tables.
 */
-- User Preferences (Global per user)
CREATE TABLE user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'system',
    locale TEXT DEFAULT 'pt-BR',
    notification_settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE POLICY "user_preferences_own" ON user_preferences FOR ALL USING (user_id = auth.uid());
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
-- Tenant Branding
CREATE TABLE tenant_branding (
    tenant_id UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
    primary_color TEXT,
    secondary_color TEXT,
    logo_url TEXT,
    favicon_url TEXT,
    custom_domain TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE tenant_branding ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_branding_select" ON tenant_branding FOR
SELECT USING (tenant_id = auth.jwt()->>'tenant_id');
CREATE POLICY "tenant_branding_update" ON tenant_branding FOR
UPDATE USING (tenant_id = auth.jwt()->>'tenant_id');
-- Audit Events (Strictly append-only)
DROP TABLE IF EXISTS audit_logs;
CREATE TABLE audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE
    SET NULL,
        event_type TEXT NOT NULL,
        resource_type TEXT NOT NULL,
        resource_id UUID,
        metadata JSONB DEFAULT '{}',
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
);
-- Indexes for Audit
CREATE INDEX idx_audit_events_tenant ON audit_events(tenant_id);
CREATE INDEX idx_audit_events_resource ON audit_events(resource_type, resource_id);
CREATE INDEX idx_audit_events_date ON audit_events(created_at DESC);
-- RLS for Audit
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
-- Insert: Allow authed users to insert into their tenant
CREATE POLICY "audit_events_insert" ON audit_events FOR
INSERT WITH CHECK (tenant_id = auth.jwt()->>'tenant_id');
-- Select: Allow viewing own tenant logs
CREATE POLICY "audit_events_select" ON audit_events FOR
SELECT USING (tenant_id = auth.jwt()->>'tenant_id');
-- Update/Delete: BLOCKED (Append-only)
-- No policies created for UPDATE or DELETE implies they are forbidden by default when RLS is enabled.