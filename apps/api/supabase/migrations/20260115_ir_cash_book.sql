-- MIGRATION 001: IR CASH BOOK (Livro Caixa Digital)
-- Author: Programador Full-Stack Expert
-- Date: 2026-01-15
-- Description: Cria tabela para gestão de livro caixa com foco em IR
-- Tabela principal
CREATE TABLE IF NOT EXISTS ir_cash_book (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    transaction_id UUID NOT NULL,
    fiscal_category VARCHAR(100) NOT NULL,
    is_deductible BOOLEAN NOT NULL DEFAULT false,
    deductible_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0 CHECK (
        deductible_percentage >= 0
        AND deductible_percentage <= 100
    ),
    deductible_amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
    fiscal_competence DATE NOT NULL,
    notes TEXT,
    proof_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_by UUID,
    -- Foreign Keys
    CONSTRAINT fk_ir_transaction FOREIGN KEY (transaction_id) REFERENCES finance_transactions(id) ON DELETE CASCADE
);
-- Indexes
CREATE INDEX IF NOT EXISTS idx_ir_tenant_id ON ir_cash_book(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ir_fiscal_competence ON ir_cash_book(fiscal_competence);
CREATE INDEX IF NOT EXISTS idx_ir_fiscal_category ON ir_cash_book(fiscal_category);
CREATE INDEX IF NOT EXISTS idx_ir_is_deductible ON ir_cash_book(is_deductible);
-- Comentários na tabela
COMMENT ON TABLE ir_cash_book IS 'Livro Caixa Digital com categorização fiscal para Imposto de Renda';
COMMENT ON COLUMN ir_cash_book.fiscal_category IS 'Categoria fiscal: honorários, aluguel, água, luz, telefone, internet, material, software, etc';
COMMENT ON COLUMN ir_cash_book.is_deductible IS 'Se a despesa é dedutível no IR (Lei 9.250/95)';
COMMENT ON COLUMN ir_cash_book.deductible_percentage IS 'Percentual dedutível conforme legislação';
COMMENT ON COLUMN ir_cash_book.fiscal_competence IS 'Mês/ano de competência fiscal para o IR';
-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS update_ir_cash_book_updated_at ON ir_cash_book;
CREATE TRIGGER update_ir_cash_book_updated_at BEFORE
UPDATE ON ir_cash_book FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ===== ROW LEVEL SECURITY (RLS) =====
ALTER TABLE ir_cash_book ENABLE ROW LEVEL SECURITY;
-- Política SELECT: usuários podem ver apenas dados do seu tenant
DROP POLICY IF EXISTS ir_cash_book_select_policy ON ir_cash_book;
CREATE POLICY ir_cash_book_select_policy ON ir_cash_book FOR
SELECT USING (tenant_id = (auth.jwt()->>'tenant_id')::uuid);
-- Política INSERT: usuários podem inserir apenas no seu tenant
DROP POLICY IF EXISTS ir_cash_book_insert_policy ON ir_cash_book;
CREATE POLICY ir_cash_book_insert_policy ON ir_cash_book FOR
INSERT WITH CHECK (tenant_id = (auth.jwt()->>'tenant_id')::uuid);
-- Política UPDATE: usuários podem atualizar apenas dados do seu tenant
DROP POLICY IF EXISTS ir_cash_book_update_policy ON ir_cash_book;
CREATE POLICY ir_cash_book_update_policy ON ir_cash_book FOR
UPDATE USING (tenant_id = (auth.jwt()->>'tenant_id')::uuid) WITH CHECK (tenant_id = (auth.jwt()->>'tenant_id')::uuid);
-- Política DELETE: usuários podem deletar apenas dados do seu tenant
DROP POLICY IF EXISTS ir_cash_book_delete_policy ON ir_cash_book;
CREATE POLICY ir_cash_book_delete_policy ON ir_cash_book FOR DELETE USING (tenant_id = (auth.jwt()->>'tenant_id')::uuid);
-- ===== VIEW: RELATÓRIO ANUAL DE IR =====
CREATE OR REPLACE VIEW v_ir_annual_report AS
SELECT icb.tenant_id,
    EXTRACT(
        YEAR
        FROM fiscal_competence
    ) AS year,
    EXTRACT(
        MONTH
        FROM fiscal_competence
    ) AS month,
    fiscal_category,
    COUNT(*) AS transaction_count,
    SUM(
        CASE
            WHEN t.type = 'income' THEN t.amount
            ELSE 0
        END
    ) AS total_income,
    SUM(
        CASE
            WHEN t.type = 'expense' THEN t.amount
            ELSE 0
        END
    ) AS total_expenses,
    SUM(
        CASE
            WHEN is_deductible = true THEN deductible_amount
            ELSE 0
        END
    ) AS total_deductible
FROM ir_cash_book icb
    JOIN finance_transactions t ON icb.transaction_id = t.id
GROUP BY icb.tenant_id,
    EXTRACT(
        YEAR
        FROM fiscal_competence
    ),
    EXTRACT(
        MONTH
        FROM fiscal_competence
    ),
    fiscal_category;
-- ===== FUNÇÃO: CALCULAR VALOR DEDUTÍVEL AUTOMATICAMENTE =====
CREATE OR REPLACE FUNCTION calculate_deductible_amount() RETURNS TRIGGER AS $$ BEGIN -- Busca o valor da transação
SELECT amount INTO NEW.deductible_amount
FROM finance_transactions
WHERE id = NEW.transaction_id;
-- Calcula o valor dedutível baseado na porcentagem
NEW.deductible_amount := (
    NEW.deductible_amount * NEW.deductible_percentage
) / 100;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trigger_calculate_deductible_amount ON ir_cash_book;
CREATE TRIGGER trigger_calculate_deductible_amount BEFORE
INSERT
    OR
UPDATE ON ir_cash_book FOR EACH ROW EXECUTE FUNCTION calculate_deductible_amount();