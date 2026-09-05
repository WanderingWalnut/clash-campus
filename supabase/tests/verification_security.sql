-- Run against a disposable database after every migration. Never uses live students.
begin;
insert into auth.users(id,email,email_confirmed_at)
select '00000000-0000-0000-0000-000000000001', 'security-fixture@' || email_domain, now()
from public.universities limit 1;

insert into auth.users(id,email,email_confirmed_at)
select '00000000-0000-0000-0000-000000000004', 'other-fixture@' || email_domain, now()
from public.universities limit 1;

set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
do $$ begin
  begin
    insert into public.profiles(id, university_id)
    select '00000000-0000-0000-0000-000000000001', id from public.universities limit 1;
    raise exception 'FAIL: authenticated university identity INSERT allowed';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.clash_accounts(profile_id,player_tag,name,verified)
    values('00000000-0000-0000-0000-000000000001','#BYPASS','Fixture',true);
    raise exception 'FAIL: authenticated verified INSERT allowed';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.clash_accounts(profile_id,player_tag,name,verified_at)
    values('00000000-0000-0000-0000-000000000001','#BYPASS','Fixture',now());
    raise exception 'FAIL: authenticated verification timestamp INSERT allowed';
  exception when insufficient_privilege then null; end;
end $$;
insert into public.clash_accounts(profile_id,player_tag,name)
values('00000000-0000-0000-0000-000000000001','#ORIGINAL','Fixture');
select set_config('test.account',id::text,true) from public.clash_accounts
where profile_id='00000000-0000-0000-0000-000000000001';
do $$ begin
  begin
    insert into public.verification_sessions(clash_account_id,status,required_deck,expires_at)
    values(current_setting('test.account')::uuid,'pending','[]',now()+interval '1 hour');
    raise exception 'FAIL: authenticated challenge INSERT allowed';
  exception when insufficient_privilege then null; end;
  begin
    perform public.create_verification_challenge('00000000-0000-0000-0000-000000000001',current_setting('test.account')::uuid,'#ORIGINAL','[1,2,3,4,5,6,7,8]');
    raise exception 'FAIL: authenticated challenge RPC allowed';
  exception when insufficient_privilege then null; end;
  begin
    perform public.approve_verification_session(gen_random_uuid(),'00000000-0000-0000-0000-000000000001','#ORIGINAL');
    raise exception 'FAIL: authenticated approval RPC allowed';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role service_role;
select set_config('test.session',id::text,true)
from public.create_verification_challenge('00000000-0000-0000-0000-000000000001',current_setting('test.account')::uuid,'#ORIGINAL','[1,2,3,4,5,6,7,8]');
do $$ begin
  begin
    perform public.approve_verification_session(current_setting('test.session')::uuid,'00000000-0000-0000-0000-000000000099','#ORIGINAL');
    raise exception 'FAIL: approval accepts unknown student';
  exception when raise_exception then
    if sqlerrm <> 'Confirmed university identity required' then raise; end if;
  end;
  if public.approve_verification_session(current_setting('test.session')::uuid,'00000000-0000-0000-0000-000000000004','#ORIGINAL') then
    raise exception 'FAIL: approval accepts another confirmed student'; end if;
  if public.approve_verification_session(current_setting('test.session')::uuid,'00000000-0000-0000-0000-000000000001','#OTHER') then
    raise exception 'FAIL: approval accepts changed player tag'; end if;
end $$;
reset role;
update auth.users set email_confirmed_at = null where id='00000000-0000-0000-0000-000000000001';
set local role service_role;
do $$ begin
  begin
    perform public.approve_verification_session(current_setting('test.session')::uuid,'00000000-0000-0000-0000-000000000001','#ORIGINAL');
    raise exception 'FAIL: unconfirmed email accepted';
  exception when raise_exception then
    if sqlerrm <> 'Confirmed university identity required' then raise; end if;
  end;
end $$;
reset role;
update auth.users set email_confirmed_at=now(), email='fixture@unknown.invalid' where id='00000000-0000-0000-0000-000000000001';
set local role service_role;
do $$ begin
  begin
    perform public.create_verification_challenge('00000000-0000-0000-0000-000000000001',current_setting('test.account')::uuid,'#ORIGINAL','[1,2,3,4,5,6,7,8]');
    raise exception 'FAIL: forged university identity accepted';
  exception when raise_exception then
    if sqlerrm <> 'Confirmed university identity required' then raise; end if;
  end;
end $$;
reset role;
update auth.users u set email='security-fixture@' || uni.email_domain
from public.profiles p join public.universities uni on uni.id=p.university_id
where u.id=p.id and u.id='00000000-0000-0000-0000-000000000001';
set local role authenticated;
update public.clash_accounts set player_tag='#CORRECTED'  where id=current_setting('test.account')::uuid;
reset role;
set local role service_role;
do $$ begin
  if public.approve_verification_session(current_setting('test.session')::uuid,'00000000-0000-0000-0000-000000000001','#CORRECTED') then
    raise exception 'FAIL: old challenge survives tag correction'; end if;
end $$;
reset role;
update public.verification_sessions set status='pending', expires_at=now()-interval '1 second'
where id=current_setting('test.session')::uuid;
set local role service_role;
do $$ begin
  if public.approve_verification_session(current_setting('test.session')::uuid,'00000000-0000-0000-0000-000000000001','#CORRECTED') then
    raise exception 'FAIL: expired challenge accepted'; end if;
end $$;
select set_config('test.session',id::text,true)
from public.create_verification_challenge('00000000-0000-0000-0000-000000000001',current_setting('test.account')::uuid,'#CORRECTED','[1,2,3,4,5,6,7,8]');
do $$ begin
  if not public.approve_verification_session(current_setting('test.session')::uuid,'00000000-0000-0000-0000-000000000001','#CORRECTED') then
    raise exception 'FAIL: legitimate server approval rejected'; end if;
  if public.approve_verification_session(current_setting('test.session')::uuid,'00000000-0000-0000-0000-000000000001','#CORRECTED') then
    raise exception 'FAIL: challenge replay accepted'; end if;
end $$;
reset role;
set local role authenticated;
do $$ declare affected integer; begin
  update public.clash_accounts set player_tag='#LOCKBYPASS' where id=current_setting('test.account')::uuid;
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'FAIL: verified account changed'; end if;
end $$;
reset role;
select 'PASS: verification permissions, ownership, tag correction, legitimate approval, replay, and verified lock' as result;
rollback;
