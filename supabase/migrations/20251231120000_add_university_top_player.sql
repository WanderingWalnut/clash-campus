-- Add campus captain name to university rankings for public display.

alter table public.university_rankings
  add column if not exists top_player text;

with top_players as (
  select distinct on (pr.university_id)
    pr.university_id,
    ca.name as top_player
  from public.player_rankings pr
  join public.clash_accounts ca on pr.clash_account_id = ca.id
  order by
    pr.university_id,
    pr.ranking_score desc,
    pr.current_trophies desc,
    pr.wins desc
)
update public.university_rankings ur
set top_player = tp.top_player
from top_players tp
where ur.university_id = tp.university_id;
