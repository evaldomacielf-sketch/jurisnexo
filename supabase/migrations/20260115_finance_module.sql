-- Migration: 20260115_finance_module.sql
-- Description: Complete financial module tables with RLS
-- ============================================
-- 1. FINANCE CATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS finance_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE', 'BOTH')),
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    icon VARCHAR(50),
    is_system BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, name)
);
COMMENT ON TABLE finance_categories IS 'Categorias financeiras para classificação de transações';
-- ============================================
-- 2. FINANCE ACCOUNTS (Bank Accounts)
-- ============================================
CREATE TABLE IF NOT EXISTS finance_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    agency VARCHAR(20),
    account_number VARCHAR(30) NOT NULL,
    account_type VARCHAR(20) NOT NULL CHECK (
        account_type IN (
            'CHECKING',
            'SAVINGS',
            'INVESTMENT',
            'CREDIT_CARD'
        )
    ),
    current_balance DECIMAL(15, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, bank_name, account_number)
);
COMMENT ON TABLE finance_accounts IS 'Contas bancárias do escritório';
-- ============================================
-- 3. FINANCE TRANSACTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS finance_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES finance_accounts(id) ON DELETE RESTRICT,
    category_id UUID REFERENCES finance_categories(id) ON DELETE
    SET NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
        description VARCHAR(500) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
        transaction_date DATE NOT NULL,
        payment_method VARCHAR(30) CHECK (
            payment_method IN (
                'CASH',
                'BANK_TRANSFER',
                'CREDIT_CARD',
                'DEBIT_CARD',
                'PIX',
                'CHECK',
                'OTHER'
            )
        ),
        status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED')),
        case_id UUID REFERENCES cases(id) ON DELETE
    SET NULL,
        client_id UUID REFERENCES contacts(id) ON DELETE
    SET NULL,
        notes TEXT,
        document_id UUID,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
);
COMMENT ON TABLE finance_transactions IS 'Transações financeiras (receitas e despesas)';
-- ============================================
-- 4. FINANCE RECEIVABLES (Contas a Receber)
-- ============================================
CREATE TABLE IF NOT EXISTS finance_receivables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    client_id UUID REFERENCES contacts(id) ON DELETE
    SET NULL,
        client_name VARCHAR(255),
        client_document VARCHAR(20),
        case_id UUID REFERENCES cases(id) ON DELETE
    SET NULL,
        description VARCHAR(500) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
        paid_amount DECIMAL(15, 2) DEFAULT 0,
        due_date DATE NOT NULL,
        payment_date DATE,
        payment_method VARCHAR(30),
        category_id UUID REFERENCES finance_categories(id) ON DELETE
    SET NULL,
        recurrence_type VARCHAR(20) DEFAULT 'ONCE' CHECK (
            recurrence_type IN ('ONCE', 'WEEKLY', 'MONTHLY', 'YEARLY')
        ),
        status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (
            status IN (
                'PENDING',
                'PARTIAL',
                'PAID',
                'OVERDUE',
                'CANCELLED'
            )
        ),
        notes TEXT,
        invoice_id UUID,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
);
COMMENT ON TABLE finance_receivables IS 'Contas a receber (honorários, consultorias)';
-- ============================================
-- 5. FINANCE PAYABLES (Contas a Pagar)
-- ============================================
CREATE TABLE IF NOT EXISTS finance_payables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    supplier_name VARCHAR(255) NOT NULL,
    supplier_document VARCHAR(20),
    description VARCHAR(500) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    paid_amount DECIMAL(15, 2) DEFAULT 0,
    due_date DATE NOT NULL,
    payment_date DATE,
    payment_method VARCHAR(30),
    category_id UUID REFERENCES finance_categories(id) ON DELETE
    SET NULL,
        recurrence_type VARCHAR(20) DEFAULT 'ONCE' CHECK (
            recurrence_type IN ('ONCE', 'WEEKLY', 'MONTHLY', 'YEARLY')
        ),
        status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (
            status IN (
                'PENDING',
                'PARTIAL',
                'PAID',
                'OVERDUE',
                'CANCELLED'
            )
        ),
        notes TEXT,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
);
COMMENT ON TABLE finance_payables IS 'Contas a pagar (despesas, fornecedores)';
-- ============================================
-- 6. FINANCE INVOICES (Notas Fiscais)
-- ============================================
CREATE TABLE IF NOT EXISTS finance_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    receivable_id UUID REFERENCES finance_receivables(id) ON DELETE
    SET NULL,
        invoice_number VARCHAR(50) NOT NULL,
        issue_date DATE NOT NULL,
        client_name VARCHAR(255) NOT NULL,
        client_document VARCHAR(20),
        amount DECIMAL(15, 2) NOT NULL,
        tax_amount DECIMAL(15, 2) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'ISSUED' CHECK (status IN ('DRAFT', 'ISSUED', 'CANCELLED')),
        pdf_url TEXT,
        xml_url TEXT,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(tenant_id, invoice_number)
);
COMMENT ON TABLE finance_invoices IS 'Notas fiscais emitidas';
-- ============================================
-- 7. FINANCE AUDIT LOG
-- ============================================
CREATE TABLE IF NOT EXISTS finance_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (
        action IN (
            'CREATE',
            'UPDATE',
            'DELETE',
            'PAYMENT',
            'CANCEL'
        )
    ),
    actor_id UUID REFERENCES users(id),
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
COMMENT ON TABLE finance_audit_log IS 'Log de auditoria para operações financeiras';
-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_finance_categories_tenant ON finance_categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finance_accounts_tenant ON finance_accounts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finance_accounts_active ON finance_accounts(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_tenant ON finance_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_date ON finance_transactions(tenant_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_type ON finance_transactions(tenant_id, type);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_account ON finance_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_category ON finance_transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_finance_receivables_tenant ON finance_receivables(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finance_receivables_status ON finance_receivables(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_finance_receivables_due ON finance_receivables(tenant_id, due_date);
CREATE INDEX IF NOT EXISTS idx_finance_payables_tenant ON finance_payables(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finance_payables_status ON finance_payables(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_finance_payables_due ON finance_payables(tenant_id, due_date);
CREATE INDEX IF NOT EXISTS idx_finance_audit_entity ON finance_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_finance_audit_tenant ON finance_audit_log(tenant_id, created_at DESC);
-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE finance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_receivables ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_payables ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_audit_log ENABLE ROW LEVEL SECURITY;
-- RLS Policies for finance_categories
CREATE POLICY "Tenant isolation for finance_categories" ON finance_categories FOR ALL USING (
    tenant_id = (auth.jwt()->>'tenant_id')::UUID
);
-- RLS Policies for finance_accounts
CREATE POLICY "Tenant isolation for finance_accounts" ON finance_accounts FOR ALL USING (
    tenant_id = (auth.jwt()->>'tenant_id')::UUID
);
-- RLS Policies for finance_transactions
CREATE POLICY "Tenant isolation for finance_transactions" ON finance_transactions FOR ALL USING (
    tenant_id = (auth.jwt()->>'tenant_id')::UUID
);
-- RLS Policies for finance_receivables
CREATE POLICY "Tenant isolation for finance_receivables" ON finance_receivables FOR ALL USING (
    tenant_id = (auth.jwt()->>'tenant_id')::UUID
);
-- RLS Policies for finance_payables
CREATE POLICY "Tenant isolation for finance_payables" ON finance_payables FOR ALL USING (
    tenant_id = (auth.jwt()->>'tenant_id')::UUID
);
-- RLS Policies for finance_invoices
CREATE POLICY "Tenant isolation for finance_invoices" ON finance_invoices FOR ALL USING (
    tenant_id = (auth.jwt()->>'tenant_id')::UUID
);
-- RLS Policies for finance_audit_log
CREATE POLICY "Tenant isolation for finance_audit_log" ON finance_audit_log FOR ALL USING (
    tenant_id = (auth.jwt()->>'tenant_id')::UUID
);
-- ============================================
-- TRIGGERS FOR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_finance_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_finance_categories_updated BEFORE
UPDATE ON finance_categories FOR EACH ROW EXECUTE FUNCTION update_finance_updated_at();
CREATE TRIGGER trg_finance_accounts_updated BEFORE
UPDATE ON finance_accounts FOR EACH ROW EXECUTE FUNCTION update_finance_updated_at();
CREATE TRIGGER trg_finance_transactions_updated BEFORE
UPDATE ON finance_transactions FOR EACH ROW EXECUTE FUNCTION update_finance_updated_at();
CREATE TRIGGER trg_finance_receivables_updated BEFORE
UPDATE ON finance_receivables FOR EACH ROW EXECUTE FUNCTION update_finance_updated_at();
CREATE TRIGGER trg_finance_payables_updated BEFORE
UPDATE ON finance_payables FOR EACH ROW EXECUTE FUNCTION update_finance_updated_at();
CREATE TRIGGER trg_finance_invoices_updated BEFORE
UPDATE ON finance_invoices FOR EACH ROW EXECUTE FUNCTION update_finance_updated_at();
-- ============================================
-- DEFAULT CATEGORIES SEED (Optional)
-- ============================================
-- INSERT INTO finance_categories (tenant_id, name, type, color, icon, is_system) VALUES
-- ('your-tenant-id', 'Honorários Advocatícios', 'INCOME', '#10B981', 'IconScale', true),
-- ('your-tenant-id', 'Consultoria Jurídica', 'INCOME', '#3B82F6', 'IconBriefcase', true),
-- ('your-tenant-id', 'Custas Processuais', 'EXPENSE', '#EF4444', 'IconReceipt', true),
-- ('your-tenant-id', 'Salários', 'EXPENSE', '#F59E0B', 'IconUsers', true);