-- 1. Create the Admin Profits table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admin_profits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    amount DECIMAL NOT NULL DEFAULT 0,
    source_type TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Update the Level Income Function
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
    v_payout_amount := total_upgrade_fee * 0.30;
    
    SELECT numeric_id INTO v_upgrader_numeric FROM public.users WHERE id = upgrader_id;
    IF v_upgrader_numeric IS NULL THEN v_upgrader_numeric := 'Unknown'; END IF;

    IF new_rank_id = 1 THEN
        SELECT sponsor_id INTO v_sponsor_id FROM public.users WHERE id = upgrader_id;
        IF v_sponsor_id IS NULL THEN
            SELECT sponsor_id INTO v_sponsor_id FROM public.referrals WHERE referred_id = upgrader_id AND level = 1 LIMIT 1;
        END IF;
        
        IF v_sponsor_id IS NOT NULL THEN
            UPDATE public.wallets SET main_balance = main_balance + v_payout_amount, income_balance = income_balance + v_payout_amount, updated_at = NOW() WHERE user_id = v_sponsor_id;
            INSERT INTO public.transactions (user_id, amount, type, description, created_at) VALUES (v_sponsor_id, v_payout_amount, 'commission_level', 'Level Income: Level 1 Upgrade from User ' || v_upgrader_numeric, NOW());
        END IF;
        RETURN;
    END IF;

    v_current_node := upgrader_id;
    FOR i IN 1..new_rank_id LOOP
        SELECT id INTO v_next_parent FROM public.users WHERE left_child_id = v_current_node OR right_child_id = v_current_node LIMIT 1;
        IF v_next_parent IS NULL THEN EXIT; END IF;
        v_current_node := v_next_parent;
    END LOOP;
    
    v_target_id := v_current_node;

    LOOP
        SELECT COUNT(*) INTO v_direct_count
        FROM public.referrals r
        JOIN public.user_ranks ur ON ur.user_id = r.referred_id
        WHERE r.sponsor_id = v_target_id AND r.level = 1 AND ur.rank >= 1;

        SELECT rank INTO v_target_rank FROM public.user_ranks WHERE user_id = v_target_id;
        IF v_target_rank IS NULL THEN v_target_rank := 0; END IF;

        IF v_direct_count >= 2 AND v_target_rank >= new_rank_id THEN
            UPDATE public.wallets SET main_balance = main_balance + v_payout_amount, income_balance = income_balance + v_payout_amount, updated_at = NOW() WHERE user_id = v_target_id;
            INSERT INTO public.transactions (user_id, amount, type, description, created_at) VALUES (v_target_id, v_payout_amount, 'commission_level', 'Level Income: Level ' || new_rank_id || ' Upgrade from User ' || v_upgrader_numeric, NOW());
            EXIT;
        ELSE
            SELECT id INTO v_next_parent FROM public.users WHERE left_child_id = v_target_id OR right_child_id = v_target_id LIMIT 1;

            IF v_next_parent IS NULL THEN
                -- SAFETY NET FIX: System absorbs it into admin_profits instead of giving it to the Root user
                INSERT INTO public.admin_profits (amount, source_type, description, created_at)
                VALUES (v_payout_amount, 'commission_level_breakage', 'Level Income Breakage: Level ' || new_rank_id || ' Upgrade from User ' || v_upgrader_numeric, NOW());
                EXIT;
            ELSE
                INSERT INTO public.transactions (user_id, amount, type, description, created_at)
                VALUES (v_target_id, 0, 'commission_level', 'Skipped Level ' || new_rank_id || ' Income: Missing qualifications (Directs: ' || v_direct_count || ', Rank: ' || v_target_rank || ')', NOW());
                v_target_id := v_next_parent;
            END IF;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
