-- Migration: 20260115_finance_recurring.sql
-- Description: Recurring transactions configuration
-- Create custom types if they don't exist
DO $$ BEGIN CREATE TYPE recurrence_frequency AS ENUM (
    'DAILY',
    'WEEKLY',
    'MONTHLY',
    'QUARTERLY',
    'YEARLY'
);
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
-- ============================================
-- RECURRING TRANSACTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS finance_recurring_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    category_id UUID NOT NULL REFERENCES finance_categories(id) ON DELETE RESTRICT,
    account_id UUID NOT NULL REFERENCES finance_accounts(id) ON DELETE RESTRICT,
    payment_method VARCHAR(30) NOT NULL DEFAULT 'BANK_TRANSFER' CHECK (
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
    frequency recurrence_frequency NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    day_of_month INT CHECK (
        day_of_month BETWEEN 1 AND 31
    ),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_generated_date DATE,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT recurring_transactions_end_after_start CHECK (
        end_date IS NULL
        OR end_date >= start_date
    )
);
COMMENT ON TABLE finance_recurring_transactions IS 'Configurações de transações recorrentes';
COMMENT ON COLUMN finance_recurring_transactions.frequency IS 'Frequência: DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY';
COMMENT ON COLUMN finance_recurring_transactions.day_of_month IS 'Dia do mês para recorrência mensal (1-31)';
-- Indexes
CREATE INDEX IF NOT EXISTS idx_finance_recurring_tenant ON finance_recurring_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finance_recurring_active ON finance_recurring_transactions(is_active);
CREATE INDEX IF NOT EXISTS idx_finance_recurring_frequency ON finance_recurring_transactions(frequency);
CREATE INDEX IF NOT EXISTS idx_finance_recurring_next_run ON finance_recurring_transactions(is_active, last_generated_date);
-- RLS Policies
ALTER TABLE finance_recurring_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation for finance_recurring_transactions" ON finance_recurring_transactions FOR ALL USING (
    tenant_id = current_setting('app.current_tenant_id')::UUID
);
-- Updated At Trigger
CREATE TRIGGER trg_finance_recurring_updated BEFORE
UPDATE ON finance_recurring_transactions FOR EACH ROW EXECUTE FUNCTION update_finance_updated_at();