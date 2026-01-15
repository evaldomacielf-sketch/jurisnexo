-- Migration: 20260116_finance_module_rollback.sql
-- Description: Rollback script to DROP all finance module objects.
-- WARNING: This will DELETE ALL DATA related to the finance module. Use with extreme caution.
-- ============================================
-- 1. DROP VIEWS AND MATERIALIZED VIEWS
-- ============================================
DROP VIEW IF EXISTS finance_v_category_summary CASCADE;
DROP MATERIALIZED VIEW IF EXISTS finance_mv_monthly_summary CASCADE;
-- ============================================
-- 2. DROP TABLES (Order matters due to FKs)
-- ============================================
DROP TABLE IF EXISTS finance_audit_log CASCADE;
DROP TABLE IF EXISTS finance_invoices CASCADE;
DROP TABLE IF EXISTS finance_payables CASCADE;
DROP TABLE IF EXISTS finance_receivables CASCADE;
DROP TABLE IF EXISTS finance_budget_planning CASCADE;
-- Check exact name if implemented
DROP TABLE IF EXISTS finance_budgets CASCADE;
DROP TABLE IF EXISTS finance_recurring_transactions CASCADE;
DROP TABLE IF EXISTS finance_transactions CASCADE;
DROP TABLE IF EXISTS finance_accounts CASCADE;
DROP TABLE IF EXISTS finance_categories CASCADE;
-- ============================================
-- 3. DROP FUNCTIONS AND TRIGGERS
-- ============================================
DROP FUNCTION IF EXISTS calculate_monthly_summary(UUID, INT, INT) CASCADE;
DROP FUNCTION IF EXISTS generate_recurring_transactions() CASCADE;
DROP FUNCTION IF EXISTS refresh_monthly_summary() CASCADE;
DROP FUNCTION IF EXISTS trigger_refresh_monthly_summary() CASCADE;
DROP FUNCTION IF EXISTS update_finance_updated_at() CASCADE;
-- ============================================
-- 4. DROP TYPES
-- ============================================
-- Note: Check if these types were created explicitly or if they are just check constraints.
-- Based on the migration files viewed, most "enums" were implemented as CHECK constraints (VARCHAR).
-- Examples: status IN ('PENDING', ...), type IN ('INCOME', ...)
-- So there might not be actual CREATE TYPE definitions to drop, but we include commands just in case
-- they were created in a separate step or improved later.
-- If types were created:
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS approval_status CASCADE;
DROP TYPE IF EXISTS entry_type CASCADE;
DROP TYPE IF EXISTS recurrence_frequency CASCADE;
DROP TYPE IF EXISTS finance_category_type CASCADE;
DROP TYPE IF EXISTS finance_account_type CASCADE;
-- ============================================
-- END OF ROLLBACK
-- ============================================