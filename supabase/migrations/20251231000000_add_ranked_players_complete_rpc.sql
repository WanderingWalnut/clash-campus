-- ----------------------------
-- Enhanced RPC function for ranked players with user context
-- 
-- This function returns paginated ranked players along with the user's
-- ranking data (if not on current page) and total count in a single
-- JSONB response. This reduces API queries from 7 to 2.
-- 
-- Returns: JSONB with structure:
-- {
--   "players": [...],  // Array of ranked players for current page
--   "user": {...},     // User's ranking entry (if not on page, null otherwise)
--   "total": number    // Total count of players for pagination
-- }
-- 
-- Security: SECURITY INVOKER (respects RLS), validates university access
-- Efficiency: Single query with window functions (no N+1)
-- ----------------------------

create or replace function public.get_ranked_players_complete(
    p_university_id uuid,
    p_user_id uuid,
    p_limit int,
    p_offset int
)
returns jsonb
language plpgsql
security invoker
set search_path = public
stable
as $$
declare
    v_total bigint;
    v_user_clash_account_id uuid;
    v_user_in_page boolean := false;
    v_players jsonb;
    v_user_entry jsonb;
    v_page_players jsonb;
begin
    -- Validate that the caller is requesting their own university
    -- This is defense-in-depth (RLS already enforces this, but explicit is better)
    if not exists (
        select 1
        from public.profiles
        where id = auth.uid()
            and university_id = p_university_id
    ) then
        raise exception 'Access denied: can only view rankings for your own university';
    end if;

    -- Get total count for pagination
    select count(*) into v_total
    from public.player_rankings
    where university_id = p_university_id;

    -- Get user's clash_account_id if they have one
    -- This is needed to check if user is in the current page and to fetch their data
    select id into v_user_clash_account_id
    from public.clash_accounts
    where profile_id = p_user_id
    limit 1;

    -- Get paginated players with all joins and rank calculation
    -- Use a CTE to calculate ranks efficiently with window functions
    -- Calculate ranks once for all players, then slice for pagination
    with ranked_data as (
        select
            row_number() over (
                order by 
                    pr.ranking_score desc,
                    pr.current_trophies desc,
                    pr.wins desc
            ) as rank,
            pr.ranking_score,
            pr.current_trophies,
            pr.wins,
            pr.pol_current_league,
            pr.pol_best_league,
            ca.name as player_name,
            ca.player_tag,
            ca.profile_id,
            u.name as university_name,
            u.short_code as university_short_code,
            (pr.clash_account_id = v_user_clash_account_id) as is_user
        from public.player_rankings pr
        inner join public.clash_accounts ca on pr.clash_account_id = ca.id
        inner join public.universities u on pr.university_id = u.id
        where pr.university_id = p_university_id
    ),
    page_slice as (
        select *
        from ranked_data
        order by rank
        limit p_limit
        offset p_offset
    ),
    page_data as (
        select 
            jsonb_agg(
                jsonb_build_object(
                    'rank', rank,
                    'name', coalesce(player_name, 'Unknown Player'),
                    'tag', coalesce(player_tag, ''),
                    'university', coalesce(university_name, 'Unknown University'),
                    'universityShort', coalesce(university_short_code, 'N/A'),
                    'score', ranking_score,
                    'trophies', current_trophies,
                    'wins', wins,
                    'polCurrentLeague', coalesce(pol_current_league, 0),
                    'polBestLeague', coalesce(pol_best_league, 0),
                    'change', 'same',
                    'isUser', is_user
                ) order by rank
            ) as players,
            bool_or(is_user) as user_in_page
        from page_slice
    )
    select 
        players,
        user_in_page
    into v_page_players, v_user_in_page
    from page_data;

    -- Set players array (empty array if no results)
    v_players := coalesce(v_page_players, '[]'::jsonb);

    -- If user is not on the current page and has a clash account, calculate their rank
    -- Calculate rank across ALL players, then filter for the user
    if not v_user_in_page and v_user_clash_account_id is not null then
        with all_ranked as (
            select
                ca.profile_id,
                row_number() over (
                    order by 
                        pr.ranking_score desc,
                        pr.current_trophies desc,
                        pr.wins desc
                ) as rank,
                pr.ranking_score,
                pr.current_trophies,
                pr.wins,
                pr.pol_current_league,
                pr.pol_best_league,
                ca.name as player_name,
                ca.player_tag,
                u.name as university_name,
                u.short_code as university_short_code
            from public.player_rankings pr
            inner join public.clash_accounts ca on pr.clash_account_id = ca.id
            inner join public.universities u on pr.university_id = u.id
            where pr.university_id = p_university_id
        )
        select jsonb_build_object(
            'rank', rank,
            'name', coalesce(player_name, 'Unknown Player'),
            'tag', coalesce(player_tag, ''),
            'university', coalesce(university_name, 'Unknown University'),
            'universityShort', coalesce(university_short_code, 'N/A'),
            'score', ranking_score,
            'trophies', current_trophies,
            'wins', wins,
            'polCurrentLeague', coalesce(pol_current_league, 0),
            'polBestLeague', coalesce(pol_best_league, 0),
            'change', 'same',
            'isUser', true
        )
        into v_user_entry
        from all_ranked
        where profile_id = p_user_id
        limit 1;
    end if;

    -- Return complete result as JSONB
    return jsonb_build_object(
        'players', v_players,
        'user', v_user_entry,
        'total', v_total
    );
end;
$$;

comment on function public.get_ranked_players_complete(uuid, uuid, int, int) is
'Returns paginated ranked players with user context in a single JSONB response. Includes players array, user entry (if not on page), and total count. Reduces API queries from 7 to 2. Respects RLS policies and validates university access.';

revoke execute on function public.get_ranked_players_complete(uuid, uuid, int, int) from public;
grant execute on function public.get_ranked_players_complete(uuid, uuid, int, int) to authenticated;

