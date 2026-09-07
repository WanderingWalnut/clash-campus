-- Signup profile identity is assigned by the auth trigger, never by the student.
revoke insert on public.profiles from authenticated;

-- The trusted server reads only the identity fields needed by these RPCs.
grant usage on schema auth to service_role;
grant select (id, email, email_confirmed_at) on auth.users to service_role;

-- Only the trusted server creates challenges and approves a successful deck check.
revoke insert on public.clash_accounts from authenticated;
grant insert (profile_id, player_tag, name) on public.clash_accounts to authenticated;
revoke insert on public.verification_sessions from authenticated;
revoke execute on function public.approve_verification_session(uuid) from authenticated, anon, public;
drop function public.approve_verification_session(uuid);

-- Old pending challenges may have been supplied directly by a client.
update public.verification_sessions set status = 'expired' where status = 'pending';

create or replace function private.invalidate_changed_player_challenges()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.player_tag is distinct from old.player_tag then
    update public.verification_sessions set status = 'expired'
    where clash_account_id = new.id and status = 'pending';
  end if;
  return new;
end;
$$;
revoke all on function private.invalidate_changed_player_challenges() from public, anon, authenticated;
create trigger invalidate_changed_player_challenges
after update of player_tag on public.clash_accounts
for each row execute function private.invalidate_changed_player_challenges();

create function public.create_verification_challenge(
  p_user_id uuid, p_account_id uuid, p_player_tag text, p_required_deck jsonb
) returns table(id uuid, expires_at timestamptz)
language plpgsql security invoker set search_path = '' as $$
begin
  -- Re-check university identity for existing accounts as well as new signups.
  if not exists (
    select 1 from auth.users u
    join public.profiles p on p.id = u.id
    join public.universities uni on uni.id = p.university_id
    where u.id = p_user_id and u.email_confirmed_at is not null
      and lower(split_part(u.email, '@', 2)) = lower(uni.email_domain)
  ) then raise exception 'Confirmed university identity required'; end if;
  -- All trust-path operations lock the account before the session, in this order.
  perform 1 from public.clash_accounts ca
  where ca.id = p_account_id and ca.profile_id = p_user_id
    and ca.player_tag = p_player_tag and ca.verified = false
  for update;
  if not found then raise exception 'Account changed; restart verification'; end if;
  if jsonb_typeof(p_required_deck) is distinct from 'array'
    or jsonb_array_length(p_required_deck) <> 8 then
    raise exception 'Invalid required deck';
  end if;
  update public.verification_sessions set status = 'expired'
  where clash_account_id = p_account_id and status = 'pending';
  return query insert into public.verification_sessions(clash_account_id, required_deck, status, expires_at)
  values(p_account_id, p_required_deck, 'pending', now() + interval '24 hours')
  returning verification_sessions.id, verification_sessions.expires_at;
end;
$$;
revoke all on function public.create_verification_challenge(uuid,uuid,text,jsonb) from public, anon, authenticated;
grant execute on function public.create_verification_challenge(uuid,uuid,text,jsonb) to service_role;

create function public.approve_verification_session(
  p_session_id uuid, p_user_id uuid, p_player_tag text
) returns boolean language plpgsql security invoker set search_path = '' as $$
declare v_account_id uuid;
begin
  -- Re-check university identity for existing accounts as well as new signups.
  if not exists (
    select 1 from auth.users u
    join public.profiles p on p.id = u.id
    join public.universities uni on uni.id = p.university_id
    where u.id = p_user_id and u.email_confirmed_at is not null
      and lower(split_part(u.email, '@', 2)) = lower(uni.email_domain)
  ) then raise exception 'Confirmed university identity required'; end if;
  select ca.id into v_account_id from public.clash_accounts ca
  join public.verification_sessions vs on vs.clash_account_id = ca.id
  where vs.id = p_session_id and ca.profile_id = p_user_id
    and ca.player_tag = p_player_tag and ca.verified = false
  for update of ca;
  if not found then return false; end if;
  update public.verification_sessions set status = 'approved', verified_at = now(),
    last_checked_at = now(), failure_reason = null
  where id = p_session_id and clash_account_id = v_account_id
    and status = 'pending' and expires_at > now();
  if not found then return false; end if;
  update public.clash_accounts set verified = true, verified_at = now()
  where id = v_account_id;
  return true;
end;
$$;
revoke all on function public.approve_verification_session(uuid,uuid,text) from public, anon, authenticated;
grant execute on function public.approve_verification_session(uuid,uuid,text) to service_role;
