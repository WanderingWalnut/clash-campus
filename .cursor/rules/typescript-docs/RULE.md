---
description: "TypeScript standards + documentation (types, interfaces, JSDoc for exports)"
alwaysApply: false
globs:
  - "**/*.ts"
  - "**/*.tsx"
---

## TypeScript standards
- Use TypeScript for all new code.
- Prefer **explicit parameter and return types** for exported functions.
- Avoid `any` (use `unknown` + narrowing when needed).
- Use `interface` for object shapes, `type` for unions/intersections.
- Put shared types in `types/` and export them for reuse.

## Documentation expectations
### Exported functions
Add JSDoc for exported functions:
- Brief description
- `@param` for each parameter
- `@returns`
- `@throws` when applicable

Example:

```ts
/**
 * Fetches the top N players from the leaderboard for a specific university.
 *
 * @param universityId - The unique identifier of the university.
 * @param limit - Maximum number of entries to return.
 * @returns Promise resolving to an array of leaderboard entries.
 * @throws {Error} If the query fails.
 */
export async function fetchUniversityLeaderboard(
  universityId: string,
  limit: number = 100,
): Promise<unknown[]> {
  // ...
  return []
}
```

### Components
- Define a Props interface (`<ComponentName>Props`).
- Document props for exported components when non-trivial.
