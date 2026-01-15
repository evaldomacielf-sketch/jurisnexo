-- MIGRATION 003: LEGAL FEES (Gestão Completa de Honorários)
-- Author: Programador Full-Stack Expert
-- Date: 2026-01-15
-- Description: Gestão de honorários vinculados a casos com análise de lucratividade
-- 
-- Tabela de Honorários Legais
CREATE TABLE IF NOT EXISTS legal_fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    case_id UUID,
    client_id UUID NOT NULL,
    description VARCHAR(200) NOT NULL,
    fee_type VARCHAR(50) NOT NULL CHECK (
        fee_type IN (
            'hourly',
            'fixed',
            'contingency',
            'success_fee',
            'retainer'
        )
    ),
    contracted_amount DECIMAL(18, 2) NOT NULL CHECK (contracted_amount >= 0),
    paid_amount DECIMAL(18, 2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
    pending_amount DECIMAL(18, 2) NOT NULL DEFAULT 0 CHECK (pending_amount >= 0),
    case_costs DECIMAL(18, 2) NOT NULL DEFAULT 0 CHECK (case_costs >= 0),
    net_profit DECIMAL(18, 2) NOT NULL DEFAULT 0,
    profit_margin DECIMAL(5, 2) NOT NULL DEFAULT 0,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (
        payment_status IN (
            'pending',
            'partial_paid',
            'paid',
            'overdue',
            'cancelled'
        )
    ),
    due_date DATE,
    settlement_date DATE,
    payment_configuration JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_by UUID
);
-- Índices
CREATE INDEX IF NOT EXISTS idx_legal_fees_tenant ON legal_fees(tenant_id);
CREATE INDEX IF NOT EXISTS idx_legal_fees_case ON legal_fees(case_id);
CREATE INDEX IF NOT EXISTS idx_legal_fees_client ON legal_fees(client_id);
CREATE INDEX IF NOT EXISTS idx_legal_fees_status ON legal_fees(payment_status);
CREATE INDEX IF NOT EXISTS idx_legal_fees_due_date ON legal_fees(due_date);
CREATE INDEX IF NOT EXISTS idx_legal_fees_type ON legal_fees(fee_type);
-- Comentários
COMMENT ON TABLE legal_fees IS 'Honorários advocatícios vinculados a casos/clientes';
COMMENT ON COLUMN legal_fees.fee_type IS 'hourly: por hora, fixed: fixo, contingency: êxito, success_fee: taxa sucesso, retainer: retenção';
COMMENT ON COLUMN legal_fees.contracted_amount IS 'Valor total contratado com o cliente';
COMMENT ON COLUMN legal_fees.paid_amount IS 'Valor já pago pelo cliente';
COMMENT ON COLUMN legal_fees.case_costs IS 'Custos do caso (despesas, custas processuais)';
COMMENT ON COLUMN legal_fees.net_profit IS 'Lucro líquido (paid_amount - case_costs)';
COMMENT ON COLUMN legal_fees.profit_margin IS 'Margem de lucro em porcentagem';
-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS update_legal_fees_updated_at ON legal_fees;
CREATE TRIGGER update_legal_fees_updated_at BEFORE
UPDATE ON legal_fees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Tabela de Pagamentos de Honorários
CREATE TABLE IF NOT EXISTS legal_fee_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    legal_fee_id UUID NOT NULL,
    amount DECIMAL(18, 2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(50) NOT NULL CHECK (
        payment_method IN (
            'pix',
            'credit_card',
            'debit_card',
            'boleto',
            'bank_transfer',
            'cash',
            'check'
        )
    ),
    payment_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'confirmed', 'failed', 'refunded')
    ),
    gateway_transaction_id VARCHAR(200),
    gateway VARCHAR(50) CHECK (
        gateway IN ('stripe', 'asaas', 'mercadopago', 'pagseguro')
    ),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Foreign Keys
    CONSTRAINT fk_legal_fee FOREIGN KEY (legal_fee_id) REFERENCES legal_fees(id) ON DELETE CASCADE
);
-- Índices
CREATE INDEX IF NOT EXISTS idx_legal_fee_payments_tenant ON legal_fee_payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_legal_fee_payments_fee ON legal_fee_payments(legal_fee_id);
CREATE INDEX IF NOT EXISTS idx_legal_fee_payments_status ON legal_fee_payments(status);
CREATE INDEX IF NOT EXISTS idx_legal_fee_payments_date ON legal_fee_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_legal_fee_payments_gateway ON legal_fee_payments(gateway, gateway_transaction_id);
-- Trigger updated_at
DROP TRIGGER IF EXISTS update_legal_fee_payments_updated_at ON legal_fee_payments;
CREATE TRIGGER update_legal_fee_payments_updated_at BEFORE
UPDATE ON legal_fee_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ===== ROW LEVEL SECURITY =====
-- legal_fees
ALTER TABLE legal_fees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS legal_fees_select ON legal_fees;
CREATE POLICY legal_fees_select ON legal_fees FOR
SELECT USING (tenant_id = (auth.jwt()->>'tenant_id')::uuid);
DROP POLICY IF EXISTS legal_fees_insert ON legal_fees;
CREATE POLICY legal_fees_insert ON legal_fees FOR
INSERT WITH CHECK (tenant_id = (auth.jwt()->>'tenant_id')::uuid);
DROP POLICY IF EXISTS legal_fees_update ON legal_fees;
CREATE POLICY legal_fees_update ON legal_fees FOR
UPDATE USING (tenant_id = (auth.jwt()->>'tenant_id')::uuid);
DROP POLICY IF EXISTS legal_fees_delete ON legal_fees;
CREATE POLICY legal_fees_delete ON legal_fees FOR DELETE USING (tenant_id = (auth.jwt()->>'tenant_id')::uuid);
-- legal_fee_payments
ALTER TABLE legal_fee_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS legal_fee_payments_select ON legal_fee_payments;
CREATE POLICY legal_fee_payments_select ON legal_fee_payments FOR
SELECT USING (tenant_id = (auth.jwt()->>'tenant_id')::uuid);
DROP POLICY IF EXISTS legal_fee_payments_insert ON legal_fee_payments;
CREATE POLICY legal_fee_payments_insert ON legal_fee_payments FOR
INSERT WITH CHECK (tenant_id = (auth.jwt()->>'tenant_id')::uuid);
DROP POLICY IF EXISTS legal_fee_payments_update ON legal_fee_payments;
CREATE POLICY legal_fee_payments_update ON legal_fee_payments FOR
UPDATE USING (tenant_id = (auth.jwt()->>'tenant_id')::uuid);
DROP POLICY IF EXISTS legal_fee_payments_delete ON legal_fee_payments;
CREATE POLICY legal_fee_payments_delete ON legal_fee_payments FOR DELETE USING (tenant_id = (auth.jwt()->>'tenant_id')::uuid);
-- ===== FUNÇÃO: ATUALIZAR VALORES AUTOMATICAMENTE =====
CREATE OR REPLACE FUNCTION update_legal_fee_amounts() RETURNS TRIGGER AS $$ BEGIN -- Recalcula pending_amount
    NEW.pending_amount := NEW.contracted_amount - NEW.paid_amount;
