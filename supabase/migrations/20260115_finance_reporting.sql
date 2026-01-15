-- Migration: 20260115_finance_reporting.sql
-- Description: Helper functions for financial reporting
-- ============================================
-- MONTHLY SUMMARY FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION calculate_monthly_summary(
        p_tenant_id UUID,
        p_year INT,
        p_month INT
    ) RETURNS TABLE (
        total_income DECIMAL(15, 2),
        total_expenses DECIMAL(15, 2),
        balance DECIMAL(15, 2),
        transaction_count BIGINT
    ) AS $$ BEGIN RETURN QUERY WITH monthly_data AS (
        SELECT type,
            SUM(amount) as total,
            COUNT(*) as count
        FROM finance_transactions
        WHERE tenant_id = p_tenant_id
            AND status = 'COMPLETED'
            AND EXTRACT(
                YEAR
                FROM transaction_date
            ) = p_year
            AND EXTRACT(
                MONTH
                FROM transaction_date
            ) = p_month
        GROUP BY type
    )
SELECT COALESCE(
        (
            SELECT total
            FROM monthly_data
            WHERE type = 'INCOME'
        ),
        0.00
    ) as total_income,
    COALESCE(
        (
            SELECT total
            FROM monthly_data
            WHERE type = 'EXPENSE'
        ),
        0.00
    ) as total_expenses,
    COALESCE(
        (
            SELECT total
            FROM monthly_data
            WHERE type = 'INCOME'
        ),
        0.00
    ) - COALESCE(
        (
            SELECT total
            FROM monthly_data
            WHERE type = 'EXPENSE'
        ),
        0.00
    ) as balance,
    COALESCE(
        (
            SELECT SUM(count)
            FROM monthly_data
        ),
        0
    )::BIGINT as transaction_count;
END;
$$ LANGUAGE plpgsql;
COMMENT ON FUNCTION calculate_monthly_summary IS 'Calcula resumo financeiro de um mês específico';