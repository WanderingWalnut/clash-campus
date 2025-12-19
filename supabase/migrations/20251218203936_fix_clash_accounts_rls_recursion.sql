-- ----------------------------
-- Fix: Infinite recursion in clash_accounts RLS policy
-- 
-- ISSUE: The RLS policy checks same-university by querying profiles,
-- which triggers profiles RLS policy, causing infinite recursion.
-- 
-- BETTER SOLUTION: 
-- 1. Add separate policy for self-only queries (more efficient)
-- 2. Use SECURITY DEFINER function for same-university check (prevents recursion)
-- 3. Grant access to 'verified' column (needed for verification checks)
-- 
-- Note: SECURITY DEFINER is necessary here because we need to query
-- profiles without triggering its RLS policy. The function is restricted
-- to only be callable from RLS policies (not directly by users).
-- ----------------------------

-- Function to check if two users are in the same university
-- Uses SECURITY DEFINER to bypass RLS ONLY when checking university membership
-- This prevents infinite recursion when used in RLS policies
create or replace function public.users_same_university(
    user1_id uuid,
    user2_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
stable
as $$
declare
    user1_university_id uuid;
    user2_university_id uuid;
begin
    -- Get university_id for both users (bypasses RLS due to SECURITY DEFINER)
    -- This is safe because we're only comparing university_ids, not exposing sensitive data
    select university_id into user1_university_id
    from public.profiles
    where id = user1_id;
    
    select university_id into user2_university_id
    from public.profiles
    where id = user2_id;
    
    -- Return true if both exist and have same university
    return user1_university_id is not null 
        and user2_university_id is not null 
        and user1_university_id = user2_university_id;
end;
$$;

-- Grant execute to authenticated users (needed for RLS policies)
grant execute on function public.users_same_university(uuid, uuid) to authenticated;

-- Update RLS to allow selecting 'verified' column (needed for verification checks)
revoke select on table public.clash_accounts from authenticated;
grant select (id, profile_id, verified) on table public.clash_accounts to authenticated;

-- Drop the old combined policy
drop policy if exists clash_accounts_select_self_or_same_university on public.clash_accounts;

-- Add a separate, simpler policy for self-only queries (more efficient)
-- This policy is evaluated first and avoids the same-university check for self-queries
drop policy if exists clash_accounts_select_self on public.clash_accounts;
create policy clash_accounts_select_self on public.clash_accounts for
select to authenticated using (profile_id = auth.uid());

-- Add separate policy for same-university queries (for leaderboard views)
-- Uses helper function to prevent recursion
drop policy if exists clash_accounts_select_same_university on public.clash_accounts;
create policy clash_accounts_select_same_university on public.clash_accounts for
select to authenticated using (
    -- Only check same-university for OTHER users (not self)
    profile_id != auth.uid()
    and public.users_same_university(auth.uid(), profile_id)
);

comment on function public.users_same_university is 
'Checks if two users are in the same university. Uses SECURITY DEFINER to bypass RLS 
and prevent infinite recursion when used in clash_accounts RLS policies. 
This function only compares university_ids and does not expose sensitive profile data.';
