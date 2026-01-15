-- Migration: 20260115_finance_budgets.sql
-- Description: Monthly budget planning configuration
-- ============================================
-- BUDGET PLANNING
-- ============================================
CREATE TABLE IF NOT EXISTS finance_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES finance_categories(id) ON DELETE CASCADE,
    year INT NOT NULL,
    month INT NOT NULL CHECK (
        month BETWEEN 1 AND 12
    ),
    planned_amount DECIMAL(15, 2) NOT NULL CHECK (planned_amount >= 0),
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT finance_budgets_unique_period UNIQUE(tenant_id, category_id, year, month)
);
COMMENT ON TABLE finance_budgets IS 'Planejamento orçamentário mensal por categoria';
COMMENT ON COLUMN finance_budgets.planned_amount IS 'Valor planejado para a categoria no mês';
-- Indexes
CREATE INDEX IF NOT EXISTS idx_finance_budgets_tenant ON finance_budgets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finance_budgets_period ON finance_budgets(tenant_id, year, month);
CREATE INDEX IF NOT EXISTS idx_finance_budgets_category ON finance_budgets(category_id);
-- RLS Policies
ALTER TABLE finance_budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation for finance_budgets" ON finance_budgets FOR ALL USING (
    tenant_id = current_setting('app.current_tenant_id')::UUID
);
-- Updated At Trigger
CREATE TRIGGER trg_finance_budgets_updated BEFORE
UPDATE ON finance_budgets FOR EACH ROW EXECUTE FUNCTION update_finance_updated_at();