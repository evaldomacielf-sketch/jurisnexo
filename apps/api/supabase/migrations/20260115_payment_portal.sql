-- MIGRATION 004: PAYMENT PORTAL (Portal de Pagamento White-Label)
-- Author: Programador Full-Stack Expert
-- Date: 2026-01-15
-- Description: Sistema de checkout personalizado com Stripe e Asaas
-- 
-- Tabela de Configurações do Portal
CREATE TABLE IF NOT EXISTS payment_portal_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL UNIQUE,
    firm_name VARCHAR(200) NOT NULL,
    logo_url VARCHAR(500),
    primary_color VARCHAR(7) DEFAULT '#3B82F6',
    secondary_color VARCHAR(7) DEFAULT '#1E40AF',
    enabled_payment_methods JSONB NOT NULL DEFAULT '["pix", "credit_card", "boleto"]'::jsonb,
    default_gateway VARCHAR(50) NOT NULL DEFAULT 'stripe' CHECK (default_gateway IN ('stripe', 'asaas')),
    stripe_public_key VARCHAR(500),
    stripe_secret_key VARCHAR(500),
    asaas_api_key VARCHAR(500),
    asaas_environment VARCHAR(50) DEFAULT 'production' CHECK (asaas_environment IN ('sandbox', 'production')),
    webhook_url VARCHAR(500),
    welcome_message TEXT,
    terms_and_conditions TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Índice
CREATE INDEX IF NOT EXISTS idx_payment_portal_settings_tenant ON payment_portal_settings(tenant_id);
-- Comentários
COMMENT ON TABLE payment_portal_settings IS 'Configurações white-label do portal de pagamento por escritório';
COMMENT ON COLUMN payment_portal_settings.stripe_secret_key IS 'Chave deve ser criptografada antes de armazenar';
COMMENT ON COLUMN payment_portal_settings.asaas_api_key IS 'Token deve ser criptografado antes de armazenar';
-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS update_payment_portal_settings_updated_at ON payment_portal_settings;
CREATE TRIGGER update_payment_portal_settings_updated_at BEFORE
UPDATE ON payment_portal_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Tabela de Checkouts/Links de Pagamento
CREATE TABLE IF NOT EXISTS payment_checkouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    legal_fee_id UUID,
    slug VARCHAR(100) NOT NULL UNIQUE,
    amount DECIMAL(18, 2) NOT NULL CHECK (amount > 0),
    description VARCHAR(200) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (
        status IN ('active', 'expired', 'completed', 'cancelled')
    ),
    expires_at TIMESTAMPTZ,
    client_id UUID,
    payer_email VARCHAR(200),
    payer_name VARCHAR(200),
    allowed_payment_methods JSONB,
    access_count INT NOT NULL DEFAULT 0,
    last_access_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL,
    -- Foreign Keys
    CONSTRAINT fk_checkout_legal_fee FOREIGN KEY (legal_fee_id) REFERENCES legal_fees(id) ON DELETE
    SET NULL
);
-- Índices
CREATE INDEX IF NOT EXISTS idx_payment_checkouts_tenant ON payment_checkouts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payment_checkouts_slug ON payment_checkouts(slug);
CREATE INDEX IF NOT EXISTS idx_payment_checkouts_status ON payment_checkouts(status);
CREATE INDEX IF NOT EXISTS idx_payment_checkouts_legal_fee ON payment_checkouts(legal_fee_id);
CREATE INDEX IF NOT EXISTS idx_payment_checkouts_expires ON payment_checkouts(expires_at);
-- Comentários
COMMENT ON TABLE payment_checkouts IS 'Links de pagamento gerados para clientes';
COMMENT ON COLUMN payment_checkouts.slug IS 'Identificador único para URL amigável: /pay/{slug}';
COMMENT ON COLUMN payment_checkouts.access_count IS 'Número de vezes que o link foi acessado';
-- Trigger updated_at
DROP TRIGGER IF EXISTS update_payment_checkouts_updated_at ON payment_checkouts;
CREATE TRIGGER update_payment_checkouts_updated_at BEFORE
UPDATE ON payment_checkouts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ===== ROW LEVEL SECURITY =====
-- payment_portal_settings
ALTER TABLE payment_portal_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS payment_portal_settings_select ON payment_portal_settings;
CREATE POLICY payment_portal_settings_select ON payment_portal_settings FOR
SELECT USING (tenant_id = (auth.jwt()->>'tenant_id')::uuid);
DROP POLICY IF EXISTS payment_portal_settings_insert ON payment_portal_settings;
CREATE POLICY payment_portal_settings_insert ON payment_portal_settings FOR
INSERT WITH CHECK (tenant_id = (auth.jwt()->>'tenant_id')::uuid);
DROP POLICY IF EXISTS payment_portal_settings_update ON payment_portal_settings;
CREATE POLICY payment_portal_settings_update ON payment_portal_settings FOR
UPDATE USING (tenant_id = (auth.jwt()->>'tenant_id')::uuid);
-- payment_checkouts
ALTER TABLE payment_checkouts ENABLE ROW LEVEL SECURITY;
-- Permite SELECT público por slug (sem autenticação)
DROP POLICY IF EXISTS payment_checkouts_public_select ON payment_checkouts;
CREATE POLICY payment_checkouts_public_select ON payment_checkouts FOR
SELECT USING (
        status = 'active'
        AND (
            expires_at IS NULL
            OR expires_at > NOW()
        )
    );
