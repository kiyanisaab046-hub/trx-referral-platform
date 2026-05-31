-- SQL view for member hierarchy used by TreeView component
-- Joins referrals with users and wallets to provide id, name, parent (referrer) and wallet balance.

CREATE OR REPLACE VIEW public.member_tree AS
SELECT
  r.referred_id AS id,
  u.full_name AS name,
  r.sponsor_id AS referrer_id,
  w.main_balance AS wallet
FROM public.referrals r
JOIN public.users u ON u.id = r.referred_id
LEFT JOIN public.wallets w ON w.user_id = r.referred_id;

-- Indexes for faster hierarchy queries
CREATE INDEX IF NOT EXISTS idx_member_tree_referrer_id ON public.referrals(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_member_tree_referred_id ON public.referrals(referred_id);
