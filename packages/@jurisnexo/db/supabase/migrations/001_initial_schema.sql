-- JurisNexo Initial Schema
-- Migration: 001_initial_schema
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- Enum types
CREATE TYPE plan_type AS ENUM ('trial', 'basic', 'pro', 'enterprise');
CREATE TYPE user_role AS ENUM ('admin', 'lawyer', 'secretary', 'paralegal');
-- Tenants table (offices)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    plan plan_type NOT NULL DEFAULT 'trial',
    settings JSONB DEFAULT '{}',
    trial_ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- Users table (linked to auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'lawyer',
    avatar_url TEXT,
    oab_number TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- Audit logs (append-only)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
-- Indexes
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
-- RLS Policies
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
-- Tenant policies (users see only their tenant)
CREATE POLICY "tenant_isolation" ON tenants FOR ALL USING (id = (auth.jwt()->>'tenant_id')::uuid);
-- User policies
CREATE POLICY "users_tenant_isolation" ON users FOR ALL USING (tenant_id = (auth.jwt()->>'tenant_id')::uuid);
-- Audit log policies (insert only, read own tenant)
CREATE POLICY "audit_logs_insert" ON audit_logs FOR
INSERT WITH CHECK (tenant_id = (auth.jwt()->>'tenant_id')::uuid);
CREATE POLICY "audit_logs_select" ON audit_logs FOR
SELECT USING (tenant_id = (auth.jwt()->>'tenant_id')::uuid);
-- No UPDATE or DELETE allowed on audit_logs
-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER update_tenants_updated_at BEFORE
UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_users_updated_at BEFORE
UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();