-- Requer autenticação para outras operações
DROP POLICY IF EXISTS payment_checkouts_tenant_insert ON payment_checkouts;
CREATE POLICY payment_checkouts_tenant_insert ON payment_checkouts FOR
INSERT WITH CHECK (tenant_id = (auth.jwt()->>'tenant_id')::uuid);
DROP POLICY IF EXISTS payment_checkouts_tenant_update ON payment_checkouts;
CREATE POLICY payment_checkouts_tenant_update ON payment_checkouts FOR
UPDATE USING (tenant_id = (auth.jwt()->>'tenant_id')::uuid);
DROP POLICY IF EXISTS payment_checkouts_tenant_delete ON payment_checkouts;
CREATE POLICY payment_checkouts_tenant_delete ON payment_checkouts FOR DELETE USING (tenant_id = (auth.jwt()->>'tenant_id')::uuid);
-- ===== FUNÇÃO: GERAR SLUG ÚNICO =====
CREATE OR REPLACE FUNCTION generate_unique_slug(p_length INT DEFAULT 12) RETURNS VARCHAR AS $$
DECLARE v_slug VARCHAR;
v_exists BOOLEAN;
BEGIN LOOP -- Gera slug aleatório
v_slug := lower(
    substring(
        md5(random()::text || clock_timestamp()::text)
        from 1 for p_length
    )
);
-- Verifica se já existe
SELECT EXISTS(
        SELECT 1
        FROM payment_checkouts
        WHERE slug = v_slug
    ) INTO v_exists;
EXIT
WHEN NOT v_exists;
END LOOP;
RETURN v_slug;
END;
$$ LANGUAGE plpgsql;
-- ===== TRIGGER: EXPIRAR CHECKOUTS AUTOMATICAMENTE =====
CREATE OR REPLACE FUNCTION expire_checkout_on_completion() RETURNS TRIGGER AS $$ BEGIN IF NEW.status = 'completed' THEN NEW.expires_at := NOW();
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trigger_expire_checkout_on_completion ON payment_checkouts;
CREATE TRIGGER trigger_expire_checkout_on_completion BEFORE
UPDATE ON payment_checkouts FOR EACH ROW
    WHEN (
        NEW.status = 'completed'
        AND OLD.status != 'completed'
    ) EXECUTE FUNCTION expire_checkout_on_completion();
-- ===== FUNÇÃO: INCREMENTAR CONTADOR DE ACESSOS =====
CREATE OR REPLACE FUNCTION increment_checkout_access(p_slug VARCHAR) RETURNS VOID AS $$ BEGIN
UPDATE payment_checkouts
SET access_count = access_count + 1,
    last_access_at = NOW()
WHERE slug = p_slug;
END;
$$ LANGUAGE plpgsql;