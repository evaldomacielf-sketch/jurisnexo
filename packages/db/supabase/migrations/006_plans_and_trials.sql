-- Migration: 006_plans_and_trials
-- Description: Updates plan_type enum and adds policies for expired trials if needed.
-- Postgres allows adding enum values in a transaction-safe way (since v12 usually, but simple ALTER is fine).
-- 'trial_expired' needs to be added to 'plan_type'.
ALTER TYPE plan_type
ADD VALUE IF NOT EXISTS 'trial_expired';