-- Calcula net_profit
NEW.net_profit := NEW.paid_amount - NEW.case_costs;
-- Calcula profit_margin
IF NEW.paid_amount > 0 THEN NEW.profit_margin := ROUND((NEW.net_profit / NEW.paid_amount) * 100, 2);
ELSE NEW.profit_margin := 0;
END IF;
-- Atualiza payment_status
IF NEW.paid_amount = 0 THEN NEW.payment_status := 'pending';
ELSIF NEW.paid_amount < NEW.contracted_amount THEN NEW.payment_status := 'partial_paid';
ELSIF NEW.paid_amount >= NEW.contracted_amount THEN NEW.payment_status := 'paid';
NEW.settlement_date := CURRENT_DATE;
END IF;
-- Verifica se está atrasado
IF NEW.due_date < CURRENT_DATE
AND NEW.payment_status != 'paid' THEN NEW.payment_status := 'overdue';
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trigger_update_legal_fee_amounts ON legal_fees;
CREATE TRIGGER trigger_update_legal_fee_amounts BEFORE
INSERT
    OR
UPDATE ON legal_fees FOR EACH ROW EXECUTE FUNCTION update_legal_fee_amounts();
-- ===== TRIGGER: ATUALIZAR HONORÁRIO APÓS PAGAMENTO =====
CREATE OR REPLACE FUNCTION update_legal_fee_on_payment() RETURNS TRIGGER AS $$ BEGIN -- Atualiza o valor pago no honorário
    IF NEW.status = 'confirmed' THEN
UPDATE legal_fees
SET paid_amount = paid_amount + NEW.amount,
    updated_at = NOW()
WHERE id = NEW.legal_fee_id;
END IF;
-- Se pagamento foi estornado, remove valor
IF TG_OP = 'UPDATE'
AND OLD.status = 'confirmed'
AND NEW.status = 'refunded' THEN
UPDATE legal_fees
SET paid_amount = paid_amount - NEW.amount,
    updated_at = NOW()
WHERE id = NEW.legal_fee_id;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trigger_update_legal_fee_on_payment ON legal_fee_payments;
CREATE TRIGGER trigger_update_legal_fee_on_payment
AFTER
INSERT
    OR
UPDATE ON legal_fee_payments FOR EACH ROW EXECUTE FUNCTION update_legal_fee_on_payment();
-- ===== VIEW: ANÁLISE DE LUCRATIVIDADE =====
CREATE OR REPLACE VIEW v_legal_fee_profitability AS
SELECT lf.id,
    lf.tenant_id,
    lf.description,
    lf.client_id,
    lf.case_id,
    lf.fee_type,
    lf.contracted_amount,
    lf.paid_amount,
    lf.case_costs,
    lf.net_profit,
    lf.profit_margin,
    lf.payment_status,
    lf.due_date,
    CASE
        WHEN lf.due_date < CURRENT_DATE
        AND lf.payment_status != 'paid' THEN (CURRENT_DATE - lf.due_date)::int
        ELSE 0
    END AS days_overdue,
    COUNT(lfp.id) AS payment_count,
    lf.created_at,
    lf.settlement_date
FROM legal_fees lf
    LEFT JOIN legal_fee_payments lfp ON lf.id = lfp.legal_fee_id
    AND lfp.status = 'confirmed'
GROUP BY lf.id;