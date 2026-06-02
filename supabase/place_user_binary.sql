-- place_user_binary.sql
-- Function to place a new user under a sponsor using a binary tree (left/right child columns)
CREATE OR REPLACE FUNCTION public.place_user_binary(
    p_sponsor_id UUID,
    p_new_user_id UUID
) RETURNS VOID AS $$
DECLARE
    v_parent_id UUID;
    v_side TEXT;
BEGIN
    -- Direct children of sponsor
    SELECT
        CASE
            WHEN left_child_id IS NULL THEN 'left'
            WHEN right_child_id IS NULL THEN 'right'
            ELSE NULL
        END,
        id
    INTO v_side, v_parent_id
    FROM public.users
    WHERE id = p_sponsor_id;

    IF v_parent_id IS NOT NULL AND v_side IS NOT NULL THEN
        IF v_side = 'left' THEN
            UPDATE public.users SET left_child_id = p_new_user_id WHERE id = v_parent_id;
        ELSE
            UPDATE public.users SET right_child_id = p_new_user_id WHERE id = v_parent_id;
        END IF;
        INSERT INTO public.referrals (sponsor_id, referred_id, level)
        VALUES (v_parent_id, p_new_user_id, 1);
        RETURN;
    END IF;

    -- BFS within sponsor's subtree to find first vacancy
    WITH RECURSIVE bfs AS (
        SELECT id, left_child_id, right_child_id, 0 AS depth
        FROM public.users
        WHERE id = p_sponsor_id
        UNION ALL
        SELECT u.id, u.left_child_id, u.right_child_id, b.depth + 1
        FROM public.users u
        JOIN bfs b ON u.id = b.left_child_id OR u.id = b.right_child_id
    )
    SELECT id,
           CASE 
               WHEN left_child_id IS NULL THEN 'left' 
               WHEN right_child_id IS NULL THEN 'right' 
           END AS side
    INTO v_parent_id, v_side
    FROM bfs
    WHERE left_child_id IS NULL OR right_child_id IS NULL
    ORDER BY depth, id
    LIMIT 1;

    IF v_parent_id IS NULL THEN
        RAISE EXCEPTION 'No vacant slot found for sponsor %', p_sponsor_id;
    END IF;

    IF v_side = 'left' THEN
        UPDATE public.users SET left_child_id = p_new_user_id WHERE id = v_parent_id;
    ELSE
        UPDATE public.users SET right_child_id = p_new_user_id WHERE id = v_parent_id;
    END IF;

    -- Record referral with proper level (depth+1)
    INSERT INTO public.referrals (sponsor_id, referred_id, level)
    VALUES (v_parent_id, p_new_user_id,
            (SELECT COUNT(*) FROM bfs WHERE id = v_parent_id) + 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
