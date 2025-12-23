# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js App Router (e.g., `(auth)/`, `auth/`, `rankings/`, `layout.tsx`).
- `components/`: UI modules (`auth/`, `landing/`, `rankings/`, `ui/`).
- `lib/`: Domain logic (`auth/`, `clash-royale/`, `supabase/` clients and `proxy`, `logger.ts`, `data/`).
- `hooks/`: Reusable client hooks (`use…`). `types/`: shared TypeScript types.
- `supabase/`: SQL migrations and email templates. `scripts/`: utilities (seed generation).
- `public/`: static assets. `proxy.ts`: Next.js 16 proxy (middleware) for session refresh.

## Build, Test, and Development Commands
- `npm run dev`: Start Next.js dev server at `http://localhost:3000`.
- `npm run build`: Production build. `npm run start`: Run built app.
- `npm run lint`: ESLint (Next.js core-web-vitals + TypeScript config).
- `supabase db reset`: Reset local DB and apply migrations in `supabase/migrations/`.
- `supabase gen types typescript --local > lib/supabase/types.ts`: Generate DB types.
- `node scripts/generate_university_seed.mjs > seed.sql`: Emit seed SQL from public dataset.

## Coding Style & Naming Conventions
- TypeScript + ES modules; 2-space indentation; no unused exports.
- Components in `components/` use PascalCase; hooks in `hooks/` start with `use…`.
- Prefer Server Components; add `"use client"` only when interactivity/state is needed.
- Keep domain logic in `lib/*`; co-locate minimal helpers; use `types/*` and generated `lib/supabase/types.ts` for strong typing.

## Testing Guidelines
- No test runner is configured yet. For new logic, include lightweight unit tests and propose `"test"`/CI scripts in your PR. Name files `*.test.ts`/`*.test.tsx`, colocated or under `__tests__/`.

## Commit & Pull Request Guidelines
- Commits: imperative, present tense, concise (e.g., "Add security headers", "Refactor signup validation").
- PRs: clear description, linked issues, screenshots for UI, steps to test, and notes for env/migrations.
- Call out security impact when touching auth, `proxy.ts`, Next headers, or RLS/migrations.

## Security & Configuration Tips
- Use `.env.local`; never commit secrets. Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Enforce access via `lib/supabase/server.ts` for server paths; use `lib/supabase/client.ts` only in Client Components.
- `proxy.ts` refreshes tokens and protects routes; keep `next.config.ts` security headers enabled.

