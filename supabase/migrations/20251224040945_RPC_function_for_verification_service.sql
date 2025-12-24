-- ----------------------------
-- Verification RPCs
-- 
-- These functions allow the server to update verification state without
-- exposing update privileges to clients. Each function validates ownership
-- via auth.uid() and only allows safe transitions.
-- ----------------------------

-- Records a verification check result (failure or expiration) for the
-- current user's pending session.
create or replace function public.record_verification_check(
    p_session_id uuid,
    p_failure_reason text,
    p_mark_expired boolean default false
)
returns boolean
language plpgsql
security definer
set search_path = public
volatile
as $$
declare
    updated_id uuid;
begin
    update public.verification_sessions vs
    set
        last_checked_at = now(),
        failure_reason = p_failure_reason,
        status = case
            when p_mark_expired then 'expired'
            else vs.status
        end
    from public.clash_accounts ca
    where vs.id = p_session_id
        and vs.status = 'pending'
        and vs.clash_account_id = ca.id
        and ca.profile_id = auth.uid()
    returning vs.id into updated_id;

    return updated_id is not null;
end;
$$;

comment on function public.record_verification_check(uuid, text, boolean) is
'Updates last_checked_at and failure_reason for a pending verification session owned by the caller. Optionally marks the session expired.';

revoke execute on function public.record_verification_check(uuid, text, boolean) from public;
grant execute on function public.record_verification_check(uuid, text, boolean) to authenticated;

-- Approves a pending verification session and marks the related clash account verified.
create or replace function public.approve_verification_session(
    p_session_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
volatile
as $$
declare
    v_clash_account_id uuid;
begin
    update public.verification_sessions vs
    set
        status = 'approved',
        verified_at = now(),
        last_checked_at = now(),
        failure_reason = null
    from public.clash_accounts ca
    where vs.id = p_session_id
        and vs.status = 'pending'
        and (vs.expires_at is null or vs.expires_at > now())
        and vs.clash_account_id = ca.id
        and ca.profile_id = auth.uid()
    returning vs.clash_account_id into v_clash_account_id;

    if v_clash_account_id is null then
        return false;
    end if;

    update public.clash_accounts
    set
        verified = true,
        verified_at = now()
    where id = v_clash_account_id;

    if not found then
        return false;
    end if;

    return true;
end;
$$;

comment on function public.approve_verification_session(uuid) is
'Marks a pending verification session approved and updates the owning clash account as verified.';

revoke execute on function public.approve_verification_session(uuid) from public;
grant execute on function public.approve_verification_session(uuid) to authenticated;
