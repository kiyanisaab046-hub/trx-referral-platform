-- migrate_binary_columns.sql
-- Populate left_child_id and right_child_id for existing users based on current referrals
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT sponsor_id, referred_id,
               ROW_NUMBER() OVER (PARTITION BY sponsor_id ORDER BY id) AS rn
        FROM public.referrals
    LOOP
        IF r.rn = 1 THEN
            UPDATE public.users SET left_child_id = r.referred_id WHERE id = r.sponsor_id;
        ELSIF r.rn = 2 THEN
            UPDATE public.users SET right_child_id = r.referred_id WHERE id = r.sponsor_id;
        END IF;
    END LOOP;
END $$;
