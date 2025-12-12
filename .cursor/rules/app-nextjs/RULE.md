---
description: "Next.js App Router conventions for routes, layouts, and data/mutations"
alwaysApply: false
globs:
  - "app/**"
---

## Next.js 16 / App Router conventions
- **App Router only**: routes live in `app/`.
- **File conventions**:
  - `page.tsx`: route UI
  - `layout.tsx`: shared UI shell
  - `loading.tsx`: route-level loading
  - `error.tsx`: route-level error boundary
  - `route.ts`: API endpoints (Route Handlers)
- **Server Components by default**: only use `'use client'` when you need interactivity, hooks, or browser APIs.

## Mutations & backend boundaries
- Prefer **Server Actions** for mutations when it fits the flow.
- Use **Route Handlers** (`route.ts`) when you need an HTTP boundary (webhooks, public API, etc.).

## Route groups & organization
- Use route groups like `(auth)` to organize without affecting URLs.
- Use private folders like `_internal/` for non-routable code.

## SEO
- Implement proper `metadata` exports where relevant.

## Example patterns
- **Minimal page**:

```tsx
// app/rankings/page.tsx
export default function RankingsPage() {
  return <main>...</main>
}
```

- **Route handler shape**:

```ts
// app/api/health/route.ts
import { NextResponse } from 'next/server'

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ ok: true })
}
```
