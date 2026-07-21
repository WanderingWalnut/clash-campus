-- Restrict SECURITY DEFINER functions to the roles that actually use them.
-- New Supabase projects may grant EXECUTE directly to anon/authenticated,
-- so revoking only from PUBLIC is not sufficient.

-- Authenticated RPCs. Each function enforces ownership through auth.uid().
revoke execute on function public.record_verification_check(uuid, text, boolean)
from public, anon;
grant execute on function public.record_verification_check(uuid, text, boolean)
to authenticated;

revoke execute on function public.approve_verification_session(uuid)
from public, anon;
grant execute on function public.approve_verification_session(uuid)
to authenticated;

-- Used by authenticated RLS policies to avoid recursive profile lookups.
revoke execute on function public.get_my_university_id()
from public, anon;
grant execute on function public.get_my_university_id()
to authenticated;

-- Trigger-only functions must not be callable through the Data API.
revoke execute on function public.handle_new_user()
from public, anon, authenticated;

revoke execute on function public.sync_clash_name_to_profile_username()
from public, anon, authenticated;

revoke execute on function public.update_university_rankings_from_player_rankings()
from public, anon, authenticated;
