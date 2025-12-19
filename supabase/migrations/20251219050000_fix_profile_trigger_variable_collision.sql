-- ----------------------------
-- Fix: Variable naming collision in handle_new_user trigger
-- 
-- The original function used 'email_domain' as a variable name, which collides
-- with the 'email_domain' column in public.universities. This caused the
-- university lookup to fail silently.
-- 
-- Fix: Renamed variable to 'user_email_domain' and added table alias for clarity.
-- ----------------------------
create or replace function public.handle_new_user() returns trigger language plpgsql security definer
set search_path = public as $$
declare user_email_domain text;
university_id_val uuid;
begin -- Extract email domain (part after @)
if new.email is null then raise warning 'handle_new_user: user email is null, skipping profile creation';
return new;
end if;
-- Extract domain from email
user_email_domain := lower(split_part(new.email, '@', 2));
if user_email_domain is null
or user_email_domain = '' then raise warning 'handle_new_user: could not extract domain from email: %',
new.email;
return new;
end if;
-- Look up university by email domain
select u.id into university_id_val
from public.universities u
where u.email_domain = user_email_domain
limit 1;
-- If university not found, log warning but don't fail signup
-- (This should be rare since signup validates university before creating user)
if university_id_val is null then raise warning 'handle_new_user: university not found for domain: %, user_id: %',
user_email_domain,
new.id;
return new;
end if;
-- Create profile with university_id
insert into public.profiles (id, university_id)
values (new.id, university_id_val);
return new;
exception
when others then -- Log error but don't fail user creation
-- This ensures signup can complete even if profile creation fails
raise warning 'handle_new_user: error creating profile for user %: %',
new.id,
sqlerrm;
return new;
end;
$$;