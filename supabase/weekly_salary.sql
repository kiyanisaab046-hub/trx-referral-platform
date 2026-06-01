-- =========================================================================
-- MIGRATION: Weekly Salary Income Distribution Engine
-- Execute this in the SQL Editor of your Supabase Dashboard
-- =========================================================================

-- 1. Create table to track weekly distributions
CREATE TABLE IF NOT EXISTS public.weekly_distributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_business NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    distributed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for weekly_distributions
ALTER TABLE public.weekly_distributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view weekly distributions" ON public.weekly_distributions 
    FOR SELECT USING (true);

-- 2. Create table for pending weekly rewards per user
CREATE TYPE weekly_reward_status AS ENUM ('pending', 'claimed');

CREATE TABLE IF NOT EXISTS public.pending_weekly_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    distribution_id UUID REFERENCES public.weekly_distributions(id) ON DELETE CASCADE NOT NULL,
    rank INTEGER NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    status weekly_reward_status DEFAULT 'pending'::weekly_reward_status NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    claimed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for pending_weekly_rewards
ALTER TABLE public.pending_weekly_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pending rewards" ON public.pending_weekly_rewards 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can claim own rewards" ON public.pending_weekly_rewards 
    FOR UPDATE USING (auth.uid() = user_id);

-- Optional Admin RLS
CREATE POLICY "Admins have full access to distributions" ON public.weekly_distributions 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'::user_role
        )
    );

CREATE POLICY "Admins have full access to pending rewards" ON public.pending_weekly_rewards 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'::user_role
        )
    );
