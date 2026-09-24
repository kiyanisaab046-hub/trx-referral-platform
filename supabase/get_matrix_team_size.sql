-- get_matrix_team_size.sql
-- Computes the total number of physical downline members in a user's binary matrix.
-- Counts every node reachable via left_child_id or right_child_id.

CREATE OR REPLACE FUNCTION public.get_matrix_team_size(user_uuid UUID)
RETURNS BIGINT AS $$
DECLARE
    team_size BIGINT;
BEGIN
    WITH RECURSIVE team_tree AS (
        -- Start with the immediate children of the root user
        SELECT left_child_id AS id FROM public.users WHERE id = user_uuid AND left_child_id IS NOT NULL
        UNION ALL
        SELECT right_child_id AS id FROM public.users WHERE id = user_uuid AND right_child_id IS NOT NULL
        
        UNION ALL
        
        -- Recursively find their children
        SELECT u.left_child_id AS id
        FROM public.users u
        INNER JOIN team_tree tt ON u.id = tt.id
        WHERE u.left_child_id IS NOT NULL
        
        UNION ALL
        
        SELECT u.right_child_id AS id
        FROM public.users u
        INNER JOIN team_tree tt ON u.id = tt.id
        WHERE u.right_child_id IS NOT NULL
    )
    SELECT count(*) INTO team_size FROM team_tree;
    
    RETURN COALESCE(team_size, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
