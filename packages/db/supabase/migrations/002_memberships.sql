/*
 Migration: 002_memberships.sql
 Description: Memberships table linking users to tenants with role.
 */
CREATE TABLE memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- Index for fast lookup by tenant
CREATE INDEX idx_memberships_tenant_id ON memberships (tenant_id);
-- Ensure a user has only one membership per tenant
CREATE UNIQUE INDEX uq_memberships_user_tenant ON memberships (tenant_id, user_id);
-- RLS policies for tenant isolation
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_select" ON memberships FOR
SELECT USING (tenant_id = auth.jwt()->>'tenant_id');
CREATE POLICY "tenant_isolation_insert" ON memberships FOR
INSERT WITH CHECK (tenant_id = auth.jwt()->>'tenant_id');
CREATE POLICY "tenant_isolation_update" ON memberships FOR
UPDATE USING (tenant_id = auth.jwt()->>'tenant_id') WITH CHECK (tenant_id = auth.jwt()->>'tenant_id');
CREATE POLICY "tenant_isolation_delete" ON memberships FOR DELETE USING (tenant_id = auth.jwt()->>'tenant_id');