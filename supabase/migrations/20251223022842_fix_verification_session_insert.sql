-- ----------------------------
-- Fix: Allow authenticated users to insert verification sessions
-- 
-- Users should be able to create verification sessions for their own
-- clash_accounts only. This fixes the "permission denied" error when
-- initiating verification.
-- ----------------------------
-- Grant INSERT permission to authenticated users
grant insert on table public.verification_sessions to authenticated;
-- Policy: Users can only insert sessions for their own clash_accounts
drop policy if exists verification_sessions_insert_self on public.verification_sessions;
create policy verification_sessions_insert_self on public.verification_sessions for
insert to authenticated with check (
        exists (
            select 1
            from public.clash_accounts ca
            where ca.id = verification_sessions.clash_account_id
                and ca.profile_id = auth.uid()
        )
    );
comment on policy verification_sessions_insert_self on public.verification_sessions is 'Users can only create verification sessions for their own clash_accounts.';