-- RLS policies for ClashCampus
-- Goals:
-- - Public (anon) can read university-vs-university leaderboard
-- - Authenticated users can read:
--   - their own stats
--   - within-university player leaderboard (identifiable: username/avatar)
-- - No public top-individuals leaderboard
-- - Service role / backend jobs own all writes for rankings + verification data
-- ----------------------------
-- UNIVERSITIES (public-readable list for onboarding)
-- ----------------------------
alter table public.universities enable row level security;
alter table public.universities force row level security;
revoke all on table public.universities
from anon,
    authenticated;
grant select on table public.universities to anon,
    authenticated;
drop policy if exists universities_select_public on public.universities;
create policy universities_select_public on public.universities for
select to anon,
    authenticated using (true);
-- ----------------------------
-- UNIVERSITY RANKINGS (public university-vs-university leaderboard)
-- ----------------------------
alter table public.university_rankings enable row level security;
alter table public.university_rankings force row level security;
revoke all on table public.university_rankings
from anon,
    authenticated;
grant select on table public.university_rankings to anon,
    authenticated;
drop policy if exists university_rankings_select_public on public.university_rankings;
create policy university_rankings_select_public on public.university_rankings for
select to anon,
    authenticated using (true);
-- ----------------------------
-- PROFILES (id == auth.uid())
-- - Self-readable
-- - Same-university readable (to show username/avatar on within-university leaderboard)
-- - Insert self only
-- - Update only avatar_url (column-level privilege)
-- ----------------------------
alter table public.profiles enable row level security;
alter table public.profiles force row level security;
revoke all on table public.profiles
from anon,
    authenticated;
grant select,
    insert on table public.profiles to authenticated;
grant update (avatar_url) on table public.profiles to authenticated;
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for
select to authenticated using (id = auth.uid());
drop policy if exists profiles_select_same_university on public.profiles;
create policy profiles_select_same_university on public.profiles for
select to authenticated using (
        exists (
            select 1
            from public.profiles me
            where me.id = auth.uid()
                and me.university_id = profiles.university_id
        )
    );
drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles for
insert to authenticated with check (id = auth.uid());
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for
update to authenticated using (id = auth.uid()) with check (id = auth.uid());
-- ----------------------------
-- CLASH ACCOUNTS (1:1 with profiles)
-- - Used to join player_rankings -> profiles for within-university leaderboard.
-- - Allow SELECT only on safe columns (id, profile_id) to authenticated.
-- - Row visibility: self OR same-university.
-- - INSERT self only.
-- - No client UPDATE/DELETE (service role only).
-- ----------------------------
alter table public.clash_accounts enable row level security;
alter table public.clash_accounts force row level security;
revoke all on table public.clash_accounts
from anon,
    authenticated;
grant insert on table public.clash_accounts to authenticated;
grant select (id, profile_id) on table public.clash_accounts to authenticated;
drop policy if exists clash_accounts_select_self_or_same_university on public.clash_accounts;
create policy clash_accounts_select_self_or_same_university on public.clash_accounts for
select to authenticated using (
        profile_id = auth.uid()
        or exists (
            select 1
            from public.profiles me
                join public.profiles them on them.id = clash_accounts.profile_id
            where me.id = auth.uid()
                and me.university_id = them.university_id
        )
    );
drop policy if exists clash_accounts_insert_self on public.clash_accounts;
create policy clash_accounts_insert_self on public.clash_accounts for
insert to authenticated with check (profile_id = auth.uid());
-- ----------------------------
-- VERIFICATION SESSIONS (security-critical)
-- - Self-readable only via ownership of clash_account_id
-- - No client writes
-- ----------------------------
alter table public.verification_sessions enable row level security;
alter table public.verification_sessions force row level security;
revoke all on table public.verification_sessions
from anon,
    authenticated;
grant select on table public.verification_sessions to authenticated;
drop policy if exists verification_sessions_select_self on public.verification_sessions;
create policy verification_sessions_select_self on public.verification_sessions for
select to authenticated using (
        exists (
            select 1
            from public.clash_accounts ca
            where ca.id = verification_sessions.clash_account_id
                and ca.profile_id = auth.uid()
        )
    );
-- ----------------------------
-- PLAYER RANKINGS (latest snapshot per player)
-- - No public access
-- - Authenticated can read:
--   - their own row (via ownership of clash_account_id)
--   - same-university rows (within-university leaderboard)
-- - No client writes
-- ----------------------------
alter table public.player_rankings enable row level security;
alter table public.player_rankings force row level security;
revoke all on table public.player_rankings
from anon,
    authenticated;
grant select on table public.player_rankings to authenticated;
drop policy if exists player_rankings_select_own_or_same_university on public.player_rankings;
create policy player_rankings_select_own_or_same_university on public.player_rankings for
select to authenticated using (
        exists (
            select 1
            from public.clash_accounts ca
            where ca.id = player_rankings.clash_account_id
                and ca.profile_id = auth.uid()
        )
        or exists (
            select 1
            from public.profiles me
            where me.id = auth.uid()
                and me.university_id = player_rankings.university_id
        )
    );
-- ----------------------------
-- WRAPPED CARDS (personal history)
-- - Self-readable only
-- - No client writes
-- ----------------------------
alter table public.wrapped_cards enable row level security;
alter table public.wrapped_cards force row level security;
revoke all on table public.wrapped_cards
from anon,
    authenticated;
grant select on table public.wrapped_cards to authenticated;
drop policy if exists wrapped_cards_select_self on public.wrapped_cards;
create policy wrapped_cards_select_self on public.wrapped_cards for
select to authenticated using (
        exists (
            select 1
            from public.clash_accounts ca
            where ca.id = wrapped_cards.clash_account_id
                and ca.profile_id = auth.uid()
        )
    );