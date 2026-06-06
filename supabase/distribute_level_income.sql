-- distribute_level_income.sql
-- =========================================================================
-- Distributes the 30% Level Income dynamically based on the rank being purchased.
-- Implements recursive validation and upward skipping for unqualified users.
-- =========================================================================

CREATE OR REPLACE FUNCTION public.distribute_level_income(
    p_upgrader_id UUID,
    p_new_rank_id INTEGER,
    p_total_upgrade_fee DECIMAL
) RETURNS VOID AS $$
DECLARE
    v_payout_amount DECIMAL;
    v_sponsor_id UUID;
    v_target_id UUID;
    v_current_node UUID;
    v_next_parent UUID;
    v_direct_count INTEGER;
    v_target_rank INTEGER;
    v_upgrader_numeric TEXT;
    i INTEGER;
BEGIN
    -- 1. Calculate the 30% payout
    v_payout_amount := p_total_upgrade_fee * 0.30;
    
    -- Get upgrader numeric ID for transaction logs
    SELECT numeric_id INTO v_upgrader_numeric FROM public.users WHERE id = p_upgrader_id;
    IF v_upgrader_numeric IS NULL THEN v_upgrader_numeric := 'Unknown'; END IF;

    -- =========================================================================
    -- CRITICAL EXCEPTION: Level 1 Upgrades
    -- =========================================================================
    IF p_new_rank_id = 1 THEN
        -- Instantly flow entirely to the direct sponsor_id (ignores Rule A & B)
        SELECT sponsor_id INTO v_sponsor_id FROM public.users WHERE id = p_upgrader_id;
        
        IF v_sponsor_id IS NOT NULL THEN
            UPDATE public.wallets 
            SET main_balance = main_balance + v_payout_amount,
                income_balance = income_balance + v_payout_amount,
                updated_at = NOW()
            WHERE user_id = v_sponsor_id;

            INSERT INTO public.transactions (user_id, amount, type, description, created_at)
            VALUES (
                v_sponsor_id, 
                v_payout_amount, 
                'level_income', 
                'Level Income: Level 1 Upgrade from User ' || v_upgrader_numeric, 
                NOW()
            );
        END IF;
        
        RETURN;
    END IF;

    -- =========================================================================
    -- SUBSEQUENT UPGRADES (Level >= 2)
    -- =========================================================================
    
    -- Step 1: Traverse UP the placement tree (binary tree) exactly `p_new_rank_id` times
    v_current_node := p_upgrader_id;
    
    FOR i IN 1..p_new_rank_id LOOP
        SELECT id INTO v_next_parent 
        FROM public.users 
        WHERE left_child_id = v_current_node OR right_child_id = v_current_node 
        LIMIT 1;
        
        IF v_next_parent IS NULL THEN
            -- Hit the absolute top of the tree before reaching the target depth.
            -- The top admin user becomes the target.
            EXIT;
        END IF;
        
        v_current_node := v_next_parent;
    END LOOP;
    
    v_target_id := v_current_node;

    -- Step 2: Recursive Validation Loop (Rules A & B)
    LOOP
        -- Check Rule A: At least 2 active direct referrals
        SELECT COUNT(*) INTO v_direct_count 
        FROM public.referrals 
        WHERE sponsor_id = v_target_id AND level = 1;

        -- Check Rule B: Target's Rank >= Purchased Rank
        SELECT rank INTO v_target_rank 
        FROM public.user_ranks 
        WHERE user_id = v_target_id;
        
        IF v_target_rank IS NULL THEN v_target_rank := 0; END IF;

        -- Evaluate Rules
        IF v_direct_count >= 2 AND v_target_rank >= p_new_rank_id THEN
            -- QUALIFIED! Pay them and exit loop.
            UPDATE public.wallets 
            SET main_balance = main_balance + v_payout_amount,
                income_balance = income_balance + v_payout_amount,
                updated_at = NOW()
            WHERE user_id = v_target_id;

            INSERT INTO public.transactions (user_id, amount, type, description, created_at)
            VALUES (
                v_target_id, 
                v_payout_amount, 
                'level_income', 
                'Level Income: Level ' || p_new_rank_id || ' Upgrade from User ' || v_upgrader_numeric, 
                NOW()
            );
            EXIT; -- Success, end of script.
        ELSE
            -- DISQUALIFIED! 
            
            -- Step 3: Check if we are at the absolute top of the tree
            SELECT id INTO v_next_parent 
            FROM public.users 
            WHERE left_child_id = v_target_id OR right_child_id = v_target_id 
            LIMIT 1;

            IF v_next_parent IS NULL THEN
                -- Final Safety Net: Force-allocate to this top system account to prevent lost funds.
                UPDATE public.wallets 
                SET main_balance = main_balance + v_payout_amount,
                    income_balance = income_balance + v_payout_amount,
                    updated_at = NOW()
                WHERE user_id = v_target_id;

                INSERT INTO public.transactions (user_id, amount, type, description, created_at)
                VALUES (
                    v_target_id, 
                    v_payout_amount, 
                    'level_income', 
                    'Level Income (Safety Net): Level ' || p_new_rank_id || ' Upgrade from User ' || v_upgrader_numeric, 
                    NOW()
                );
                EXIT;
            ELSE
                -- Log the skipped $0 transaction for motivation
                INSERT INTO public.transactions (user_id, amount, type, description, created_at)
                VALUES (
                    v_target_id, 
                    0, 
                    'level_income', 
                    'Skipped Level ' || p_new_rank_id || ' Income: Missing qualifications (Directs: ' || v_direct_count || ', Rank: ' || v_target_rank || ')', 
                    NOW()
                );
                
                -- Move exactly one level higher and re-evaluate
                v_target_id := v_next_parent;
            END IF;
        END IF;

    END LOOP;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
