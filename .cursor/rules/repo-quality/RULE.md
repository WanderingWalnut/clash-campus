---
description: "Repo-wide quality conventions (lint/TS hygiene, naming, env var safety)"
alwaysApply: false
---

## Code quality
- Fix TypeScript errors before considering work complete.
- Remove unused imports/variables.
- Prefer small functions (extract when a function grows past ~50 lines).
- Avoid deeply nested conditionals (use guard clauses / early returns).

## Naming conventions
- Components: `PascalCase` (e.g., `LeaderboardCard.tsx`)
- Functions/utilities: `camelCase` (e.g., `fetchLeaderboardData`)
- Types/Interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Directories: `kebab-case`

## Environment variables
- Use `.env.local` for dev.
- Never commit secrets.
- Access via `process.env` with appropriate typing.

## Git hygiene
- Keep commits focused and descriptive.
- Prefer conventional commits (e.g., `feat:`, `fix:`, `refactor:`).
