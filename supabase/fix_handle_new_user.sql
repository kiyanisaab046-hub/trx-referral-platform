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

    -- Initialize user's wallet with $0.00 (This was missing!)
    INSERT INTO public.wallets (user_id)
    VALUES (NEW.id);

    -- Insert default rank entry for the new user
    INSERT INTO public.user_ranks (user_id, rank, created_at)
    VALUES (NEW.id, 0, NOW());

    -- Track recursive referrals if sponsor exists
    IF sponsor_uuid IS NOT NULL THEN
        -- Safely call place_user_binary if it exists, else fallback to referrals
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
