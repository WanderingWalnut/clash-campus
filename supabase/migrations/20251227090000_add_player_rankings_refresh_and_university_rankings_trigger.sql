-- Add refresh + scoring fields to player_rankings and incremental university_rankings updates

alter table public.player_rankings
  add column if not exists pol_current_league int not null default 0,
  add column if not exists pol_best_league int not null default 0,
  add column if not exists refresh_attempts int not null default 0,
  add column if not exists next_refresh_at timestamptz,
  add column if not exists snapshot jsonb,
  add column if not exists score_version text not null default 'v1',
  add column if not exists last_error text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'player_rankings_pol_current_league_range'
  ) then
    alter table public.player_rankings
      add constraint player_rankings_pol_current_league_range
        check (pol_current_league >= 0 and pol_current_league <= 10);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'player_rankings_pol_best_league_range'
  ) then
    alter table public.player_rankings
      add constraint player_rankings_pol_best_league_range
        check (pol_best_league >= 0 and pol_best_league <= 10);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'player_rankings_refresh_attempts_non_negative'
  ) then
    alter table public.player_rankings
      add constraint player_rankings_refresh_attempts_non_negative
        check (refresh_attempts >= 0);
  end if;
end $$;

create index if not exists player_rankings_next_refresh_at_idx
  on public.player_rankings (next_refresh_at);

-- Incremental updates for university_rankings
create or replace function public.update_university_rankings_from_player_rankings()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.university_rankings (
      university_id,
      player_count,
      total_ranking_score,
      average_ranking_score,
      last_calculated
    )
    values (
      new.university_id,
      1,
      new.ranking_score,
      new.ranking_score,
      now()
    )
    on conflict (university_id) do update
      set player_count = university_rankings.player_count + 1,
          total_ranking_score = university_rankings.total_ranking_score + new.ranking_score,
          average_ranking_score = round(
            (university_rankings.total_ranking_score + new.ranking_score)::numeric
            / (university_rankings.player_count + 1)
          ),
          last_calculated = now();

    return new;
  elsif (tg_op = 'UPDATE') then
    if new.university_id = old.university_id then
      update public.university_rankings
        set total_ranking_score = total_ranking_score + (new.ranking_score - old.ranking_score),
            average_ranking_score = case
              when player_count > 0 then round(
                (total_ranking_score + (new.ranking_score - old.ranking_score))::numeric
                / player_count
              )
              else 0
            end,
            last_calculated = now()
      where university_id = new.university_id;
    else
      update public.university_rankings
        set player_count = case when player_count > 0 then player_count - 1 else 0 end,
            total_ranking_score = case
              when total_ranking_score >= old.ranking_score then total_ranking_score - old.ranking_score
              else 0
            end,
            average_ranking_score = case
              when player_count - 1 > 0 and total_ranking_score >= old.ranking_score then round(
                (total_ranking_score - old.ranking_score)::numeric
                / (player_count - 1)
              )
              else 0
            end,
            last_calculated = now()
      where university_id = old.university_id;

      insert into public.university_rankings (
        university_id,
        player_count,
        total_ranking_score,
        average_ranking_score,
        last_calculated
      )
      values (
        new.university_id,
        1,
        new.ranking_score,
        new.ranking_score,
        now()
      )
      on conflict (university_id) do update
        set player_count = university_rankings.player_count + 1,
            total_ranking_score = university_rankings.total_ranking_score + new.ranking_score,
            average_ranking_score = round(
              (university_rankings.total_ranking_score + new.ranking_score)::numeric
              / (university_rankings.player_count + 1)
            ),
            last_calculated = now();
    end if;

    return new;
  elsif (tg_op = 'DELETE') then
    update public.university_rankings
      set player_count = case when player_count > 0 then player_count - 1 else 0 end,
          total_ranking_score = case
            when total_ranking_score >= old.ranking_score then total_ranking_score - old.ranking_score
            else 0
          end,
          average_ranking_score = case
            when player_count - 1 > 0 and total_ranking_score >= old.ranking_score then round(
              (total_ranking_score - old.ranking_score)::numeric
              / (player_count - 1)
            )
            else 0
          end,
          last_calculated = now()
    where university_id = old.university_id;

    return old;
  end if;

  return null;
end;
$$;

comment on function public.update_university_rankings_from_player_rankings is
'Incrementally updates university_rankings totals and averages when player_rankings rows change.';

drop trigger if exists player_rankings_update_university_rankings on public.player_rankings;
create trigger player_rankings_update_university_rankings
after insert or update or delete on public.player_rankings
for each row execute function public.update_university_rankings_from_player_rankings();
