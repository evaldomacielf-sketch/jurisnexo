-- Migration: 005_tenant_invites
-- Description: Tenant invitations management
CREATE TABLE tenant_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
    token TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'revoked')) DEFAULT 'pending',
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES users(id) ON DELETE
    SET NULL
);
-- Indexes
CREATE INDEX idx_tenant_invites_tenant_id ON tenant_invites(tenant_id);
CREATE INDEX idx_tenant_invites_token ON tenant_invites(token);
CREATE INDEX idx_tenant_invites_email ON tenant_invites(email);
-- RLS
ALTER TABLE tenant_invites ENABLE ROW LEVEL SECURITY;
-- Admins/Owners of the tenant can VIEW invites
CREATE POLICY "tenant_invites_select" ON tenant_invites FOR
SELECT USING (
        tenant_id = (auth.jwt()->>'tenant_id')::uuid
        AND EXISTS (
            SELECT 1
            FROM memberships
            WHERE user_id = auth.uid()
                AND tenant_id = (auth.jwt()->>'tenant_id')::uuid
                AND role IN ('owner', 'admin')
        )
    );
-- Admins/Owners can INSERT invites
CREATE POLICY "tenant_invites_insert" ON tenant_invites FOR
INSERT WITH CHECK (
        tenant_id = (auth.jwt()->>'tenant_id')::uuid -- Verify creator has permissions
        AND EXISTS (
            SELECT 1
            FROM memberships
            WHERE user_id = auth.uid()
                AND tenant_id = (auth.jwt()->>'tenant_id')::uuid
                AND role IN ('owner', 'admin')
        )
    );
-- Admins/Owners can UPDATE (revoke) invites
CREATE POLICY "tenant_invites_update" ON tenant_invites FOR
UPDATE USING (
        tenant_id = (auth.jwt()->>'tenant_id')::uuid
        AND EXISTS (
            SELECT 1
            FROM memberships
            WHERE user_id = auth.uid()
                AND tenant_id = (auth.jwt()->>'tenant_id')::uuid
                AND role IN ('owner', 'admin')
        )
    );
-- No DELETE policy (audit trial preference usually suggests keep revoked, but if needed allow delete)
CREATE POLICY "tenant_invites_delete" ON tenant_invites FOR DELETE USING (
    tenant_id = (auth.jwt()->>'tenant_id')::uuid
    AND EXISTS (
        SELECT 1
        FROM memberships
        WHERE user_id = auth.uid()
            AND tenant_id = (auth.jwt()->>'tenant_id')::uuid
            AND role IN ('owner', 'admin')
    )
);