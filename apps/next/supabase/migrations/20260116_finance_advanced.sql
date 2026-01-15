-- Migration: Advanced Finance Modules
-- Description: Adds tables for Legal Fees, Fee Splits, Cash Book, and Payment Portal
-- Author: JurisNexo Team
-- Date: 2026-01-16
BEGIN;
--------------------------------------------------------------------------------
-- 1. Legal Fees (Gestão de Honorários)
--------------------------------------------------------------------------------
CREATE TYPE finance_fee_type AS ENUM (
    'hourly',
    'fixed',
    'contingency',
    'success_fee',
    'retainer'
);
CREATE TYPE finance_fee_status AS ENUM (
    'pending',
    'partial_paid',
    'paid',
    'overdue',
    'cancelled'
);
CREATE TABLE IF NOT EXISTS finance_legal_fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    case_id UUID,
    -- Optional link to Cases module
    client_id UUID NOT NULL,
    -- Link to Clients module
    description VARCHAR(200) NOT NULL,
    fee_type finance_fee_type NOT NULL,
    -- Financials
    contracted_amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
    pending_amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
    case_costs DECIMAL(18, 2) NOT NULL DEFAULT 0,
    net_profit DECIMAL(18, 2) GENERATED ALWAYS AS (paid_amount - case_costs) STORED,
    profit_margin DECIMAL(5, 2),
    -- Calculated via trigger/app logic
    -- Status & Dates
    payment_status finance_fee_status NOT NULL DEFAULT 'pending',
    due_date TIMESTAMPTZ,
    settlement_date TIMESTAMPTZ,
    -- Configuration (Installments, recurrences)
    payment_configuration JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);
-- Payments specific to Legal Fees
CREATE TABLE IF NOT EXISTS finance_fee_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    legal_fee_id UUID NOT NULL REFERENCES finance_legal_fees(id) ON DELETE CASCADE,
    amount DECIMAL(18, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    -- reused or plain string
    payment_date TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    -- pending, confirmed, failed
    gateway_transaction_id VARCHAR(200),
    gateway VARCHAR(50),
    -- stripe, asaas
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- RLS
ALTER TABLE finance_legal_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_fee_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenants can view their own legal fees" ON finance_legal_fees FOR
SELECT USING (
        auth.uid()::uuid IN (
            SELECT user_id
            FROM user_tenants
            WHERE tenant_id = finance_legal_fees.tenant_id
        )
    );
CREATE POLICY "Tenants can manage their own legal fees" ON finance_legal_fees FOR ALL USING (
    auth.uid()::uuid IN (
        SELECT user_id
        FROM user_tenants
        WHERE tenant_id = finance_legal_fees.tenant_id
    )
);
CREATE POLICY "Tenants can view their own fee payments" ON finance_fee_payments FOR
SELECT USING (
        auth.uid()::uuid IN (
            SELECT user_id
            FROM user_tenants
            WHERE tenant_id = finance_fee_payments.tenant_id
        )
    );
CREATE POLICY "Tenants can manage their own fee payments" ON finance_fee_payments FOR ALL USING (
    auth.uid()::uuid IN (
        SELECT user_id
        FROM user_tenants
        WHERE tenant_id = finance_fee_payments.tenant_id
    )
);
--------------------------------------------------------------------------------
-- 2. Fee Split (Divisão de Honorários)
--------------------------------------------------------------------------------
CREATE TYPE finance_split_type AS ENUM ('percentage', 'fixed', 'progressive');
CREATE TYPE finance_split_status AS ENUM (
    'pending',
    'calculated',
    'approved',
    'rejected',
    'paid'
);
CREATE TABLE IF NOT EXISTS finance_fee_split_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    split_type finance_split_type NOT NULL,
    is_automatic BOOLEAN DEFAULT FALSE,
    -- Configuration: { "splits": [{ "lawyer_id": "...", "percentage": 50 }] }
    configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);
CREATE TABLE IF NOT EXISTS finance_fee_split_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    rule_id UUID NOT NULL REFERENCES finance_fee_split_rules(id),
    -- Link to the origin transaction (could be a general finance_transaction or a legal_fee_payment)
    -- For flexibility, we link to finance_transactions. If needed for legal_fees, we can add optional FK.
    origin_transaction_id UUID NOT NULL REFERENCES finance_transactions(id),
    total_amount DECIMAL(18, 2) NOT NULL,
    split_date TIMESTAMPTZ NOT NULL,
    status finance_split_status NOT NULL DEFAULT 'pending',
    -- Snapshot of calculated splits: [{ "lawyer_id": "...", "amount": 1000 }]
    splits JSONB NOT NULL DEFAULT '[]'::jsonb,
    approved_at TIMESTAMPTZ,
    approved_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID
);
-- RLS
ALTER TABLE finance_fee_split_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_fee_split_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenants can view split rules" ON finance_fee_split_rules FOR
SELECT USING (
        auth.uid()::uuid IN (
            SELECT user_id
            FROM user_tenants
            WHERE tenant_id = finance_fee_split_rules.tenant_id
        )
    );
