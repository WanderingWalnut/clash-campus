-- Change ranking_score columns from int to numeric(10,2) to support decimal values

-- Update player_rankings.ranking_score
alter table public.player_rankings
  alter column ranking_score type numeric(10,2) using ranking_score::numeric(10,2);

-- Update university_rankings.total_ranking_score and average_ranking_score
alter table public.university_rankings
  alter column total_ranking_score type numeric(10,2) using total_ranking_score::numeric(10,2),
  alter column average_ranking_score type numeric(10,2) using average_ranking_score::numeric(10,2);

-- Update the check constraints to work with numeric
alter table public.player_rankings
  drop constraint if exists player_rankings_non_negative;

alter table public.player_rankings
  add constraint player_rankings_non_negative check (
    current_trophies >= 0
    and best_trophies >= 0
    and wins >= 0
    and losses >= 0
    and three_crown_wins >= 0
    and ranking_score >= 0
  );

alter table public.university_rankings
  drop constraint if exists university_rankings_non_negative;

alter table public.university_rankings
  add constraint university_rankings_non_negative check (
    player_count >= 0
    and total_ranking_score >= 0
    and average_ranking_score >= 0
  );

