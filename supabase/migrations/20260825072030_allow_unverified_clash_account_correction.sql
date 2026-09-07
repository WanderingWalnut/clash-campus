-- Students can correct their own Clash link before verification.
-- Verified links remain immutable through authenticated client access.
grant update (player_tag, name) on table public.clash_accounts to authenticated;

drop policy if exists clash_accounts_update_own_unverified on public.clash_accounts;
create policy clash_accounts_update_own_unverified
on public.clash_accounts
for update
to authenticated
using (
  profile_id = (select auth.uid())
  and verified = false
)
with check (
  profile_id = (select auth.uid())
  and verified = false
);

-- An unverified student can discard a pending deck session before correcting
-- their player tag. Existing expired-session cleanup remains available.
drop policy if exists verification_sessions_delete_expired_own on public.verification_sessions;
create policy verification_sessions_delete_expired_own
on public.verification_sessions
for delete
to authenticated
using (
  exists (
    select 1
    from public.clash_accounts ca
    where ca.id = verification_sessions.clash_account_id
      and ca.profile_id = (select auth.uid())
      and (
        status = 'expired'
        or (status = 'pending' and (expires_at < now() or ca.verified = false))
      )
  )
);

-- Player ranking rows are visible only after the viewer has verified a Clash
-- account. The existing same-university boundary remains in force.
drop policy if exists player_rankings_select_own_or_same_university on public.player_rankings;
create policy player_rankings_select_own_or_same_university
on public.player_rankings
for select
to authenticated
using (
  exists (
    select 1
    from public.clash_accounts viewer
    where viewer.profile_id = (select auth.uid())
      and viewer.verified = true
  )
  and (
    exists (
      select 1
      from public.clash_accounts owner
      where owner.id = player_rankings.clash_account_id
        and owner.profile_id = (select auth.uid())
    )
    or university_id = (select public.get_my_university_id())
  )
);
