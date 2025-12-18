---
description: "Supabase conventions: clients, queries, types, and RLS-first mindset"
alwaysApply: false
globs:
  - "lib/**"
  - "supabase/**"
  - "app/**"
---

## Supabase is the primary backend
- Treat Supabase as the source of truth for persistence.
- Design with **RLS policies** in mind; avoid "client can do anything" assumptions.

## Where Supabase code should live
- Supabase clients/config:
  - `lib/supabase/client.ts` (browser client)
  - `lib/supabase/server.ts` (server client)
- DB types:
  - `lib/supabase/types.ts` (generated from Supabase schema)
- Queries:
  - `lib/supabase/queries/<feature>.ts` (feature-organized query modules)

## Error handling
- Always check and handle Supabase errors; surface actionable messages.
- Prefer typed return values and narrow error types instead of `any`.

## Example structure

```ts
// lib/supabase/queries/leaderboard.ts
export async function getUniversityLeaderboard(universityId: string) {
  // Query implementation
}
```
