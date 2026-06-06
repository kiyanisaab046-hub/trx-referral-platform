-- perfect_signup_fix.sql
-- =========================================================================
-- RUN THIS ENTIRE SCRIPT IN THE SUPABASE SQL EDITOR TO FIX SIGNUP ERRORS
-- =========================================================================

-- 1. Recreate generate_unique_ref_code in public schema with search_path set
CREATE OR REPLACE FUNCTION public.generate_unique_ref_code() 
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Recreate generate_unique_numeric_id in public schema with search_path set
CREATE OR REPLACE FUNCTION public.generate_unique_numeric_id()
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Recreate the handle_new_user trigger function with SET search_path = public
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    sponsor_uuid UUID := NULL;
    ref_code TEXT;
    num_id TEXT;
BEGIN
    -- Resolve sponsor from the referral code passed during signup
    IF NEW.raw_user_meta_data ? 'sponsor_code' AND (NEW.raw_user_meta_data->>'sponsor_code') <> '' THEN
        SELECT id INTO sponsor_uuid 
        FROM public.users 
        WHERE referral_code = UPPER(NEW.raw_user_meta_data->>'sponsor_code');
    END IF;

    -- Generate a unique referral code for the new user (qualified with public schema)
    ref_code := public.generate_unique_ref_code();

    -- Generate a unique numeric ID for the new user (qualified with public schema)
    num_id := public.generate_unique_numeric_id();

    -- 1. Insert profile into public.users
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

    -- 2. Initialize wallet with $0.00
    INSERT INTO public.wallets (user_id)
    VALUES (NEW.id);

    -- 3. Insert default rank entry (Rank 0)
    INSERT INTO public.user_ranks (user_id, rank, created_at)
    VALUES (NEW.id, 0, NOW());

    -- 4. If sponsor exists, create referral row AND binary tree placement
    IF sponsor_uuid IS NOT NULL THEN
        -- 4a. ALWAYS create the direct-member referral row.
        --     This is the SOLE source of truth for "Direct Members".
        INSERT INTO public.referrals (sponsor_id, referred_id, level)
        VALUES (sponsor_uuid, NEW.id, 1)
        ON CONFLICT (referred_id) DO NOTHING;

        -- 4b. Place in binary tree (left/right child pointers only).
        --     place_user_binary does NOT insert into public.referrals.
        BEGIN
            PERFORM public.place_user_binary(sponsor_uuid, NEW.id);
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Binary placement failed for user %: %', NEW.id, SQLERRM;
        END;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Re-bind the trigger to auth.users (ensure it is clean)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
