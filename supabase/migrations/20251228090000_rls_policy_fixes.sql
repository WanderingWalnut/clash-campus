-- ----------------------------
-- Fix profiles RLS recursion and apply RLS performance best practices
-- ----------------------------

create or replace function public.get_my_university_id()
returns uuid
language sql
security definer
set search_path = public
set row_security = off
as $$
  select university_id
  from public.profiles
  where id = (select auth.uid());
$$;

comment on function public.get_my_university_id is
'Returns the current user''s university_id. SECURITY DEFINER + row_security=off avoids RLS recursion.';

-- ----------------------------
-- PROFILES
-- ----------------------------
drop policy if exists profiles_select_own_or_same_university on public.profiles;
drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_select_same_university on public.profiles;
create policy profiles_select_own_or_same_university on public.profiles for
select to authenticated using (
    id = (select auth.uid())
    or university_id = (select public.get_my_university_id())
);

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles for
insert to authenticated with check (id = (select auth.uid()));

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for
update to authenticated using (id = (select auth.uid()))
with check (id = (select auth.uid()));

-- ----------------------------
-- CLASH ACCOUNTS
-- ----------------------------
drop policy if exists clash_accounts_select_self_or_same_university on public.clash_accounts;
drop policy if exists clash_accounts_select_self on public.clash_accounts;
drop policy if exists clash_accounts_select_same_university on public.clash_accounts;
create policy clash_accounts_select_self_or_same_university on public.clash_accounts for
select to authenticated using (
    profile_id = (select auth.uid())
    or private.users_same_university((select auth.uid()), profile_id)
);

drop policy if exists clash_accounts_insert_self on public.clash_accounts;
create policy clash_accounts_insert_self on public.clash_accounts for
insert to authenticated with check (profile_id = (select auth.uid()));

-- ----------------------------
-- VERIFICATION SESSIONS
-- ----------------------------
drop policy if exists verification_sessions_select_self on public.verification_sessions;
create policy verification_sessions_select_self on public.verification_sessions for
select to authenticated using (
    exists (
        select 1
        from public.clash_accounts ca
        where ca.id = verification_sessions.clash_account_id
            and ca.profile_id = (select auth.uid())
    )
);

drop policy if exists verification_sessions_insert_self on public.verification_sessions;
create policy verification_sessions_insert_self on public.verification_sessions for
insert to authenticated with check (
    exists (
        select 1
        from public.clash_accounts ca
        where ca.id = verification_sessions.clash_account_id
            and ca.profile_id = (select auth.uid())
    )
);

drop policy if exists verification_sessions_delete_expired_own on public.verification_sessions;
create policy verification_sessions_delete_expired_own on public.verification_sessions
for delete
to authenticated
using (
    exists (
        select 1
        from public.clash_accounts ca
        where ca.id = verification_sessions.clash_account_id
            and ca.profile_id = (select auth.uid())
    )
    and (
        status = 'expired'
        or (status = 'pending' and expires_at < now())
    )
);

-- ----------------------------
-- PLAYER RANKINGS
-- ----------------------------
drop policy if exists player_rankings_select_own_or_same_university on public.player_rankings;
create policy player_rankings_select_own_or_same_university on public.player_rankings for
select to authenticated using (
    exists (
        select 1
        from public.clash_accounts ca
        where ca.id = player_rankings.clash_account_id
            and ca.profile_id = (select auth.uid())
    )
    or exists (
        select 1
        from public.profiles me
        where me.id = (select auth.uid())
            and me.university_id = player_rankings.university_id
    )
);

-- ----------------------------
-- WRAPPED CARDS
-- ----------------------------
drop policy if exists wrapped_cards_select_self on public.wrapped_cards;
create policy wrapped_cards_select_self on public.wrapped_cards for
select to authenticated using (
    exists (
        select 1
        from public.clash_accounts ca
        where ca.id = wrapped_cards.clash_account_id
            and ca.profile_id = (select auth.uid())
    )
);
