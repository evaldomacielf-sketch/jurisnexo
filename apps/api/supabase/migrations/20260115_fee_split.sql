-- MIGRATION 002: FEE SPLIT (Divisão de Honorários)
-- Author: Programador Full-Stack Expert
-- Date: 2026-01-15
-- Description: Sistema completo de divisão de honorários entre advogados
-- 
-- Tabela de Regras de Divisão
CREATE TABLE IF NOT EXISTS fee_split_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    split_type VARCHAR(50) NOT NULL CHECK (
        split_type IN ('percentage', 'fixed', 'progressive')
    ),
    is_automatic BOOLEAN NOT NULL DEFAULT false,
    configuration JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_by UUID,
    -- Constraints
    CONSTRAINT uq_fee_split_rule_name UNIQUE (tenant_id, name)
);
-- Índices
CREATE INDEX IF NOT EXISTS idx_fee_split_rules_tenant ON fee_split_rules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fee_split_rules_type ON fee_split_rules(split_type);
CREATE INDEX IF NOT EXISTS idx_fee_split_rules_active ON fee_split_rules(is_active);
-- Comentários
COMMENT ON TABLE fee_split_rules IS 'Regras de divisão de honorários entre advogados';
COMMENT ON COLUMN fee_split_rules.split_type IS 'percentage: divisão por %, fixed: valor fixo, progressive: escalonado';
COMMENT ON COLUMN fee_split_rules.configuration IS 'JSON com detalhes da regra: {"splits": [{"lawyer_id": "uuid", "percentage": 60}]}';
COMMENT ON COLUMN fee_split_rules.is_automatic IS 'Se aplica automaticamente ou requer aprovação manual';
-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS update_fee_split_rules_updated_at ON fee_split_rules;
CREATE TRIGGER update_fee_split_rules_updated_at BEFORE
UPDATE ON fee_split_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Tabela de Transações de Divisão
CREATE TABLE IF NOT EXISTS fee_split_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    rule_id UUID NOT NULL,
    fee_transaction_id UUID NOT NULL,
    total_amount DECIMAL(18, 2) NOT NULL CHECK (total_amount > 0),
    split_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'calculated',
            'approved',
            'rejected',
            'paid'
        )
    ),
    splits JSONB NOT NULL,
    approved_at TIMESTAMPTZ,
    approved_by UUID,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL,
    -- Foreign Keys
    CONSTRAINT fk_fee_split_rule FOREIGN KEY (rule_id) REFERENCES fee_split_rules(id) ON DELETE RESTRICT,
    CONSTRAINT fk_fee_transaction FOREIGN KEY (fee_transaction_id) REFERENCES finance_transactions(id) ON DELETE CASCADE
);
-- Índices
CREATE INDEX IF NOT EXISTS idx_fee_split_trans_tenant ON fee_split_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fee_split_trans_rule ON fee_split_transactions(rule_id);
CREATE INDEX IF NOT EXISTS idx_fee_split_trans_status ON fee_split_transactions(status);
CREATE INDEX IF NOT EXISTS idx_fee_split_trans_date ON fee_split_transactions(split_date);
-- Comentários
COMMENT ON TABLE fee_split_transactions IS 'Transações de divisão de honorários executadas';
COMMENT ON COLUMN fee_split_transactions.splits IS 'Array JSON com splits: [{"lawyer_id":"uuid","amount":1500,"percentage":60}]';
-- Trigger updated_at
DROP TRIGGER IF EXISTS update_fee_split_transactions_updated_at ON fee_split_transactions;
CREATE TRIGGER update_fee_split_transactions_updated_at BEFORE
UPDATE ON fee_split_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ===== ROW LEVEL SECURITY =====
-- fee_split_rules
ALTER TABLE fee_split_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS fee_split_rules_select ON fee_split_rules;
CREATE POLICY fee_split_rules_select ON fee_split_rules FOR
SELECT USING (tenant_id = (auth.jwt()->>'tenant_id')::uuid);
DROP POLICY IF EXISTS fee_split_rules_insert ON fee_split_rules;
CREATE POLICY fee_split_rules_insert ON fee_split_rules FOR
INSERT WITH CHECK (tenant_id = (auth.jwt()->>'tenant_id')::uuid);
DROP POLICY IF EXISTS fee_split_rules_update ON fee_split_rules;
CREATE POLICY fee_split_rules_update ON fee_split_rules FOR
UPDATE USING (tenant_id = (auth.jwt()->>'tenant_id')::uuid);
DROP POLICY IF EXISTS fee_split_rules_delete ON fee_split_rules;
CREATE POLICY fee_split_rules_delete ON fee_split_rules FOR DELETE USING (tenant_id = (auth.jwt()->>'tenant_id')::uuid);
-- fee_split_transactions
ALTER TABLE fee_split_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS fee_split_transactions_select ON fee_split_transactions;
CREATE POLICY fee_split_transactions_select ON fee_split_transactions FOR
SELECT USING (tenant_id = (auth.jwt()->>'tenant_id')::uuid);
DROP POLICY IF EXISTS fee_split_transactions_insert ON fee_split_transactions;
CREATE POLICY fee_split_transactions_insert ON fee_split_transactions FOR
INSERT WITH CHECK (tenant_id = (auth.jwt()->>'tenant_id')::uuid);
DROP POLICY IF EXISTS fee_split_transactions_update ON fee_split_transactions;
CREATE POLICY fee_split_transactions_update ON fee_split_transactions FOR
UPDATE USING (tenant_id = (auth.jwt()->>'tenant_id')::uuid);
DROP POLICY IF EXISTS fee_split_transactions_delete ON fee_split_transactions;
CREATE POLICY fee_split_transactions_delete ON fee_split_transactions FOR DELETE USING (tenant_id = (auth.jwt()->>'tenant_id')::uuid);
-- ===== FUNÇÃO: CALCULAR SPLITS AUTOMATICAMENTE =====
CREATE OR REPLACE FUNCTION calculate_fee_splits(p_rule_id UUID, p_total_amount DECIMAL) RETURNS JSONB AS $$
DECLARE v_rule RECORD;
v_splits JSONB;
v_configuration JSONB;
BEGIN -- Busca a regra
SELECT configuration,
    split_type INTO v_rule
