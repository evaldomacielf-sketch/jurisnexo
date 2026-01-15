-- MIGRATION 005: FUNÇÕES AUXILIARES COMUNS
-- Author: Programador Full-Stack Expert
-- Date: 2026-01-15
-- Description: Funções utilitárias para todo o módulo financeiro
-- 
-- Função para atualizar updated_at (se não existir)
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- ===== FUNÇÃO: DASHBOARD FINANCEIRO AGREGADO =====
CREATE OR REPLACE FUNCTION get_financial_dashboard(
        p_tenant_id UUID,
        p_start_date DATE,
        p_end_date DATE
    ) RETURNS TABLE(
        total_fees_contracted DECIMAL,
        total_fees_paid DECIMAL,
        total_fees_pending DECIMAL,
        average_profit_margin DECIMAL,
        overdue_count INT,
        overdue_amount DECIMAL,
        fees_by_type JSONB,
        top_clients JSONB,
        payment_methods JSONB
    ) AS $$ BEGIN RETURN QUERY WITH fee_stats AS (
        SELECT SUM(contracted_amount) AS contracted,
            SUM(paid_amount) AS paid,
            SUM(pending_amount) AS pending,
            AVG(profit_margin) AS avg_margin,
            COUNT(*) FILTER (
                WHERE payment_status = 'overdue'
            ) AS overdue_cnt,
            SUM(pending_amount) FILTER (
                WHERE payment_status = 'overdue'
            ) AS overdue_amt
        FROM legal_fees
        WHERE tenant_id = p_tenant_id
            AND created_at BETWEEN p_start_date AND p_end_date
    ),
    fee_types AS (
        SELECT jsonb_object_agg(
                fee_type,
                jsonb_build_object(
                    'count',
                    count,
                    'amount',
                    amount
                )
            ) AS types
        FROM (
                SELECT fee_type,
                    COUNT(*) AS count,
                    SUM(paid_amount) AS amount
                FROM legal_fees
                WHERE tenant_id = p_tenant_id
                    AND created_at BETWEEN p_start_date AND p_end_date
                GROUP BY fee_type
            ) t
    ),
    top_clients_data AS (
        SELECT jsonb_agg(
                jsonb_build_object(
                    'client_id',
                    client_id,
                    'total_paid',
                    total_paid
                )
            ) AS clients
        FROM (
                SELECT client_id,
                    SUM(paid_amount) AS total_paid
                FROM legal_fees
                WHERE tenant_id = p_tenant_id
                    AND created_at BETWEEN p_start_date AND p_end_date
                GROUP BY client_id
                ORDER BY total_paid DESC
                LIMIT 10
            ) c
    ), payment_methods_data AS (
        SELECT jsonb_object_agg(
                payment_method,
                count
            ) AS methods
        FROM (
                SELECT payment_method,
                    COUNT(*) AS count
                FROM legal_fee_payments
                WHERE tenant_id = p_tenant_id
                    AND payment_date BETWEEN p_start_date AND p_end_date
                    AND status = 'confirmed'
                GROUP BY payment_method
            ) p
    )
SELECT fs.contracted,
    fs.paid,
    fs.pending,
    fs.avg_margin,
    fs.overdue_cnt::int,
    fs.overdue_amt,
    ft.types,
    tc.clients,
    pm.methods
FROM fee_stats fs
    CROSS JOIN fee_types ft
    CROSS JOIN top_clients_data tc
    CROSS JOIN payment_methods_data pm;
END;
$$ LANGUAGE plpgsql;
-- ===== ÍNDICES COMPOSTOS PARA PERFORMANCE =====
-- Índice composto para queries de IR por período
CREATE INDEX IF NOT EXISTS idx_ir_cash_book_tenant_competence ON ir_cash_book(tenant_id, fiscal_competence);
-- Índice composto para extrato de fee split
CREATE INDEX IF NOT EXISTS idx_fee_split_trans_tenant_date ON fee_split_transactions(tenant_id, split_date);
-- Índice composto para honorários por status e data
CREATE INDEX IF NOT EXISTS idx_legal_fees_tenant_status_due ON legal_fees(tenant_id, payment_status, due_date);
-- Índice composto para checkouts ativos
CREATE INDEX IF NOT EXISTS idx_payment_checkouts_status_expires ON payment_checkouts(status, expires_at)
WHERE status = 'active';
-- ===== SCRIPT DE SEED: CATEGORIAS FISCAIS PADRÃO =====
-- Criação de tabela de categorias fiscais pré-definidas
CREATE TABLE IF NOT EXISTS fiscal_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    is_deductible BOOLEAN NOT NULL DEFAULT false,
    default_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0,
    description TEXT
);
INSERT INTO fiscal_categories (
        name,
        is_deductible,
        default_percentage,
        description
    )
VALUES (
        'Honorários Advocatícios',
        false,
        0,
        'Receita de honorários não é dedutível'
    ),
    (
        'Aluguel de Escritório',
        true,
        100,
        'Aluguel do local de trabalho é 100% dedutível'
    ),
    (
        'Água',
        true,
        50,
        'Água residencial com uso parcial para escritório: 50% dedutível'
    ),
    (
        'Luz',
        true,
        50,
        'Energia elétrica residencial com uso parcial: 50% dedutível'
    ),
    (
        'Telefone',
        true,
        50,
        'Telefonia residencial com uso parcial: 50% dedutível'
    ),
    (
        'Internet',
        true,
        50,
        'Internet residencial com uso parcial: 50% dedutível'
    ),
    (
        'Material de Escritório',
        true,
        100,
        'Papéis, canetas, etc: 100% dedutível'
    ),
    (
        'Software e Tecnologia',
        true,
        100,
        'Licenças de software profissional: 100% dedutível'
    ),
    (
        'Combustível',
        true,
        50,
        'Combustível para deslocamentos profissionais: 50% dedutível'
    ),
    (
        'Manutenção Veículo',
        true,
        50,
        'Manutenção de veículo usado para trabalho: 50% dedutível'
    ),
    (
        'Contador',
        true,
        100,
        'Honorários contábeis: 100% dedutível'
    ),
    (
        'Seguro Profissional',
        true,
        100,
        'Seguro de responsabilidade civil: 100% dedutível'
    ),
    (
        'Cursos e Treinamentos',
        true,
        100,
        'Capacitação profissional: 100% dedutível'
    ),
    (
        'Livros Técnicos',
        true,
        100,
        'Literatura jurídica: 100% dedutível'
    ),
    (
        'Custas Processuais',
        true,
        100,
        'Taxas e custas judiciais: 100% dedutível'
    ) ON CONFLICT (name) DO NOTHING;
COMMENT ON TABLE fiscal_categories IS 'Categorias fiscais pré-definidas conforme legislação do IR';