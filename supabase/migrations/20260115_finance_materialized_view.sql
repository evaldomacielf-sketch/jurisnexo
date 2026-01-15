-- Migration: 20260115_finance_materialized_view.sql
-- Description: Materialized view for monthly financial summary
CREATE MATERIALIZED VIEW IF NOT EXISTS finance_mv_monthly_summary AS
SELECT tenant_id,
    EXTRACT(
        YEAR
        FROM transaction_date
    )::INT as year,
    EXTRACT(
        MONTH
        FROM transaction_date
    )::INT as month,
    SUM(
        CASE
            WHEN type = 'INCOME' THEN amount
            ELSE 0
        END
    ) as total_income,
    SUM(
        CASE
            WHEN type = 'EXPENSE' THEN amount
            ELSE 0
        END
    ) as total_expenses,
    SUM(
        CASE
            WHEN type = 'INCOME' THEN amount
            ELSE - amount
        END
    ) as balance,
    COUNT(*) as transaction_count,
    COUNT(DISTINCT category_id) as categories_used
FROM finance_transactions
WHERE status = 'COMPLETED'
GROUP BY tenant_id,
    year,
    month;
-- Index for performance
CREATE UNIQUE INDEX idx_mv_monthly_summary_unique ON finance_mv_monthly_summary(tenant_id, year, month);
-- Refresh function
CREATE OR REPLACE FUNCTION refresh_monthly_summary() RETURNS VOID AS $$ BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY finance_mv_monthly_summary;
END;
$$ LANGUAGE plpgsql;
-- Trigger to auto-refresh on transaction updates
CREATE OR REPLACE FUNCTION trigger_refresh_monthly_summary() RETURNS TRIGGER AS $$ BEGIN PERFORM refresh_monthly_summary();
RETURN NULL;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_refresh_monthly_summary
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON finance_transactions FOR EACH STATEMENT EXECUTE FUNCTION trigger_refresh_monthly_summary();
-- RLS for Materialized View (NOTE: Materialized Views do not support RLS directly in Postgres < 15 easily, 
-- but we can filter access via a wrapper VIEW or API logic. 
-- Since we query this via API that enforces tenant_id, it is secure at logical layer).
COMMENT ON MATERIALIZED VIEW finance_mv_monthly_summary IS 'Resumo financeiro mensal pré-calculado';