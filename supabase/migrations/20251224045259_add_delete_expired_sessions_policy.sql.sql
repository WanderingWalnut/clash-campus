-- ----------------------------
-- Allow deletion of expired verification sessions
-- 
-- Grants DELETE permission and creates RLS policy allowing authenticated
-- users to delete their own expired verification sessions.
-- 
-- This enables automatic cleanup of expired sessions so users can
-- create new verification attempts after their sessions expire.
-- ----------------------------

-- Grant DELETE permission on verification_sessions to authenticated users
grant delete on table public.verification_sessions to authenticated;

-- Create DELETE policy that allows users to delete their own expired sessions
-- Expired means: status = 'expired' OR (status = 'pending' AND expires_at < now())
create policy verification_sessions_delete_expired_own 
on public.verification_sessions 
for delete 
to authenticated 
using (
    exists (
        select 1
        from public.clash_accounts ca
        where ca.id = verification_sessions.clash_account_id
            and ca.profile_id = auth.uid()
    )
    and (
        status = 'expired' 
        or (status = 'pending' and expires_at < now())
    )
);

comment on policy verification_sessions_delete_expired_own on public.verification_sessions is
'Allows authenticated users to delete their own expired verification sessions (status = expired OR pending sessions past expiration time).';

