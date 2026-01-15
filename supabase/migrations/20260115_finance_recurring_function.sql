-- Migration: 20260115_finance_recurring_function.sql
-- Description: Generate transactions from recurring configurations
CREATE OR REPLACE FUNCTION generate_recurring_transactions() RETURNS INT AS $$
DECLARE v_recurring_record RECORD;
v_next_date DATE;
v_generated_count INT := 0;
BEGIN FOR v_recurring_record IN
SELECT *
FROM finance_recurring_transactions
WHERE is_active = TRUE
    AND start_date <= CURRENT_DATE
    AND (
        end_date IS NULL
        OR end_date >= CURRENT_DATE
    )
    AND (
        last_generated_date IS NULL
        OR last_generated_date < CURRENT_DATE
    ) LOOP -- Calculate next date based on frequency
    IF v_recurring_record.last_generated_date IS NULL THEN -- First execution: use start_date
    v_next_date := v_recurring_record.start_date;
ELSE -- Subsequent executions: add interval
v_next_date := CASE
    WHEN v_recurring_record.frequency = 'DAILY' THEN v_recurring_record.last_generated_date + INTERVAL '1 day'
    WHEN v_recurring_record.frequency = 'WEEKLY' THEN v_recurring_record.last_generated_date + INTERVAL '7 days'
    WHEN v_recurring_record.frequency = 'MONTHLY' THEN v_recurring_record.last_generated_date + INTERVAL '1 month'
    WHEN v_recurring_record.frequency = 'QUARTERLY' THEN v_recurring_record.last_generated_date + INTERVAL '3 months'
    WHEN v_recurring_record.frequency = 'YEARLY' THEN v_recurring_record.last_generated_date + INTERVAL '1 year'
END;
END IF;
-- Only generate if next date is today or earlier
IF v_next_date <= CURRENT_DATE THEN
INSERT INTO finance_transactions (
        tenant_id,
        description,
        type,
        amount,
        category_id,
        account_id,
        payment_method,
        transaction_date,
        status,
        notes,
        created_by
    )
VALUES (
        v_recurring_record.tenant_id,
        v_recurring_record.description || ' (Recorrente)',
        v_recurring_record.type,
        v_recurring_record.amount,
        v_recurring_record.category_id,
        v_recurring_record.account_id,
        v_recurring_record.payment_method,
        v_next_date,
        'PENDING',
        v_recurring_record.notes,
        v_recurring_record.created_by
    );
UPDATE finance_recurring_transactions
SET last_generated_date = v_next_date,
    updated_at = NOW()
WHERE id = v_recurring_record.id;
v_generated_count := v_generated_count + 1;
END IF;
END LOOP;
RETURN v_generated_count;
END;
$$ LANGUAGE plpgsql;
COMMENT ON FUNCTION generate_recurring_transactions IS 'Gera transações a partir de configurações recorrentes';