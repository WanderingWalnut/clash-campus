-- Expand column-level SELECT privileges on clash_accounts for authenticated users
-- Context: Server code reads player_tag, name, verified for verification flow
-- Existing policy restricts SELECT to (id, profile_id) only

-- Keep row visibility controlled by existing RLS policy
-- (clash_accounts_select_self_or_same_university), but allow safe columns.

grant select (id, profile_id, player_tag, name, verified)
on table public.clash_accounts to authenticated;

