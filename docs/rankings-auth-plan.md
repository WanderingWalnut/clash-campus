# Rankings Auth + Data Plan

## Goals
- Show the university leaderboard to everyone.
- Show the individual leaderboard only to authenticated users.
- Move data loading to API routes for consistency and cache control.
- Keep queries performant and avoid constant Supabase requests.

## Current State
- `app/rankings/page.tsx` renders static components and does not load data.
- Auth state is available via `components/providers/AuthProvider.tsx` (`useAuth()` hook).

## Proposed Architecture
### 1) Client-Side Composition
- Create a client component (e.g. `components/rankings/RankingsClient.tsx`) that:
  - Uses `useAuth()` to determine if the user is logged in.
  - Fetches public university rankings on mount.
  - Fetches individual rankings only when `user` is present.
  - Renders loading, empty, and error states.
- Update `app/rankings/page.tsx` to render the new client component.

### 2) API Routes (GET)
- `app/api/rankings/universities/route.ts`
  - Returns university leaderboard data.
  - Safe for public use (RLS allows anon/authenticated access).
- `app/api/rankings/players/route.ts`
  - Returns individual leaderboard data scoped to the user’s university.
  - Validates session and returns 401 if unauthenticated.

## Data Access Approach
- Use server-side Supabase client (`lib/supabase/server.ts`) in both route handlers.
- For `players` route:
  - Use `supabase.auth.getUser()` to ensure authenticated access.
  - Query the player rankings with joins on `profiles` (or use a view if needed).
  - RLS should enforce same-university visibility.

## Caching + Performance Strategy
### Public University Rankings
- Enable HTTP caching with `export const revalidate = 60` (or 300) in the route handler.
- Use `Cache-Control: public, max-age=0, s-maxage=60, stale-while-revalidate=300`.
- Optionally use `unstable_cache` for DB calls to avoid repeat queries per request.

### Authenticated Player Rankings
- Do NOT use shared static caching (user-specific).
- Use `Cache-Control: private, max-age=30, stale-while-revalidate=60`.
- Use `unstable_cache` with a cache key that includes the user id to avoid cross-user leaks.
- Consider client-side caching with SWR or React Query to prevent refetch on tab focus.

### Query Optimization
- Select only the columns needed for the leaderboard.
- Apply `limit` and sort at the DB level.
- Ensure indexes exist for `player_rankings.university_id`, `player_rankings.ranking_score`.

## UI/UX Considerations
- Show a public leaderboard immediately.
- For authenticated users, progressively enhance with the individual leaderboard.
- If user is not logged in, show a subtle prompt or CTA to sign in for player rankings.

## Open Questions
- Expected refresh interval for leaderboards (e.g., 30s vs 5m)?
- Do we need pagination for player rankings?
- Should the player leaderboard show only top N or allow filters?

## Implementation Steps
1) Add the two API route handlers.
2) Create the client component that fetches and renders data.
3) Update `app/rankings/page.tsx` to use the client component.
4) Add basic loading/error states for both leaderboards.
5) Verify RLS behavior for authenticated queries.
