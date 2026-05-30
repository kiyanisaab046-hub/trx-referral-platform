-- =========================================================================
-- MIGRATION: Add numeric_id and activation_date to users table
-- Execute this in the SQL Editor of your Supabase Dashboard
-- =========================================================================

-- 1. Add new columns
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS numeric_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS activation_date TIMESTAMP WITH TIME ZONE;

-- 2. Create a function to generate a unique 5-digit numeric ID
CREATE OR REPLACE FUNCTION generate_unique_numeric_id()
RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    exists_id BOOLEAN;
BEGIN
    LOOP
        -- Generate a random 5-digit number between 10000 and 99999
        new_id := LPAD(FLOOR(RANDOM() * 90000 + 10000)::TEXT, 5, '0');
        SELECT EXISTS(SELECT 1 FROM public.users WHERE numeric_id = new_id) INTO exists_id;
        IF NOT exists_id THEN
            RETURN new_id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 3. Update the handle_new_user trigger to also set numeric_id on registration
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

-- 4. Backfill existing users who don't have a numeric_id yet
DO $$
DECLARE
    r RECORD;
    new_id TEXT;
BEGIN
    FOR r IN SELECT id FROM public.users WHERE numeric_id IS NULL LOOP
        new_id := generate_unique_numeric_id();
        UPDATE public.users SET numeric_id = new_id WHERE id = r.id;
    END LOOP;
END $$;

-- 5. Set activation_date when a user's first deposit is approved
-- (You can also set this manually via admin panel or when rank is first purchased)
-- Example: Trigger on deposit approval
CREATE OR REPLACE FUNCTION public.set_activation_date_on_deposit()
RETURNS TRIGGER AS $$
BEGIN
    -- Only set activation_date if it hasn't been set yet and status changed to 'approved'
    IF NEW.status = 'approved' AND OLD.status <> 'approved' THEN
        UPDATE public.users 
        SET activation_date = NOW() 
        WHERE id = NEW.user_id AND activation_date IS NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists, then create
DROP TRIGGER IF EXISTS on_deposit_approved ON public.deposits;
CREATE TRIGGER on_deposit_approved
    AFTER UPDATE ON public.deposits
    FOR EACH ROW EXECUTE FUNCTION public.set_activation_date_on_deposit();

-- 6. Also set activation_date when a rank is first purchased
CREATE OR REPLACE FUNCTION public.set_activation_date_on_rank()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.users 
    SET activation_date = NOW() 
    WHERE id = NEW.user_id AND activation_date IS NULL;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_rank_achieved ON public.user_ranks;
CREATE TRIGGER on_rank_achieved
    AFTER INSERT ON public.user_ranks
    FOR EACH ROW EXECUTE FUNCTION public.set_activation_date_on_rank();

-- 7. RLS Policy: Allow users to read their sponsor's numeric_id
CREATE POLICY "Users can read sponsor profile" ON public.users
    FOR SELECT USING (
        id IN (
            SELECT sponsor_id FROM public.users WHERE id = auth.uid()
        )
    );
