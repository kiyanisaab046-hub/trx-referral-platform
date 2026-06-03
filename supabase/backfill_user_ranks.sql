-- Backfill user_ranks for existing users
INSERT INTO public.user_ranks (user_id, rank, created_at)
SELECT u.id, 0, NOW()
FROM public.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_ranks ur WHERE ur.user_id = u.id
);
