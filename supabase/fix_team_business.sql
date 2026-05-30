-- Update Team Business Calculation to include Rank Purchases
CREATE OR REPLACE FUNCTION public.get_team_business(root_user_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    total_business DECIMAL := 0;
BEGIN
    WITH RECURSIVE downline AS (
        -- Base case: direct referrals of the root_user_id
        SELECT referred_id
        FROM public.referrals
        WHERE sponsor_id = root_user_id
        
        UNION
        
        -- Recursive step: referrals of the downline users
        SELECT r.referred_id
        FROM public.referrals r
        INNER JOIN downline d ON r.sponsor_id = d.referred_id
    )
    SELECT COALESCE(SUM(ABS(amount)), 0)
    INTO total_business
    FROM public.transactions
    WHERE user_id IN (SELECT referred_id FROM downline)
      AND (
          type = 'deposit' 
          OR (type = 'withdrawal' AND description LIKE 'Rank Purchase%')
          OR type = 'rank_purchase'
      );

    RETURN total_business;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
