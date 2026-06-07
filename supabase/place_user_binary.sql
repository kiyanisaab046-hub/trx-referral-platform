-- place_user_binary.sql
-- =========================================================================
-- Binary tree auto-placement function.
-- Places new users: LEFT first, then RIGHT, top-to-bottom, level-by-level.
--
-- IMPORTANT: This function ONLY updates binary tree pointers
-- (left_child_id / right_child_id). It does NOT touch public.referrals.
-- The direct-member (sponsor) relationship is created by handle_new_user.
-- =========================================================================

CREATE OR REPLACE FUNCTION public.place_user_binary(
    p_sponsor_id UUID,
    p_new_user_id UUID
) RETURNS VOID AS $$
DECLARE
    v_parent_id UUID;
    v_side      TEXT;
BEGIN
    -- ----------------------------------------------------------------
    -- 1. Try to attach the new user as an immediate child of the sponsor
    --    Always fill LEFT first, then RIGHT.
    -- ----------------------------------------------------------------
    SELECT
        CASE
            WHEN left_child_id IS NULL  THEN 'left'
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
        -- No INSERT into public.referrals — handled by handle_new_user trigger.
        RETURN;
    END IF;

    -- ----------------------------------------------------------------
    -- 2. Sponsor's immediate slots are full.
    --    Do a BFS through the sponsor's entire subtree to find the
    --    first vacant slot (left-to-right, top-to-bottom).
    --
    --    We use a numbering scheme (like a heap/complete binary tree):
    --      root = 1
    --      left  child of node N = 2*N
    --      right child of node N = 2*N + 1
    --
    --    Ordering by this number guarantees:
    --      - Shallower levels come first (top-to-bottom)
    --      - Within a level, left nodes come before right (left-to-right)
    -- ----------------------------------------------------------------
    WITH RECURSIVE bfs AS (
        SELECT
            id,
            left_child_id,
            right_child_id,
            0       AS depth,
            1::NUMERIC AS node_order   -- root = 1
        FROM public.users
        WHERE id = p_sponsor_id

        UNION ALL

        SELECT
            u.id,
            u.left_child_id,
            u.right_child_id,
            b.depth + 1,
            CASE
                WHEN u.id = b.left_child_id  THEN b.node_order * 2        -- left child
                WHEN u.id = b.right_child_id THEN b.node_order * 2 + 1    -- right child
            END
        FROM public.users u
        JOIN bfs b ON u.id = b.left_child_id OR u.id = b.right_child_id
    )
    SELECT id,
           CASE
               WHEN left_child_id IS NULL  THEN 'left'
               WHEN right_child_id IS NULL THEN 'right'
           END AS side
    INTO v_parent_id, v_side
    FROM bfs
    WHERE left_child_id IS NULL OR right_child_id IS NULL
    ORDER BY node_order          -- guarantees top-to-bottom, left-to-right
    LIMIT 1;

    IF v_parent_id IS NULL THEN
        RAISE EXCEPTION 'No vacant slot found in binary tree for sponsor %', p_sponsor_id;
    END IF;

    IF v_side = 'left' THEN
        UPDATE public.users SET left_child_id = p_new_user_id WHERE id = v_parent_id;
    ELSE
        UPDATE public.users SET right_child_id = p_new_user_id WHERE id = v_parent_id;
    END IF;

    -- No INSERT into public.referrals — handled by handle_new_user trigger.
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
