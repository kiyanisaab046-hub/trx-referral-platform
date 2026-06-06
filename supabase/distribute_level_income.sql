-- distribute_level_income.sql
-- =========================================================================
-- Distributes the 30% Level Income dynamically based on the rank being purchased.
-- Parameter names match JS RPC call exactly (no p_ prefix).
-- Uses 'commission_level' enum value for transaction type.
-- =========================================================================

-- Drop old version first to allow parameter rename
DROP FUNCTION IF EXISTS public.distribute_level_income(UUID, INTEGER, NUMERIC);
DROP FUNCTION IF EXISTS public.distribute_level_income(UUID, INTEGER, DECIMAL);

CREATE OR REPLACE FUNCTION public.distribute_level_income(
    upgrader_id UUID,
    new_rank_id INTEGER,
    total_upgrade_fee DECIMAL
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
    v_payout_amount := total_upgrade_fee * 0.30;
    
    -- Get upgrader numeric ID for transaction logs
    SELECT numeric_id INTO v_upgrader_numeric FROM public.users WHERE id = upgrader_id;
    IF v_upgrader_numeric IS NULL THEN v_upgrader_numeric := 'Unknown'; END IF;

    -- =========================================================================
    -- PHASE 1: Level 1 (Starter) — straight to sponsor, zero conditions
    -- =========================================================================
    IF new_rank_id = 1 THEN
        -- Try users.sponsor_id first
        SELECT sponsor_id INTO v_sponsor_id FROM public.users WHERE id = upgrader_id;
        -- Fallback: referrals table
        IF v_sponsor_id IS NULL THEN
            SELECT sponsor_id INTO v_sponsor_id 
            FROM public.referrals 
            WHERE referred_id = upgrader_id AND level = 1 
            LIMIT 1;
        END IF;
        
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
                'commission_level', 
                'Level Income: Level 1 Upgrade from User ' || v_upgrader_numeric, 
                NOW()
            );
        END IF;
        
        RETURN;
    END IF;

    -- =========================================================================
    -- PHASE 2+: Level >= 2 — climb tree then validate
    -- =========================================================================
    v_current_node := upgrader_id;
    
    FOR i IN 1..new_rank_id LOOP
        SELECT id INTO v_next_parent 
        FROM public.users 
        WHERE left_child_id = v_current_node OR right_child_id = v_current_node 
        LIMIT 1;
        
        IF v_next_parent IS NULL THEN EXIT; END IF;
        v_current_node := v_next_parent;
    END LOOP;
    
    v_target_id := v_current_node;

    LOOP
        -- Rule A: At least 2 direct referrals
        -- Rule A: At least 2 direct referrals who have upgraded (rank >= 1)
        SELECT COUNT(*) INTO v_direct_count
        FROM public.referrals r
        JOIN public.user_ranks ur ON ur.user_id = r.referred_id
        WHERE r.sponsor_id = v_target_id
          AND r.level = 1
          AND ur.rank >= 1;

        -- Rule B: Target rank >= purchased rank
        SELECT rank INTO v_target_rank 
        FROM public.user_ranks 
        WHERE user_id = v_target_id;
        
        IF v_target_rank IS NULL THEN v_target_rank := 0; END IF;

        IF v_direct_count >= 2 AND v_target_rank >= new_rank_id THEN
            -- QUALIFIED — pay them
            UPDATE public.wallets 
            SET main_balance = main_balance + v_payout_amount,
                income_balance = income_balance + v_payout_amount,
                updated_at = NOW()
            WHERE user_id = v_target_id;

            INSERT INTO public.transactions (user_id, amount, type, description, created_at)
            VALUES (
                v_target_id, 
                v_payout_amount, 
                'commission_level', 
                'Level Income: Level ' || new_rank_id || ' Upgrade from User ' || v_upgrader_numeric, 
                NOW()
            );
            EXIT;
        ELSE
            -- DISQUALIFIED — check if at top of tree
            SELECT id INTO v_next_parent 
            FROM public.users 
            WHERE left_child_id = v_target_id OR right_child_id = v_target_id 
            LIMIT 1;

            IF v_next_parent IS NULL THEN
                -- Safety Net: force-allocate to Admin Profit pool (system absorbs the breakage)
                INSERT INTO public.admin_profits (amount, source_type, description, created_at)
                VALUES (
                    v_payout_amount, 
                    'commission_level_breakage', 
                    'Level Income Breakage: Level ' || new_rank_id || ' Upgrade from User ' || v_upgrader_numeric, 
                    NOW()
                );
                EXIT;
            ELSE
                -- Log skip with $0 for motivation
                INSERT INTO public.transactions (user_id, amount, type, description, created_at)
                VALUES (
                    v_target_id, 
                    0, 
                    'commission_level', 
                    'Skipped Level ' || new_rank_id || ' Income: Missing qualifications (Directs: ' || v_direct_count || ', Rank: ' || v_target_rank || ')', 
                    NOW()
                );
                
                v_target_id := v_next_parent;
            END IF;
        END IF;

    END LOOP;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

