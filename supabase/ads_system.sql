-- supabase/ads_system.sql
-- =========================================================================
-- WATCH & EARN (REWARDED ADS) SYSTEM WITH ADMIN CONTROLS
-- =========================================================================

-- 1. AD SETTINGS TABLE (Global Admin Controls)
CREATE TABLE IF NOT EXISTS public.ad_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    is_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    daily_limit_per_user INTEGER DEFAULT 10 NOT NULL CHECK (daily_limit_per_user >= 1),
    cooldown_seconds INTEGER DEFAULT 30 NOT NULL CHECK (cooldown_seconds >= 0),
    reward_amount NUMERIC(10, 4) DEFAULT 0.0500 NOT NULL CHECK (reward_amount >= 0),
    watch_duration_seconds INTEGER DEFAULT 15 NOT NULL CHECK (watch_duration_seconds >= 5),
    ad_network_url TEXT DEFAULT '' NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT single_row_check CHECK (id = 1)
);

-- Insert initial settings if not existing
INSERT INTO public.ad_settings (id, is_enabled, daily_limit_per_user, cooldown_seconds, reward_amount, watch_duration_seconds, ad_network_url)
VALUES (1, TRUE, 10, 30, 0.0500, 15, 'https://omg10.com/4/11881517')
ON CONFLICT (id) DO UPDATE SET ad_network_url = 'https://omg10.com/4/11881517';

-- 2. AD VIEWS TABLE (Tracking Every Ad Claim For Limits & Anti-Cheat)
CREATE TABLE IF NOT EXISTS public.ad_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    reward_amount NUMERIC(10, 4) NOT NULL CHECK (reward_amount >= 0),
    duration_watched INTEGER NOT NULL CHECK (duration_watched >= 0),
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for lightning fast daily limit and cooldown lookups
CREATE INDEX IF NOT EXISTS idx_ad_views_user_created ON public.ad_views(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.ad_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_views ENABLE ROW LEVEL SECURITY;

-- Policies for ad_settings
DROP POLICY IF EXISTS "Public can view ad settings" ON public.ad_settings;
CREATE POLICY "Public can view ad settings" ON public.ad_settings
    FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admins can update ad settings" ON public.ad_settings;
CREATE POLICY "Admins can update ad settings" ON public.ad_settings
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

-- Policies for ad_views
DROP POLICY IF EXISTS "Users can view their own ad history" ON public.ad_views;
CREATE POLICY "Users can view their own ad history" ON public.ad_views
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all ad views" ON public.ad_views;
CREATE POLICY "Admins can view all ad views" ON public.ad_views
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );
