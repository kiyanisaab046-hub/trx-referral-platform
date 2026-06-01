-- =========================================================================
-- MIGRATION: Add admin_profit to weekly_distributions
-- Execute this in the SQL Editor of your Supabase Dashboard
-- =========================================================================

ALTER TABLE public.weekly_distributions 
ADD COLUMN IF NOT EXISTS admin_profit NUMERIC(12, 2) NOT NULL DEFAULT 0.00;
