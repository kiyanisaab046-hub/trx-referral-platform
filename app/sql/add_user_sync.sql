-- Migration: sync auth.users to public.users and add admin RLS policy

-- 1. Function to insert profile row when a new auth user is created
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (
    id,
    name,
    email,
    role,
    created_at,
    sponsor,
    referral_code
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email), -- use full_name if provided, fallback to email
    new.email,
    'anon', -- default role for new sign‑ups
    now(),
    null,
    md5(new.id || random()::text) -- generate a simple referral code
  );
  return new;
end;
$$ language plpgsql security definer;

-- 2. Trigger on auth.users to call the function after insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. RLS policy so admin can view all users (adjust role logic as needed)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin can view all users" ON public.users;
CREATE POLICY "admin can view all users"
ON public.users
FOR SELECT
USING (auth.role() = 'admin');

-- Optional: allow admin to manage users (drop if exists)
DROP POLICY IF EXISTS "admin can manage users" ON public.users;
CREATE POLICY "admin can manage users"
ON public.users
FOR ALL
USING (auth.role() = 'admin')
WITH CHECK (auth.role() = 'admin');

-- Optional: allow admin to insert/update/delete as needed



-- Ensure UUID extension is available for referral code generation if you prefer uuid
-- create extension if not exists "pgcrypto";
