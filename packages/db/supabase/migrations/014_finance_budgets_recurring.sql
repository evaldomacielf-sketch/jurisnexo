-- =============================================
-- FINANCE MODULE - ADDITIONAL TABLES
-- Migration: 014_finance_budgets_recurring.sql
-- =============================================
-- =============================================
-- ENUM TYPES
-- =============================================
-- Recurrence frequency
DO $$ BEGIN CREATE TYPE finance_recurrence_frequency AS ENUM (
    'DAILY',
    'WEEKLY',
    'BIWEEKLY',
    'MONTHLY',
    'QUARTERLY',
    'YEARLY'
);
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
-- Transaction type
DO $$ BEGIN CREATE TYPE finance_transaction_type AS ENUM ('INCOME', 'EXPENSE');
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
-- =============================================
-- FINANCE BUDGETS TABLE
-- Orçamentos por categoria
-- =============================================
CREATE TABLE IF NOT EXISTS finance_budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES finance_categories(id) ON DELETE
    SET NULL,
        name VARCHAR(255) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL CHECK (amount >= 0),
        spent_amount DECIMAL(15, 2) DEFAULT 0 CHECK (spent_amount >= 0),
        period_start DATE NOT NULL,
        period_end DATE NOT NULL,
        year INTEGER NOT NULL,
        month INTEGER CHECK (
            month >= 1
            AND month <= 12
        ),
        alert_threshold DECIMAL(5, 2) DEFAULT 80.00,
        -- % para alertar quando atingir
        is_active BOOLEAN DEFAULT true,
        notes TEXT,
        created_by UUID,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT valid_period CHECK (period_end >= period_start)
);
-- =============================================
-- FINANCE RECURRING TRANSACTIONS TABLE
-- Transações recorrentes (assinaturas, aluguel, etc.)
-- =============================================
CREATE TABLE IF NOT EXISTS finance_recurring_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    account_id UUID REFERENCES finance_accounts(id) ON DELETE
    SET NULL,
        category_id UUID REFERENCES finance_categories(id) ON DELETE
    SET NULL,
        type finance_transaction_type NOT NULL,
        description VARCHAR(500) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
        frequency finance_recurrence_frequency NOT NULL DEFAULT 'MONTHLY',
        start_date DATE NOT NULL,
        end_date DATE,
        -- NULL = indefinido
        next_due_date DATE NOT NULL,
        last_generated_date DATE,
        day_of_month INTEGER CHECK (
            day_of_month >= 1
            AND day_of_month <= 31
        ),
        auto_confirm BOOLEAN DEFAULT false,
        -- Auto-confirmar quando gerar
        is_active BOOLEAN DEFAULT true,
        notes TEXT,
        created_by UUID,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- =============================================
-- FINANCE TRANSACTIONS TABLE (Generic)
-- Tabela genérica de lançamentos
-- =============================================
CREATE TABLE IF NOT EXISTS finance_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    account_id UUID REFERENCES finance_accounts(id) ON DELETE
    SET NULL,
        category_id UUID REFERENCES finance_categories(id) ON DELETE
    SET NULL,
        recurring_id UUID REFERENCES finance_recurring_transactions(id) ON DELETE
    SET NULL,
        receivable_id UUID REFERENCES finance_receivables(id) ON DELETE
    SET NULL,
        payable_id UUID REFERENCES finance_payables(id) ON DELETE
    SET NULL,
        type finance_transaction_type NOT NULL,
        description VARCHAR(500) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
        transaction_date DATE NOT NULL,
        due_date DATE,
        payment_date DATE,
        status finance_payment_status DEFAULT 'PENDING',
        payment_method finance_payment_method,
        reference_number VARCHAR(100),
        notes TEXT,
        tags TEXT [],
        -- Array de tags para filtros
        attachments JSONB DEFAULT '[]',
        created_by UUID,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- =============================================
