# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start dev server (scan QR for Expo Go, or press i/a for simulators)
npm start

# Run on specific platform
npm run android
npm run ios
npm run web

# Lint
npm run lint
```

No test suite is configured.

## Environment Variables

Create a `.env.local` file with:
```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

## Architecture

**Expo Router** (file-based routing) under `app/`. Tab routes in `app/(tabs)/` are thin wrappers — all screen logic lives in `components/screens/`.

**State management** uses Zustand stores in `stores/`:
- `useActivityStore` — CRUD for timed activities (synced to Supabase `activities` table)
- `useActivityHistoryStore` — autocomplete history of activity names (Supabase `activity_history` table)
- `useActivityEditStore` — UI-only state: controls the add/edit bottom sheet and tracks which event is being edited
- `useAlarmStore` — local-only notification schedule settings
- `useAuthStore` — Supabase session; auto signs in anonymously on first launch, upgradeable to Apple/Google

**Supabase layer** in `lib/`:
- `supabase.ts` — client singleton
- `supabase-activities.ts`, `supabase-activity-history.ts` — CRUD functions consumed by stores
- `supabase-auth.ts` — Apple/Google/anonymous auth helpers

**Calendar** uses `@howljs/calendar-kit` via the `ActivityTimeline` component + `useActivityTimeline` hook (Calendar tab / `index`). `utils/activityAdapter.ts` converts `Activity[]` to `EventItem[]` format via `activitiesToEvents`.

The timeline shares `useActivityStore` data and `useActivityEditStore` for the add/edit bottom sheet (`AddEventBottomSheet`). Tapping or long-pressing the calendar background opens the sheet; dragging events calls `updateActivity` directly.

**Theme** in `theme/` exports `colors`, `spacing`, `fonts`, `textStyles` — always import from `@/theme`. Palette is light-only (no dark mode currently).

**Path alias**: `@/` maps to the repo root (configured in `tsconfig.json`).

**React Compiler** is enabled (`experiments.reactCompiler: true` in `app.json`). The New Architecture is also enabled (`newArchEnabled: true`).
