-- =============================================
-- Finance Module - Core Tables
-- Migration: 013_finance_core.sql
-- =============================================
-- Enums for finance module
CREATE TYPE finance_payment_status AS ENUM (
    'PENDING',
    'PAID',
    'PARTIAL',
    'OVERDUE',
    'CANCELLED'
);
CREATE TYPE finance_payment_method AS ENUM (
    'PIX',
    'BOLETO',
    'CREDIT_CARD',
    'DEBIT_CARD',
    'TRANSFER',
    'CASH',
    'OTHER'
);
CREATE TYPE finance_approval_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE finance_entry_type AS ENUM ('RECEIVABLE', 'PAYABLE');
CREATE TYPE finance_invoice_status AS ENUM ('DRAFT', 'ISSUED', 'CANCELLED');
CREATE TYPE finance_transaction_match_status AS ENUM ('UNMATCHED', 'MATCHED', 'MANUAL', 'IGNORED');
-- =============================================
-- Finance Accounts (Contas Bancárias)
-- =============================================
CREATE TABLE finance_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) CHECK (
        type IN ('checking', 'savings', 'investment', 'cash')
    ),
    bank_name VARCHAR(255),
    agency VARCHAR(20),
    account_number VARCHAR(50),
    balance DECIMAL(15, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- =============================================
-- Finance Categories (Categorias de Lançamentos)
-- =============================================
CREATE TABLE finance_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type finance_entry_type NOT NULL,
    parent_id UUID REFERENCES finance_categories(id) ON DELETE
    SET NULL,
        color VARCHAR(7) DEFAULT '#3B82F6',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- =============================================
-- Finance Receivables (Contas a Receber)
-- =============================================
CREATE TABLE finance_receivables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    -- Client reference (can be internal or external)
    client_id UUID,
    client_name VARCHAR(255),
    client_document VARCHAR(20),
    -- CPF/CNPJ
    -- Case reference (optional)
    case_id UUID,
    -- Payment details
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    paid_amount DECIMAL(15, 2) DEFAULT 0,
    due_date DATE NOT NULL,
    payment_date DATE,
    -- Status and method
    status finance_payment_status NOT NULL DEFAULT 'PENDING',
    payment_method finance_payment_method,
    -- Category
    category_id UUID REFERENCES finance_categories(id) ON DELETE
    SET NULL,
        -- Asaas integration
        asaas_payment_id VARCHAR(255),
        asaas_invoice_url TEXT,
        asaas_pix_code TEXT,
        asaas_boleto_url TEXT,
        -- Invoice reference
        invoice_id UUID,
        -- Recurrence (for recurring billing)
        recurrence_type VARCHAR(20),
        -- 'ONCE', 'MONTHLY', 'YEARLY'
        recurrence_parent_id UUID REFERENCES finance_receivables(id) ON DELETE
    SET NULL,
        -- Metadata
        notes TEXT,
        created_by UUID,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- =============================================
-- Finance Payables (Contas a Pagar)
-- =============================================
CREATE TABLE finance_payables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    -- Supplier/Vendor
    supplier_name VARCHAR(255) NOT NULL,
    supplier_document VARCHAR(20),
    -- CPF/CNPJ
    -- Payment details
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    paid_amount DECIMAL(15, 2) DEFAULT 0,
    due_date DATE NOT NULL,
    payment_date DATE,
    -- Status and approval
    status finance_payment_status NOT NULL DEFAULT 'PENDING',
    approval_status finance_approval_status NOT NULL DEFAULT 'PENDING',
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    -- Payment method
    payment_method finance_payment_method,
    -- Category
    category_id UUID REFERENCES finance_categories(id) ON DELETE
    SET NULL,
        -- Bank account for payment
        account_id UUID REFERENCES finance_accounts(id) ON DELETE
    SET NULL,
        -- Attachments (stored in S3)
        attachments JSONB DEFAULT '[]',
        -- Metadata
        notes TEXT,
        created_by UUID,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- =============================================
-- Finance Invoices (Notas Fiscais)
-- =============================================
CREATE TABLE finance_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    -- Invoice number and series
    number VARCHAR(50),
    series VARCHAR(10),
    -- Client
    client_id UUID,
    client_name VARCHAR(255) NOT NULL,
    client_document VARCHAR(20),
    client_address JSONB,
    -- Invoice details
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    issue_date DATE NOT NULL,
    -- Status
    status finance_invoice_status NOT NULL DEFAULT 'DRAFT',
    -- NFSe integration
    nfse_number VARCHAR(50),
    nfse_verification_code VARCHAR(100),
    nfse_pdf_url TEXT,
    nfse_xml_url TEXT,
    -- Related receivable
    receivable_id UUID REFERENCES finance_receivables(id) ON DELETE
    SET NULL,
        -- Metadata
        notes TEXT,
        created_by UUID,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Add invoice reference to receivables
ALTER TABLE finance_receivables
ADD CONSTRAINT fk_receivables_invoice FOREIGN KEY (invoice_id) REFERENCES finance_invoices(id) ON DELETE
SET NULL;
-- =============================================
-- Finance Bank Transactions (Transações Bancárias)
-- =============================================
CREATE TABLE finance_bank_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    -- Bank account
    account_id UUID NOT NULL REFERENCES finance_accounts(id) ON DELETE CASCADE,
    -- Transaction details
    transaction_date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    -- Positive for credit, negative for debit
    balance DECIMAL(15, 2),
    -- External reference (from OFX/CSV import)
    external_id VARCHAR(255),
    -- Matching
    match_status finance_transaction_match_status NOT NULL DEFAULT 'UNMATCHED',
    matched_receivable_id UUID REFERENCES finance_receivables(id) ON DELETE
    SET NULL,
        matched_payable_id UUID REFERENCES finance_payables(id) ON DELETE
    SET NULL,
        matched_at TIMESTAMPTZ,
        matched_by UUID,
        -- Import metadata
        import_source VARCHAR(50),
        -- 'OFX', 'CSV', 'MANUAL', 'OPEN_BANKING'
        import_batch_id UUID,
        raw_data JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Unique constraint for idempotent imports
CREATE UNIQUE INDEX idx_finance_bank_transactions_external ON finance_bank_transactions(tenant_id, account_id, external_id)
WHERE external_id IS NOT NULL;
-- =============================================
-- Finance Audit Log
-- =============================================
CREATE TABLE finance_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    -- Entity reference
    entity_type VARCHAR(50) NOT NULL,
    -- 'RECEIVABLE', 'PAYABLE', 'INVOICE', 'ACCOUNT'
    entity_id UUID NOT NULL,
    -- Action
    action VARCHAR(50) NOT NULL,
    -- 'CREATE', 'UPDATE', 'DELETE', 'PAYMENT', 'APPROVE', 'REJECT'
    -- Actor
    actor_id UUID,
    actor_name VARCHAR(255),
    -- Values
    old_value JSONB,
    new_value JSONB,
    -- IP and User Agent
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- =============================================
-- Row Level Security (RLS)
-- =============================================
ALTER TABLE finance_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_receivables ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_payables ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_audit_log ENABLE ROW LEVEL SECURITY;
-- Policies for tenant isolation
CREATE POLICY "Tenant isolation for finance_accounts" ON finance_accounts USING (
    tenant_id IN (
        SELECT tenant_id
        FROM memberships
        WHERE user_id = auth.uid()
    )
);
CREATE POLICY "Tenant isolation for finance_categories" ON finance_categories USING (
    tenant_id IN (
        SELECT tenant_id
        FROM memberships
        WHERE user_id = auth.uid()
    )
);
CREATE POLICY "Tenant isolation for finance_receivables" ON finance_receivables USING (
    tenant_id IN (
        SELECT tenant_id
        FROM memberships
        WHERE user_id = auth.uid()
    )
);
CREATE POLICY "Tenant isolation for finance_payables" ON finance_payables USING (
    tenant_id IN (
        SELECT tenant_id
        FROM memberships
        WHERE user_id = auth.uid()
    )
);
CREATE POLICY "Tenant isolation for finance_invoices" ON finance_invoices USING (
    tenant_id IN (
        SELECT tenant_id
        FROM memberships
        WHERE user_id = auth.uid()
    )
);
CREATE POLICY "Tenant isolation for finance_bank_transactions" ON finance_bank_transactions USING (
    tenant_id IN (
        SELECT tenant_id
        FROM memberships
        WHERE user_id = auth.uid()
    )
);
CREATE POLICY "Tenant isolation for finance_audit_log" ON finance_audit_log USING (
    tenant_id IN (
        SELECT tenant_id
        FROM memberships
        WHERE user_id = auth.uid()
    )
);
-- =============================================
-- Indexes for performance
-- =============================================
CREATE INDEX idx_finance_receivables_tenant ON finance_receivables(tenant_id);
CREATE INDEX idx_finance_receivables_status ON finance_receivables(status);
CREATE INDEX idx_finance_receivables_due_date ON finance_receivables(due_date);
CREATE INDEX idx_finance_receivables_client ON finance_receivables(client_id);
CREATE INDEX idx_finance_payables_tenant ON finance_payables(tenant_id);
CREATE INDEX idx_finance_payables_status ON finance_payables(status);
CREATE INDEX idx_finance_payables_due_date ON finance_payables(due_date);
CREATE INDEX idx_finance_payables_approval ON finance_payables(approval_status);
CREATE INDEX idx_finance_bank_transactions_tenant ON finance_bank_transactions(tenant_id);
CREATE INDEX idx_finance_bank_transactions_account ON finance_bank_transactions(account_id);
CREATE INDEX idx_finance_bank_transactions_date ON finance_bank_transactions(transaction_date);
CREATE INDEX idx_finance_bank_transactions_match ON finance_bank_transactions(match_status);
CREATE INDEX idx_finance_audit_log_tenant ON finance_audit_log(tenant_id);
CREATE INDEX idx_finance_audit_log_entity ON finance_audit_log(entity_type, entity_id);
CREATE INDEX idx_finance_audit_log_created ON finance_audit_log(created_at DESC);
-- =============================================
-- Trigger for updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_finance_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_finance_accounts_updated_at BEFORE
UPDATE ON finance_accounts FOR EACH ROW EXECUTE FUNCTION update_finance_updated_at();
CREATE TRIGGER trigger_finance_receivables_updated_at BEFORE
UPDATE ON finance_receivables FOR EACH ROW EXECUTE FUNCTION update_finance_updated_at();
CREATE TRIGGER trigger_finance_payables_updated_at BEFORE
UPDATE ON finance_payables FOR EACH ROW EXECUTE FUNCTION update_finance_updated_at();
CREATE TRIGGER trigger_finance_invoices_updated_at BEFORE
UPDATE ON finance_invoices FOR EACH ROW EXECUTE FUNCTION update_finance_updated_at();
-- =============================================
-- Comments for documentation
-- =============================================
COMMENT ON TABLE finance_accounts IS 'Contas bancárias do escritório';
COMMENT ON TABLE finance_categories IS 'Categorias de lançamentos financeiros (receitas/despesas)';
COMMENT ON TABLE finance_receivables IS 'Contas a receber - honorários, parcelas, etc.';
COMMENT ON TABLE finance_payables IS 'Contas a pagar - despesas operacionais, fornecedores';
COMMENT ON TABLE finance_invoices IS 'Notas fiscais de serviço (NFSe)';
COMMENT ON TABLE finance_bank_transactions IS 'Transações importadas para conciliação bancária';
COMMENT ON TABLE finance_audit_log IS 'Auditoria de todas as operações financeiras';