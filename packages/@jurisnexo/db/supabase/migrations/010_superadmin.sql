-- Superadmin Role
CREATE TABLE crm_super_admins (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Tenant Status
CREATE TYPE tenant_status AS ENUM ('ACTIVE', 'DISABLED');
ALTER TABLE tenants
ADD COLUMN status tenant_status NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN disabled_reason TEXT;
-- RLS Policies
-- Superadmins can see all tenants (This requires a specialized query or bypassing RLS via Service Role in API)
-- Standard RLS usually prevents cross-tenant access. 
-- For the Superadmin API, we will likely use the Service Role (DatabaseService) which bypasses RLS.
-- However, we can add a policy for safety if we authenticated differently.
-- Audit Logs for Superadmin Actions
-- We'll reuse crm_audit_logs but with a special tenant_id (or nullable) if needed, 
-- or just log against the specific tenant being modified.