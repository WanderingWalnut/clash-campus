-- ----------------------------
-- Trigger: Auto-create profile on user signup
-- 
-- Automatically creates a profile in public.profiles when a new user signs up.
-- Extracts the email domain from the user's email and looks up the matching university.
-- 
-- This follows Supabase best practices for user profile management:
-- https://supabase.com/docs/guides/auth/managing-user-data
-- ----------------------------
-- Function to handle new user creation
-- Uses SECURITY DEFINER to allow access to public schema tables from auth.users trigger
create or replace function public.handle_new_user() returns trigger language plpgsql security definer
set search_path = public as $$
declare email_domain text;
university_id_val uuid;
begin -- Extract email domain (part after @)
if new.email is null then raise warning 'handle_new_user: user email is null, skipping profile creation';
return new;
end if;
-- Extract domain from email
email_domain := lower(split_part(new.email, '@', 2));
if email_domain is null
or email_domain = '' then raise warning 'handle_new_user: could not extract domain from email: %',
new.email;
return new;
end if;
-- Look up university by email domain
select id into university_id_val
from public.universities
where universities.email_domain = email_domain
limit 1;
-- If university not found, log warning but don't fail signup
-- (This should be rare since signup validates university before creating user)
if university_id_val is null then raise warning 'handle_new_user: university not found for domain: %, user_id: %',
email_domain,
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
-- Trigger on auth.users to auto-create profile
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after
insert on auth.users for each row execute function public.handle_new_user();
comment on function public.handle_new_user is 'Automatically creates a profile in public.profiles when a new user signs up.
Extracts the email domain and looks up the matching university to set university_id.
Uses SECURITY DEFINER to allow access to public schema from auth.users trigger.';