-- 1. Restore the missing referral code generator
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
$$ LANGUAGE plpgsql;

-- 2. Restore the original handle_new_user trigger (without the debug wrapper)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    sponsor_uuid UUID := NULL;
    ref_code TEXT;
    num_id TEXT;
BEGIN
    -- Check if metadata contains a sponsor referral code
    IF NEW.raw_user_meta_data ? 'sponsor_code' AND (NEW.raw_user_meta_data->>'sponsor_code') <> '' THEN
        SELECT id INTO sponsor_uuid 
        FROM public.users 
        WHERE referral_code = UPPER(NEW.raw_user_meta_data->>'sponsor_code');
    END IF;

    ref_code := generate_unique_ref_code();
    num_id := generate_unique_numeric_id();

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

    -- Ensure wallet is created properly
    INSERT INTO public.wallets (user_id)
    VALUES (NEW.id);

    -- Ensure Rank 0 is given properly
    INSERT INTO public.user_ranks (user_id, rank, created_at)
    VALUES (NEW.id, 0, NOW());

    -- Place user in referral tree
    IF sponsor_uuid IS NOT NULL THEN
        BEGIN
            PERFORM public.place_user_binary(sponsor_uuid, NEW.id);
        EXCEPTION WHEN OTHERS THEN
            INSERT INTO public.referrals (sponsor_id, referred_id, level)
            VALUES (sponsor_uuid, NEW.id, 1);
        END;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
