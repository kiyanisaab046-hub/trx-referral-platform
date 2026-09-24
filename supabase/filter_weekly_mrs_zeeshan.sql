-- supabase/filter_weekly_mrs_zeeshan.sql
-- ============================================================================
-- SQL: SET ONLY MRS. ZEESHAN (ID: 53387) IN RANK 5+ WEEKLY SALARY DISTRIBUTION
-- AND KEEP ALL OTHER USERS IN RANKS 1, 2, 3, 4
-- ============================================================================

DO $$
DECLARE
    v_target_user_id UUID;
BEGIN
    -- 1. Find Mrs. Zeeshan's user ID
    SELECT id INTO v_target_user_id 
    FROM public.users 
    WHERE numeric_id = '53387';

    IF v_target_user_id IS NULL THEN
        RAISE EXCEPTION 'User with ID 53387 (Mrs. Zeeshan) not found. Please verify numeric_id.';
    END IF;

    -- 2. Ensure Mrs. Zeeshan has Rank 5
    IF NOT EXISTS (
        SELECT 1 FROM public.user_ranks WHERE user_id = v_target_user_id AND rank = 5
    ) THEN
        INSERT INTO public.user_ranks (user_id, rank, created_at)
        VALUES (v_target_user_id, 5, NOW());
    END IF;

    -- 3. Remove Rank 5, 6, 7, 8, 9, 10 for ALL OTHER users
    DELETE FROM public.user_ranks
    WHERE rank >= 5 AND user_id != v_target_user_id;

    -- 4. Ensure demoted users (Fazal, Waseem, Malik, Safdar, Nazakat, Anam, etc.) 
    -- remain active in Rank 4 so they are still in the system
    INSERT INTO public.user_ranks (user_id, rank, created_at)
    SELECT u.id, 4, NOW()
    FROM public.users u
    WHERE u.numeric_id IN ('18275', '28745', '78199', '21770', '61950', '73272', '36747')
      AND NOT EXISTS (
          SELECT 1 FROM public.user_ranks ur WHERE ur.user_id = u.id AND ur.rank = 4
      );

    -- 5. Delete any uncollected pending weekly rewards for other users
    DELETE FROM public.pending_weekly_rewards
    WHERE user_id != v_target_user_id AND status = 'pending';

    RAISE NOTICE 'SUCCESS: Only Mrs. Zeeshan (ID: 53387) is now in Rank 5+ weekly distribution!';
END $$;
