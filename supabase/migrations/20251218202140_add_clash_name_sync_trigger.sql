-- ----------------------------
-- Trigger: Sync clash_accounts.name to profiles.username
-- 
-- Automatically syncs clash_accounts.name to profiles.username whenever:
-- - A clash_account is created (INSERT)
-- - A clash_account's name is updated (UPDATE of name column)
-- 
-- This ensures username always matches the Clash Royale in-game name
-- and cannot be manually changed by users (RLS prevents direct updates).
-- ----------------------------
-- Function to sync clash_accounts.name to profiles.username
create or replace function public.sync_clash_name_to_profile_username() returns trigger language plpgsql security definer
set search_path = public as $$ begin -- When clash_account is created or name is updated, sync to profile
    if TG_OP = 'INSERT'
    or (
        TG_OP = 'UPDATE'
        and NEW.name is distinct
        from OLD.name
    ) then
update public.profiles
set username = NEW.name
where id = NEW.profile_id;
end if;
return NEW;
end;
$$;
-- Trigger on clash_accounts to auto-sync name to profile
drop trigger if exists sync_clash_name_to_profile_username_trigger on public.clash_accounts;
create trigger sync_clash_name_to_profile_username_trigger
after
insert
    or
update of name on public.clash_accounts for each row execute function public.sync_clash_name_to_profile_username();
comment on function public.sync_clash_name_to_profile_username is 'Automatically syncs clash_accounts.name to profiles.username whenever a clash account is created or its name is updated. 
This ensures username always matches the Clash Royale in-game name and cannot be manually changed by users.';