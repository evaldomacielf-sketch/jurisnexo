-- Migration: 20260113090000_helper_functions.sql
-- Description: Helper functions for all modules
-- ============================================
-- 1. Enable Extensions
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
COMMENT ON EXTENSION "uuid-ossp" IS 'UUID generation functions';
COMMENT ON EXTENSION "pgcrypto" IS 'Cryptographic functions';
-- ============================================
-- 2. Updated At Trigger Function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
COMMENT ON FUNCTION update_updated_at_column IS 'Atualiza automaticamente o campo updated_at em qualquer tabela';
-- ============================================
-- 3. Set Tenant Context Function
-- ============================================
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_id UUID) RETURNS VOID AS $$ BEGIN PERFORM set_config('app.current_tenant_id', tenant_id::TEXT, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
COMMENT ON FUNCTION set_tenant_context IS 'Define o tenant_id no contexto da sessão para RLS';
-- ============================================
-- 4. Get Current Tenant Function
-- ============================================
CREATE OR REPLACE FUNCTION get_current_tenant_id() RETURNS UUID AS $$ BEGIN RETURN current_setting('app.current_tenant_id', true)::UUID;
EXCEPTION
WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;
COMMENT ON FUNCTION get_current_tenant_id IS 'Retorna o tenant_id do contexto atual';
-- ============================================
-- 5. Generate Slug Function
-- ============================================
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT) RETURNS TEXT AS $$ BEGIN RETURN lower(
        regexp_replace(
            regexp_replace(
                unaccent(input_text),
                '[^a-zA-Z0-9\s-]',
                '',
                'g'
            ),
            '\s+',
            '-',
            'g'
        )
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;
COMMENT ON FUNCTION generate_slug IS 'Gera slug URL-safe a partir de texto';
-- Dependência para generate_slug
CREATE EXTENSION IF NOT EXISTS unaccent;