CREATE POLICY "Tenants can manage split rules" ON finance_fee_split_rules FOR ALL USING (
    auth.uid()::uuid IN (
        SELECT user_id
        FROM user_tenants
        WHERE tenant_id = finance_fee_split_rules.tenant_id
    )
);
CREATE POLICY "Tenants can view split txs" ON finance_fee_split_transactions FOR
SELECT USING (
        auth.uid()::uuid IN (
            SELECT user_id
            FROM user_tenants
            WHERE tenant_id = finance_fee_split_transactions.tenant_id
        )
    );
CREATE POLICY "Tenants can manage split txs" ON finance_fee_split_transactions FOR ALL USING (
    auth.uid()::uuid IN (
        SELECT user_id
        FROM user_tenants
        WHERE tenant_id = finance_fee_split_transactions.tenant_id
    )
);
--------------------------------------------------------------------------------
-- 3. Cash Book (Livro Caixa Digital / IR)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS finance_cash_book_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    -- Link to actual transaction
    transaction_id UUID NOT NULL REFERENCES finance_transactions(id) ON DELETE CASCADE,
    fiscal_category VARCHAR(100) NOT NULL,
    -- 'honorarios', 'aluguel', 'material'
    is_deductible BOOLEAN DEFAULT FALSE,
    deductible_percentage DECIMAL(5, 2) DEFAULT 0,
    -- 0-100
    deductible_amount DECIMAL(18, 2) DEFAULT 0,
    fiscal_competence_date DATE NOT NULL,
    -- Mes/Ano referencia
    notes TEXT,
    proof_url VARCHAR(500),
    -- Comprovante ID/URL
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);
-- RLS
ALTER TABLE finance_cash_book_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenants can view cash book" ON finance_cash_book_entries FOR
SELECT USING (
        auth.uid()::uuid IN (
            SELECT user_id
            FROM user_tenants
            WHERE tenant_id = finance_cash_book_entries.tenant_id
        )
    );
CREATE POLICY "Tenants can manage cash book" ON finance_cash_book_entries FOR ALL USING (
    auth.uid()::uuid IN (
        SELECT user_id
        FROM user_tenants
        WHERE tenant_id = finance_cash_book_entries.tenant_id
    )
);
--------------------------------------------------------------------------------
-- 4. Payment Portal (White Label)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS finance_payment_portal_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL UNIQUE,
    -- One settings per tenant
    firm_name VARCHAR(200) NOT NULL,
    logo_url VARCHAR(500),
    primary_color VARCHAR(7),
    secondary_color VARCHAR(7),
    enabled_payment_methods JSONB DEFAULT '["pix", "credit_card", "boleto"]'::jsonb,
    default_gateway VARCHAR(50) DEFAULT 'stripe',
    -- Encrypted/Sensitive fields should ideally be in Vault, but for MVP storing here
    stripe_public_key VARCHAR(500),
    stripe_secret_key VARCHAR(500),
    -- Should be encrypted app-side
    asaas_api_key VARCHAR(500),
    -- Should be encrypted app-side
    asaas_environment VARCHAR(50) DEFAULT 'sandbox',
    webhook_url VARCHAR(500),
    welcome_message TEXT,
    terms_and_conditions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS finance_payment_checkouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    legal_fee_id UUID REFERENCES finance_legal_fees(id),
    slug VARCHAR(100) NOT NULL,
    -- Unique public identifier
    amount DECIMAL(18, 2) NOT NULL,
    description VARCHAR(200) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    -- active, expired, completed, cancelled
    expires_at TIMESTAMPTZ,
    payer_client_id UUID,
    -- Optional link to client
    payer_email VARCHAR(200),
    payer_name VARCHAR(200),
    allowed_methods JSONB,
    access_count INT DEFAULT 0,
    last_access_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID
);
CREATE UNIQUE INDEX idx_payment_checkouts_slug ON finance_payment_checkouts(slug);
-- RLS
ALTER TABLE finance_payment_portal_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_payment_checkouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenants can view own portal settings" ON finance_payment_portal_settings FOR
SELECT USING (
        auth.uid()::uuid IN (
            SELECT user_id
            FROM user_tenants
            WHERE tenant_id = finance_payment_portal_settings.tenant_id
        )
    );
CREATE POLICY "Tenants can manage own portal settings" ON finance_payment_portal_settings FOR ALL USING (
    auth.uid()::uuid IN (
        SELECT user_id
        FROM user_tenants
        WHERE tenant_id = finance_payment_portal_settings.tenant_id
    )
);
CREATE POLICY "Tenants can view own checkouts" ON finance_payment_checkouts FOR
SELECT USING (
        auth.uid()::uuid IN (
            SELECT user_id
            FROM user_tenants
            WHERE tenant_id = finance_payment_checkouts.tenant_id
        )
    );
CREATE POLICY "Tenants can manage own checkouts" ON finance_payment_checkouts FOR ALL USING (
    auth.uid()::uuid IN (
        SELECT user_id
        FROM user_tenants
        WHERE tenant_id = finance_payment_checkouts.tenant_id
    )
);
-- Public Access Policy for Checkouts (needed for the public payment page)
-- We need a function to bypass RLS or a specialized policy for public access by slug
-- For now, we will rely on a SERVICE ROLE key in the backend to fetch checkouts by slug for the public page,
-- rather than exposing the table publicly.
COMMIT;