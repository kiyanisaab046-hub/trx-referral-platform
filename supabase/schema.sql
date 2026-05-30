-- supabase/schema.sql
-- =========================================================================
-- SUPABASE REFERENCE SCHEMA FOR REFERRAL-BASED INCOME PLATFORM
-- Execute this in the SQL Editor of your Supabase Dashboard
-- =========================================================================

-- Enable UUID extension if not already active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS (Status & Types)
CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'commission_direct', 'commission_level', 'commission_team', 'commission_salary', 'commission_reward', 'commission_maintenance', 'transfer');
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');

-- 2. USERS PROFILE TABLE
-- Synced automatically with Supabase auth.users
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    role user_role DEFAULT 'user'::user_role,
    referral_code TEXT UNIQUE NOT NULL,
    sponsor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    numeric_id TEXT UNIQUE,
    activation_date TIMESTAMP WITH TIME ZONE,
    is_banned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. WALLETS TABLE
CREATE TABLE public.wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    main_balance NUMERIC(12, 2) DEFAULT 0.00 NOT NULL CHECK (main_balance >= 0),
    deposit_balance NUMERIC(12, 2) DEFAULT 0.00 NOT NULL CHECK (deposit_balance >= 0),
    income_balance NUMERIC(12, 2) DEFAULT 0.00 NOT NULL CHECK (income_balance >= 0),
    withdrawal_balance NUMERIC(12, 2) DEFAULT 0.00 NOT NULL CHECK (withdrawal_balance >= 0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. REFERRALS TABLE (Network Tracking)
CREATE TABLE public.referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sponsor_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    referred_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    level INTEGER NOT NULL CHECK (level > 0),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. DEPOSITS TABLE
CREATE TABLE public.deposits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_screenshot_url TEXT NOT NULL,
    status request_status DEFAULT 'pending'::request_status NOT NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. WITHDRAWALS TABLE
CREATE TABLE public.withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    status request_status DEFAULT 'pending'::request_status NOT NULL,
    wallet_address TEXT, -- Crypto wallet or banking details
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. COMMISSIONS TABLE
CREATE TABLE public.commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    from_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    type transaction_type NOT NULL,
    level_recorded INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. TRANSACTIONS TABLE (Double-entry Ledger)
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL, -- Positive for credits, negative for debits
    type transaction_type NOT NULL,
    description TEXT,
    reference_id UUID, -- References the deposit_id, withdrawal_id, or commission_id
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. PACKAGES TABLE
CREATE TABLE public.packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    daily_roi NUMERIC(5, 2) DEFAULT 0.00,
    validity_days INTEGER DEFAULT 365,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 10. REWARDS TABLE
CREATE TABLE public.rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    reward_name TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    achieved_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 11. NOTIFICATIONS TABLE
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 12. ADMIN LOGS TABLE
CREATE TABLE public.admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);


-- =========================================================================
-- AUTOMATION & TRIGGERS (SYNCING AUTH USERS)
-- =========================================================================

-- Generates a clean unique referral code
CREATE OR REPLACE FUNCTION generate_unique_ref_code() 
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    exists_code BOOLEAN;
BEGIN
    LOOP
        new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
        SELECT EXISTS(SELECT 1 FROM public.users WHERE referral_code = new_code) INTO exists_code;
        IF NOT exists_code THEN
            RETURN new_code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Generates a unique 5-digit numeric ID for each user
CREATE OR REPLACE FUNCTION generate_unique_numeric_id()
RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    exists_id BOOLEAN;
BEGIN
    LOOP
        new_id := LPAD(FLOOR(RANDOM() * 90000 + 10000)::TEXT, 5, '0');
        SELECT EXISTS(SELECT 1 FROM public.users WHERE numeric_id = new_id) INTO exists_id;
        IF NOT exists_id THEN
            RETURN new_id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger Function: Executed on Auth Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    sponsor_uuid UUID := NULL;
    ref_code TEXT;
    num_id TEXT;
BEGIN
    -- Check if metadata contains a sponsor referral code and resolve the sponsor user ID
    IF NEW.raw_user_meta_data ? 'sponsor_code' AND (NEW.raw_user_meta_data->>'sponsor_code') <> '' THEN
        SELECT id INTO sponsor_uuid 
        FROM public.users 
        WHERE referral_code = UPPER(NEW.raw_user_meta_data->>'sponsor_code');
    END IF;

    -- Generate a unique referral code for the new user
    ref_code := generate_unique_ref_code();

    -- Generate a unique numeric ID for the new user
    num_id := generate_unique_numeric_id();

    -- Insert profile details into public.users
    INSERT INTO public.users (id, full_name, email, phone_number, role, referral_code, sponsor_id, numeric_id)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Member'),
        NEW.email,
        NEW.raw_user_meta_data->>'phone_number',
        'user'::user_role,
        ref_code,
        sponsor_uuid,
        num_id
    );

    -- Initialize user's wallet with $0.00
    INSERT INTO public.wallets (user_id)
    VALUES (NEW.id);

    -- Track recursive referrals if sponsor exists
    IF sponsor_uuid IS NOT NULL THEN
        INSERT INTO public.referrals (sponsor_id, referred_id, level)
        VALUES (sponsor_uuid, NEW.id, 1);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind Trigger to auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Enable RLS across tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 1. USERS POLICIES
CREATE POLICY "Users can read own profiles" ON public.users 
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can edit own profiles" ON public.users 
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins have full user access" ON public.users 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'::user_role
        )
    );

-- 2. WALLET POLICIES
CREATE POLICY "Users can read own wallets" ON public.wallets 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins have full wallet access" ON public.wallets 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'::user_role
        )
    );

-- 3. TRANSACTION POLICIES
CREATE POLICY "Users can read own transaction ledger" ON public.transactions 
    FOR SELECT USING (auth.uid() = user_id);

-- 4. DEPOSITS POLICIES
CREATE POLICY "Users can view own deposits" ON public.deposits 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can submit deposits" ON public.deposits 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. WITHDRAWALS POLICIES
CREATE POLICY "Users can view own withdrawals" ON public.withdrawals 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can submit withdrawals" ON public.withdrawals 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. NOTIFICATION POLICIES
CREATE POLICY "Users can access own notifications" ON public.notifications 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification states" ON public.notifications 
    FOR UPDATE USING (auth.uid() = user_id);
