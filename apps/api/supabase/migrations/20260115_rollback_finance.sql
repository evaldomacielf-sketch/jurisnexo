-- 
-- ROLLBACK: Remove todas as migrations do módulo financeiro
-- ⚠️ CUIDADO: Este script apaga TODOS os dados das tabelas criadas!
-- 
-- Desabilita RLS antes de dropar
ALTER TABLE IF EXISTS payment_checkouts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payment_portal_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS legal_fee_payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS legal_fees DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS fee_split_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS fee_split_rules DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ir_cash_book DISABLE ROW LEVEL SECURITY;
-- Dropa tabelas na ordem reversa
DROP TABLE IF EXISTS payment_checkouts CASCADE;
DROP TABLE IF EXISTS payment_portal_settings CASCADE;
DROP TABLE IF EXISTS legal_fee_payments CASCADE;
DROP TABLE IF EXISTS legal_fees CASCADE;
DROP TABLE IF EXISTS fee_split_transactions CASCADE;
DROP TABLE IF EXISTS fee_split_rules CASCADE;
DROP TABLE IF EXISTS ir_cash_book CASCADE;
DROP TABLE IF EXISTS fiscal_categories CASCADE;
-- Dropa views
DROP VIEW IF EXISTS v_legal_fee_profitability CASCADE;
DROP VIEW IF EXISTS v_lawyer_fee_extract CASCADE;
DROP VIEW IF EXISTS v_ir_annual_report CASCADE;
-- Dropa funções
DROP FUNCTION IF EXISTS get_financial_dashboard CASCADE;
DROP FUNCTION IF EXISTS increment_checkout_access CASCADE;
DROP FUNCTION IF EXISTS expire_checkout_on_completion CASCADE;
DROP FUNCTION IF EXISTS generate_unique_slug CASCADE;
DROP FUNCTION IF EXISTS update_legal_fee_on_payment CASCADE;
DROP FUNCTION IF EXISTS update_legal_fee_amounts CASCADE;
DROP FUNCTION IF EXISTS calculate_fee_splits CASCADE;
DROP FUNCTION IF EXISTS calculate_deductible_amount CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
-- Remove policies (se ainda existirem)
-- (Elas são automaticamente removidas com CASCADE nas tabelas)