-- ----------------------------
-- RPC function for ranked players with efficient rank calculation
-- 
-- This function uses a window function to calculate ranks efficiently
-- in a single query, avoiding N+1 query problems. It respects RLS
-- policies and validates that users can only view rankings for their
-- own university.
-- ----------------------------

create or replace function public.get_ranked_players(
    p_university_id uuid,
    p_limit int,
    p_offset int
)
returns table (
    rank bigint,
    ranking_score numeric,
    current_trophies int,
    wins int,
    pol_current_league int,
    pol_best_league int,
    player_name text,
    player_tag text,
    profile_id uuid,
    university_name text,
    university_short_code text
)
language plpgsql
security invoker
set search_path = public
stable
as $$
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

    return query
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
        u.short_code as university_short_code
    from public.player_rankings pr
    inner join public.clash_accounts ca on pr.clash_account_id = ca.id
    inner join public.universities u on pr.university_id = u.id
    where pr.university_id = p_university_id
    order by 
        pr.ranking_score desc,
        pr.current_trophies desc,
        pr.wins desc
    limit p_limit
    offset p_offset;
end;
$$;

comment on function public.get_ranked_players(uuid, int, int) is
'Returns ranked players for a university with efficient rank calculation using window functions. Respects RLS policies and validates university access.';

revoke execute on function public.get_ranked_players(uuid, int, int) from public;
grant execute on function public.get_ranked_players(uuid, int, int) to authenticated;

