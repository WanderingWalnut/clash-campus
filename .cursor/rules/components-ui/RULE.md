---
description: "UI + component standards (ClashCampus brand, Tailwind conventions, composability)"
alwaysApply: false
globs:
  - "components/**"
  - "app/**"
---

## Brand identity (UI)
- **Tone**: competitive, prestigious, socially-driven (esports culture × university rivalry).
- **Slogans**:
  - Core: "Where Clash Becomes Culture"
  - Launch: "The Arena Just Moved to Campus"
- **Design**: minimal, elite, centered on social identity.

## Styling conventions
- **Dark mode by default** (no light mode required).
- Use Tailwind utilities consistently; prefer existing tokens/utility classes from `app/globals.css`.

### Color + accents
- **Primary purple**: `#4717F6` (hover `#350ec9`)
- **Gold accent**: `#FFD700`
- Backgrounds: `#0D0D0D` (main), `#121212` (cards)

### Typography
- Font: **Plus Jakarta Sans** (configured in `app/layout.tsx`).
- Headlines: bold, elite; body stays clean and readable.

## Component design principles
- Keep components **single-purpose** and reusable.
- Prefer Server Components; only use `'use client'` when interactivity/hook usage requires it.
- Use `components/<feature>/` for feature groupings and `index.ts` barrels when helpful.

## Canonical button styles (examples)
- **Primary CTA**:

```tsx
className="bg-[#4717F6] hover:bg-[#350ec9] text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 shadow-[0_0_20px_rgba(71,23,246,0.5)] hover:shadow-[0_0_30px_rgba(71,23,246,0.7)]"
```

- **Secondary CTA**:

```tsx
className="bg-white text-[#0D0D0D] hover:bg-[#FFD700] hover:text-black px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 transform hover:scale-105"
```

- **Glass button**:

```tsx
className="glass hover:bg-white/10 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300"
```
