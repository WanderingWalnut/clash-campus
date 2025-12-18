-- ClashCampus initial schema
-- Note: RLS policies will be added next.
-- Enable uuid generation (gen_random_uuid)
create extension if not exists "pgcrypto";
-- ----------------------------
-- Helper: updated_at trigger
-- ----------------------------
create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now();
return new;
end;
$$;
-- ----------------------------
-- Universities
-- ----------------------------
create table if not exists public.universities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_code text not null,
  email_domain text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists universities_email_domain_unique on public.universities (email_domain);
create unique index if not exists universities_short_code_unique on public.universities (short_code);
create trigger universities_set_updated_at before
update on public.universities for each row execute function public.set_updated_at();
-- ----------------------------
-- Profiles (1:1 with auth.users)
-- id == auth.uid()
--
-- username is set from the Clash API after verification and is not user-editable.
-- It starts NULL during onboarding until the Clash account is verified.
-- ----------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  university_id uuid not null references public.universities(id),
  username text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Enforce uniqueness only once username is set
create unique index if not exists profiles_username_unique on public.profiles (username)
where username is not null;
create index if not exists profiles_university_id_idx on public.profiles (university_id);
create trigger profiles_set_updated_at before
update on public.profiles for each row execute function public.set_updated_at();
-- ----------------------------
-- Clash Accounts (1:1 with profiles)
--
-- Stores the verified Clash account identity (player_tag) + verification metadata.
-- name is the in-game name fetched from the Clash API.
-- ----------------------------
create table if not exists public.clash_accounts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  player_tag text not null,
  name text,
  verified boolean not null default false,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint clash_accounts_player_tag_non_empty check (length(trim(player_tag)) > 0)
);
-- enforce 1:1 profile -> clash account
create unique index if not exists clash_accounts_profile_unique on public.clash_accounts (profile_id);
-- one player_tag can only belong to one profile
create unique index if not exists clash_accounts_player_tag_unique on public.clash_accounts (player_tag);
create trigger clash_accounts_set_updated_at before
update on public.clash_accounts for each row execute function public.set_updated_at();
-- ----------------------------
-- Verification Sessions (1:M with clash_accounts)
-- ----------------------------
create table if not exists public.verification_sessions (
  id uuid primary key default gen_random_uuid(),
  clash_account_id uuid not null references public.clash_accounts(id) on delete cascade,
  status text not null,
  -- pending, approved, rejected, expired
  required_deck jsonb,
  started_at timestamptz not null default now(),
  expires_at timestamptz,
  verified_at timestamptz,
  failure_reason text,
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint verification_sessions_status_check check (
    status in ('pending', 'approved', 'rejected', 'expired')
  )
);
create index if not exists verification_sessions_clash_account_idx on public.verification_sessions (clash_account_id);
create index if not exists verification_sessions_status_idx on public.verification_sessions (status);
create trigger verification_sessions_set_updated_at before
update on public.verification_sessions for each row execute function public.set_updated_at();
-- ----------------------------
-- Player Rankings (1:1 with clash_accounts) - snapshot of latest stats
-- Public-readable for leaderboards; write-controlled later via RLS
-- ----------------------------
create table if not exists public.player_rankings (
  id uuid primary key default gen_random_uuid(),
  clash_account_id uuid not null references public.clash_accounts(id) on delete cascade,
  university_id uuid not null references public.universities(id),
  current_trophies int not null default 0,
  best_trophies int not null default 0,
  wins int not null default 0,
  losses int not null default 0,
  three_crown_wins int not null default 0,
  ranking_score int not null default 0,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint player_rankings_non_negative check (
    current_trophies >= 0
    and best_trophies >= 0
    and wins >= 0
    and losses >= 0
    and three_crown_wins >= 0
    and ranking_score >= 0
  )
);
-- enforce 1:1 clash_account -> player_rankings
create unique index if not exists player_rankings_clash_account_unique on public.player_rankings (clash_account_id);
create index if not exists player_rankings_university_score_idx on public.player_rankings (university_id, ranking_score desc);
create trigger player_rankings_set_updated_at before
update on public.player_rankings for each row execute function public.set_updated_at();
-- ----------------------------
-- Wrapped Cards (1:M with clash_accounts) - yearly or card_type snapshots
-- ----------------------------
create table if not exists public.wrapped_cards (
  id uuid primary key default gen_random_uuid(),
  clash_account_id uuid not null references public.clash_accounts(id) on delete cascade,
  university_id uuid not null references public.universities(id),
  year int not null,
  card_type text not null,
  trophies int not null default 0,
  best_trophies int not null default 0,
  wins int not null default 0,
  losses int not null default 0,
  three_crown_wins int not null default 0,
  ranking_score int not null default 0,
  image_url text,
  created_at timestamptz not null default now(),
  constraint wrapped_cards_year_reasonable check (
    year >= 2000
    and year <= 3000
  ),
  constraint wrapped_cards_non_negative check (
    trophies >= 0
    and best_trophies >= 0
    and wins >= 0
    and losses >= 0
    and three_crown_wins >= 0
    and ranking_score >= 0
  )
);
create index if not exists wrapped_cards_clash_account_idx on public.wrapped_cards (clash_account_id);
create index if not exists wrapped_cards_university_year_idx on public.wrapped_cards (university_id, year);
-- prevent duplicates per (account, year, card_type)
create unique index if not exists wrapped_cards_unique_per_period on public.wrapped_cards (clash_account_id, year, card_type);
-- ----------------------------
-- University Rankings (1:1 with universities) - aggregate leaderboard
-- ----------------------------
create table if not exists public.university_rankings (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id) on delete cascade,
  player_count int not null default 0,
  total_ranking_score int not null default 0,
  average_ranking_score int not null default 0,
  rank int,
  last_calculated timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint university_rankings_non_negative check (
    player_count >= 0
    and total_ranking_score >= 0
    and average_ranking_score >= 0
  )
);
create unique index if not exists university_rankings_university_unique on public.university_rankings (university_id);
create trigger university_rankings_set_updated_at before
update on public.university_rankings for each row execute function public.set_updated_at();