-- INDEXES
-- =============================================
-- Budgets indexes
CREATE INDEX IF NOT EXISTS idx_finance_budgets_tenant ON finance_budgets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finance_budgets_period ON finance_budgets(year, month);
CREATE INDEX IF NOT EXISTS idx_finance_budgets_category ON finance_budgets(category_id);
CREATE INDEX IF NOT EXISTS idx_finance_budgets_active ON finance_budgets(is_active)
WHERE is_active = true;
-- Recurring transactions indexes
CREATE INDEX IF NOT EXISTS idx_finance_recurring_tenant ON finance_recurring_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finance_recurring_next_due ON finance_recurring_transactions(next_due_date);
CREATE INDEX IF NOT EXISTS idx_finance_recurring_active ON finance_recurring_transactions(is_active)
WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_finance_recurring_type ON finance_recurring_transactions(type);
-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_finance_transactions_tenant ON finance_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_date ON finance_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_account ON finance_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_category ON finance_transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_type ON finance_transactions(type);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_status ON finance_transactions(status);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_tags ON finance_transactions USING GIN(tags);
-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE finance_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_transactions ENABLE ROW LEVEL SECURITY;
-- Budgets policies
CREATE POLICY "Budgets tenant isolation" ON finance_budgets FOR ALL USING (
    tenant_id IN (
        SELECT m.tenant_id
        FROM memberships m
        WHERE m.user_id = auth.uid()
    )
);
-- Recurring transactions policies
CREATE POLICY "Recurring transactions tenant isolation" ON finance_recurring_transactions FOR ALL USING (
    tenant_id IN (
        SELECT m.tenant_id
        FROM memberships m
        WHERE m.user_id = auth.uid()
    )
);
-- Transactions policies
CREATE POLICY "Transactions tenant isolation" ON finance_transactions FOR ALL USING (
    tenant_id IN (
        SELECT m.tenant_id
        FROM memberships m
        WHERE m.user_id = auth.uid()
    )
);
-- =============================================
-- TRIGGERS
-- =============================================
CREATE TRIGGER update_finance_budgets_updated_at BEFORE
UPDATE ON finance_budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_finance_recurring_updated_at BEFORE
UPDATE ON finance_recurring_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_finance_transactions_updated_at BEFORE
UPDATE ON finance_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- =============================================
-- FUNCTION: Update budget spent amount
-- =============================================
CREATE OR REPLACE FUNCTION update_budget_spent() RETURNS TRIGGER AS $$ BEGIN IF NEW.type = 'EXPENSE'
    AND NEW.category_id IS NOT NULL THEN
UPDATE finance_budgets
SET spent_amount = (
        SELECT COALESCE(SUM(amount), 0)
        FROM finance_transactions
        WHERE category_id = NEW.category_id
            AND type = 'EXPENSE'
            AND status = 'PAID'
            AND transaction_date BETWEEN period_start AND period_end
    )
WHERE category_id = NEW.category_id
    AND tenant_id = NEW.tenant_id
    AND is_active = true
    AND NEW.transaction_date BETWEEN period_start AND period_end;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_update_budget_spent
AFTER
INSERT
    OR
UPDATE ON finance_transactions FOR EACH ROW EXECUTE FUNCTION update_budget_spent();
-- =============================================
-- SEED DATA
-- =============================================
-- Sample categories (if not exists)
INSERT INTO finance_categories (tenant_id, name, entry_type, color, icon)
SELECT t.id,
    category.name,
    category.entry_type,
    category.color,
    category.icon
FROM tenants t
    CROSS JOIN (
        VALUES (
                'Honorários Advocatícios',
                'REVENUE',
                '#22C55E',
                'briefcase'
            ),
            ('Consultorias', 'REVENUE', '#10B981', 'users'),
            (
                'Custas Processuais',
                'EXPENSE',
                '#EF4444',
                'file-text'
            ),
            ('Aluguel', 'EXPENSE', '#F97316', 'home'),
            ('Salários', 'EXPENSE', '#DC2626', 'users'),
            ('Marketing', 'EXPENSE', '#8B5CF6', 'megaphone'),
            (
                'Software/Assinaturas',
                'EXPENSE',
                '#6366F1',
                'laptop'
            ),
            (
                'Material de Escritório',
                'EXPENSE',
                '#EC4899',
                'package'
            )
    ) AS category(name, entry_type, color, icon)
WHERE NOT EXISTS (
        SELECT 1
        FROM finance_categories fc
        WHERE fc.tenant_id = t.id
            AND fc.name = category.name
    )
LIMIT 8;
COMMENT ON TABLE finance_budgets IS 'Orçamentos mensais/anuais por categoria';
COMMENT ON TABLE finance_recurring_transactions IS 'Transações recorrentes como assinaturas e aluguéis';
COMMENT ON TABLE finance_transactions IS 'Histórico de todas as transações financeiras';