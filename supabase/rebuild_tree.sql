-- Rebuild the Binary Matrix Tree
-- This script safely clears the current physical placements (left/right children)
-- and recalculates them from scratch using the robust place_user_binary function.
-- It processes users in the order they joined.

DO $$
DECLARE
    r RECORD;
    v_root_id UUID;
BEGIN
    -- 1. Clear all binary tree pointers
    UPDATE public.users 
    SET left_child_id = NULL, 
        right_child_id = NULL;

    -- 2. Find the root user (the first user created or the one without a sponsor)
    --    Change this query if your root user is identified differently.
    SELECT id INTO v_root_id 
    FROM public.users 
    ORDER BY created_at ASC 
    LIMIT 1;

    -- 3. Loop through all other users in chronological order
    FOR r IN (
        SELECT id, sponsor_id, created_at 
        FROM public.users 
        WHERE id != v_root_id
        ORDER BY created_at ASC
    )
    LOOP
        -- If a user doesn't have a sponsor, default them to the root user
        -- so they are placed in the global matrix.
        IF r.sponsor_id IS NULL THEN
            PERFORM public.place_user_binary(v_root_id, r.id);
        ELSE
            PERFORM public.place_user_binary(r.sponsor_id, r.id);
        END IF;
    END LOOP;

    RAISE NOTICE 'Tree rebuilt successfully!';
END;
$$ LANGUAGE plpgsql;
