CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    sponsor_uuid UUID := NULL;
    ref_code TEXT;
    num_id TEXT;
    exists_code BOOLEAN;
BEGIN
    -- Resolve Sponsor
    IF NEW.raw_user_meta_data ? 'sponsor_code' AND (NEW.raw_user_meta_data->>'sponsor_code') <> '' THEN
        SELECT id INTO sponsor_uuid 
        FROM public.users 
        WHERE referral_code = UPPER(NEW.raw_user_meta_data->>'sponsor_code');
    END IF;

    -- Generate a unique referral code inline (fixes the missing function error permanently)
    LOOP
        ref_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
        SELECT EXISTS(SELECT 1 FROM public.users WHERE referral_code = ref_code) INTO exists_code;
        IF NOT exists_code THEN
            EXIT;
        END IF;
    END LOOP;

    -- Generate unique numeric id
    num_id := generate_unique_numeric_id();

    -- Insert profile
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

    -- Create Wallet
    INSERT INTO public.wallets (user_id) VALUES (NEW.id);

    -- Setup Rank 0
    INSERT INTO public.user_ranks (user_id, rank, created_at) VALUES (NEW.id, 0, NOW());

    -- Binary Placement
    IF sponsor_uuid IS NOT NULL THEN
        BEGIN
            PERFORM public.place_user_binary(sponsor_uuid, NEW.id);
        EXCEPTION WHEN OTHERS THEN
            INSERT INTO public.referrals (sponsor_id, referred_id, level) VALUES (sponsor_uuid, NEW.id, 1);
        END;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
