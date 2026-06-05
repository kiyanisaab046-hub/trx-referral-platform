-- fix_handle_new_user.sql
-- =========================================================================
-- Trigger function that runs on auth.users INSERT (new signup).
--
-- Flow:
--   1. Create the user's profile in public.users (with sponsor_id).
--   2. Create the user's wallet (0 balance).
--   3. Create the user's default rank entry.
--   4. If a sponsor exists:
--      a. ALWAYS insert a row into public.referrals (sponsor → new user).
--         This is the ONLY source of truth for "Direct Member" status.
--      b. THEN call place_user_binary() to assign the binary tree position
--         (left_child_id / right_child_id). That function does NOT touch
--         public.referrals at all.
-- =========================================================================

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

    -- Generate a unique referral code for the new user
    ref_code := generate_unique_ref_code();

    -- Generate a unique numeric ID for the new user
    num_id := generate_unique_numeric_id();

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

    -- 3. Insert default rank entry
    INSERT INTO public.user_ranks (user_id, rank, created_at)
    VALUES (NEW.id, 0, NOW());

    -- 4. If sponsor exists, create referral row AND binary tree placement
    IF sponsor_uuid IS NOT NULL THEN
        -- 4a. ALWAYS create the direct-member referral row.
        --     This is the SOLE source of truth for "Direct Members".
        INSERT INTO public.referrals (sponsor_id, referred_id, level)
        VALUES (sponsor_uuid, NEW.id, 1)
        ON CONFLICT (referred_id) DO NOTHING;   -- safety: prevent duplicates

        -- 4b. Place in binary tree (left/right child pointers only).
        --     place_user_binary does NOT insert into public.referrals.
        BEGIN
            PERFORM public.place_user_binary(sponsor_uuid, NEW.id);
        EXCEPTION WHEN OTHERS THEN
            -- If binary placement fails, the referral row is already created
            -- so the user still shows as a direct member of the sponsor.
            RAISE WARNING 'Binary placement failed for user %: %', NEW.id, SQLERRM;
        END;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
