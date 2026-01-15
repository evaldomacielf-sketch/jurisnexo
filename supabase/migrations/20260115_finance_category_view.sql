-- Migration: 20260115_finance_category_view.sql
-- Description: View for transactions grouped by category
CREATE OR REPLACE VIEW finance_v_category_summary AS
SELECT ft.tenant_id,
    ft.category_id,
    c.name as category_name,
    c.color as category_color,
    c.type as category_type,
    EXTRACT(
        YEAR
        FROM ft.transaction_date
    )::INT as year,
    EXTRACT(
        MONTH
        FROM ft.transaction_date
    )::INT as month,
    SUM(
        CASE
            WHEN ft.type = 'INCOME' THEN ft.amount
            ELSE 0
        END
    ) as total_income,
    SUM(
        CASE
            WHEN ft.type = 'EXPENSE' THEN ft.amount
            ELSE 0
        END
    ) as total_expenses,
    COUNT(*) as transaction_count
FROM finance_transactions ft
    INNER JOIN finance_categories c ON ft.category_id = c.id
WHERE ft.status = 'COMPLETED'
GROUP BY ft.tenant_id,
    ft.category_id,
    c.name,
    c.color,
    c.type,
    year,
    month;
COMMENT ON VIEW finance_v_category_summary IS 'Resumo de transações agrupadas por categoria';