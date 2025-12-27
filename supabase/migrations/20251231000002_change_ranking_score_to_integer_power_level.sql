-- Change ranking_score columns from numeric(10,2) to integer for POWER LEVEL system
-- POWER LEVEL scales from 0-100,000 (multiplied by 1000 from previous 0-100 scale)
-- This migration converts existing data by multiplying by 1000 and rounding to integers

-- Step 1: Migrate existing data in player_rankings
-- Multiply existing numeric values by 1000 and round to integer
update public.player_rankings
set ranking_score = round(ranking_score::numeric * 1000)::integer
where ranking_score is not null;

-- Step 2: Migrate existing data in university_rankings
-- Multiply total and average scores by 1000 and round to integer
update public.university_rankings
set total_ranking_score = round(total_ranking_score::numeric * 1000)::integer,
    average_ranking_score = round(average_ranking_score::numeric * 1000)::integer
where total_ranking_score is not null or average_ranking_score is not null;

-- Step 3: Change column types from numeric(10,2) to integer
alter table public.player_rankings
  alter column ranking_score type integer using ranking_score::integer;

alter table public.university_rankings
  alter column total_ranking_score type integer using total_ranking_score::integer,
  alter column average_ranking_score type integer using average_ranking_score::integer;

-- Step 4: Constraints remain valid (integer >= 0 works the same as numeric >= 0)
-- No need to drop/recreate constraints as they work with integer type

-- Note: wrapped_cards.ranking_score was never changed to numeric, so it remains integer
-- and doesn't need migration

