-- ----------------------------
-- Replace same-university helper with private schema function
-- 
-- Goal: prevent client RPC access to the helper while keeping RLS behavior.
-- ----------------------------

-- Create a private schema that is not exposed to PostgREST
create schema if not exists private;
revoke usage on schema private from public;

-- Recreate helper in private schema (used by RLS only)
create or replace function private.users_same_university(
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

comment on function private.users_same_university is
'Checks if two users are in the same university. Uses SECURITY DEFINER to bypass RLS
and prevent recursion when used in clash_accounts RLS policies. Not exposed to RPC.';

-- Allow authenticated users to execute (required for RLS evaluation)
revoke execute on function private.users_same_university(uuid, uuid) from public;
grant execute on function private.users_same_university(uuid, uuid) to authenticated;

-- Update policy to use the private helper
drop policy if exists clash_accounts_select_same_university on public.clash_accounts;
create policy clash_accounts_select_same_university on public.clash_accounts for
select to authenticated using (
    profile_id != auth.uid()
    and private.users_same_university(auth.uid(), profile_id)
);

-- Remove the old public helper to eliminate RPC access
drop function if exists public.users_same_university(uuid, uuid);