FROM fee_split_rules
WHERE id = p_rule_id;
v_configuration := v_rule.configuration;
-- Calcula splits baseado no tipo
IF v_rule.split_type = 'percentage' THEN -- Divisão por porcentagem
SELECT jsonb_agg(
        jsonb_build_object(
            'lawyer_id',
            item->>'lawyer_id',
            'lawyer_name',
            item->>'lawyer_name',
            'percentage',
            (item->>'percentage')::decimal,
            'amount',
            ROUND(
                (p_total_amount * (item->>'percentage')::decimal) / 100,
                2
            ),
            'status',
            'pending'
        )
    ) INTO v_splits
FROM jsonb_array_elements(v_configuration->'splits') AS item;
ELSIF v_rule.split_type = 'fixed' THEN -- Valor fixo
SELECT jsonb_agg(
        jsonb_build_object(
            'lawyer_id',
            item->>'lawyer_id',
            'lawyer_name',
            item->>'lawyer_name',
            'amount',
            (item->>'amount')::decimal,
            'percentage',
            ROUND(
                ((item->>'amount')::decimal / p_total_amount) * 100,
                2
            ),
            'status',
            'pending'
        )
    ) INTO v_splits
FROM jsonb_array_elements(v_configuration->'splits') AS item;
ELSIF v_rule.split_type = 'progressive' THEN -- Escalonado (implementação simplificada)
-- TODO: Implementar lógica de tiers progressivos
v_splits := '[]'::jsonb;
END IF;
RETURN v_splits;
END;
$$ LANGUAGE plpgsql;
-- ===== VIEW: EXTRATO DE HONORÁRIOS POR ADVOGADO =====
CREATE OR REPLACE VIEW v_lawyer_fee_extract AS
SELECT fst.tenant_id,
    split_item->>'lawyer_id' AS lawyer_id,
    split_item->>'lawyer_name' AS lawyer_name,
    fst.split_date,
    fst.total_amount,
    (split_item->>'amount')::decimal AS split_amount,
    (split_item->>'percentage')::decimal AS split_percentage,
    fst.status,
    fst.approved_at,
    ft.description AS case_description
FROM fee_split_transactions fst
    CROSS JOIN LATERAL jsonb_array_elements(fst.splits) AS split_item
    JOIN finance_transactions ft ON fst.fee_transaction_id = ft.id
ORDER BY fst.split_date DESC;