# AGENTS.md — guidance for AI coding agents working on this repo

## Project

Carsai YT Studio v3 — local-first YouTube creator platform.
**Stack**: Next.js 16 App Router · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · Zustand (persist) · Recharts · Framer Motion · Capacitor (Android) · Electron (desktop).

## Hard rules

1. **Single route SPA**: all UI lives under `src/app/page.tsx` → `src/components/studio/studio-app.tsx`; views are switched by internal router state (`nav-context.tsx`), NOT by Next.js routes. This is required for Capacitor static export.
2. **No backend**: no server-side data layer. External calls are client-side to official APIs (YouTube Data API v3, Gemini, Groq, OpenRouter, OpenAI, Anthropic, HF). Keys live only in the local Zustand vault (`store.ts`).
3. **i18n**: every user-visible string goes through `useI18n().t()` and must exist in ALL SIX dictionaries (pt/en/es/fr/de/it) in `src/lib/studio/i18n.tsx`.
4. **Design tokens**: use theme tokens (`--flame`, `--ember`, `--orchid`, shadcn variables). No raw hex outside `globals.css`.
5. **Icon imports**: verify icon names exist in the installed `lucide-react` version before using them.
6. **Zustand persist**: anything user-generated (edits, rules, planner) must be persisted via `useStudioStore`, not component state.

## File map

- `src/lib/studio/` — types, utils (formatting/i18n helpers), i18n, demo-data (deterministic), store (persist), youtube (API client), gapi (OAuth-gated endpoints), oauth (Google PKCE), ai (multi-provider + local demo brain), seo (scoring), automation (rule engine), updates (GitHub release checker)
- `src/components/studio/views/` — dashboard, analytics, content, video-detail, seo, community, ai-studio, automation, integrations, tools, settings
- `electron/` — main.cjs (loads APP_URL or spawns standalone server), preload.cjs
- `capacitor.config.ts` — webDir `out`; optional `CAP_SERVER_URL` remote shell

## Build targets

- Web: `npm run build` (standalone)
- Mobile: `npm run build:mobile` (`BUILD_TARGET=mobile` → static export to `out/`) — must remain exportable: no dynamic server code in `src/app`
- Desktop: `npm run electron:build` (electron-builder, config in `electron-builder.yml`)

## Verification checklist for agents

1. `npm run lint` → 0 errors
2. `npm run dev` → open `/`, complete onboarding in demo mode
3. Visit all 11 views; check console for errors
4. Test one automation: Automação → Simular eventos (rule run count must increment)
5. Mobile viewport 390×844: bottom nav works, no horizontal overflow

## Releases & docs (current situation — v3.3.0)

- `.github/workflows/release.yml` builds **5 jobs** on tags `v*`: web-linux (web.zip + AppImage/deb), windows (NSIS), macos (DMG), android (Capacitor → APK/AAB, native project generated in CI by `scripts/prepare-android.sh`) and publish (release + notes from CHANGELOG.md). Never ship a release missing platform assets.
- `.github/workflows/ci.yml` runs typecheck + lint + build on main/PRs — must pass before every tag.
- `ROADMAP.md` is the public roadmap: update it (shipped / in-progress / planned) with every release.
- `CHANGELOG.md` and the primary `README.md` are **English** (global project); per-language READMEs are `README.pt.md`, `README.es.md`, `README.fr.md`, `README.de.md`, `README.it.md`, `README.zh.md` — keep them in sync with the English one when features change.
- `android/` and `ios/` are generated in CI and git-ignored — do not commit them.
