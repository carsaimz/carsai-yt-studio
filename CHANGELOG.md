# Changelog — Carsai YT Studio

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versioning follows [SemVer](https://semver.org/).

## [3.3.0] — 2026-11-16

### Added

- **Android release builds** — the release workflow now builds the Capacitor app (APK + AAB, generated native project, debug-signed for direct install) fixing the missing APK asset in v3.x releases
- **Windows installer** (NSIS) and **macOS DMG** Electron builds — releases now cover Linux, Windows, macOS, Android and web in one pipeline
- **Three new UI languages** — Français, Deutsch and Italiano join PT/EN/ES (full dictionaries in `src/lib/studio/i18n.tsx`)
- **Public ROADMAP.md** — shipped / in-progress / planned items (OAuth write actions, deeper analytics, encrypted device sync, team mode via WebRTC/P2P, more languages, Playwright E2E) open for community feedback

### Changed

- CHANGELOG, README and project docs now use English as the primary language (global project); translated READMEs live in per-language files
- Release notes extraction updated for the multi-platform pipeline

### Fixed

- `ci.yml` branch filters hardened; release notes step moved to the publish job

## [3.2.0] — 2026-11-16

### Added

- **Google OAuth 2.0** — connect the Google account with PKCE using the user's own OAuth client (credentials and tokens stay on the device only); automatic loopback capture on Electron (redirect `http://localhost:8765/`) and manual code paste anywhere else; refresh token applied automatically when the access token expires
- **YouTube Analytics API v2** — new **Live · Analytics** tab in the Analytics view: real daily channel reports (views, watch minutes, subscribers gained/lost, likes, comments, shares) and top videos of the period, with charts and CSV export
- **OAuth-gated Data API features** — own playlists (`mine=true`) and channel captions via OAuth token (`gapi.ts`)
- **Explicit web demo mode** — opened in a normal browser the platform enters testing/demonstration mode: permanent banner with app download link, "Live" switch blocked with explanation, adapted onboarding and OAuth section disabled on web
- **Update checker** — queries the latest GitHub release at startup and shows a toast with a link when a newer version exists
- **Electron** — `carsai:oauth-loopback` IPC in the main process (secure loopback server, 5 min timeout) + preload with `contextIsolation`

### Improved

- Onboarding distinguishes the web demo ("Connect channel" card disabled with a full-access note for installed apps) from the installed apps
- Persisted store **v5** with `googleAuth` state and automatic v3/v4→v5 migration
- i18n (PT/EN/ES) complete for all new screens (OAuth, live analytics, web banner, updates)

### Notes

- The web version remains **testing and demonstration only** — full functionality (real data, OAuth, automation) runs on Electron (desktop) and Capacitor (mobile)

## [3.1.0] — 2026-11-15

### Added

- **YouTube Hub** — new view with the full YouTube Data API v3: trending by region and category, global search (videos, channels, playlists) with sorting, playlists with video detail, channel subscriptions, activity feed, live broadcast search and official taxonomies (video categories, i18n regions, i18n languages)
- **Multi-provider AI engine v2** — **local** providers (Ollama, LM Studio), new online services (Mistral, DeepSeek, Together) and **unlimited custom providers** (OpenAI-compatible, Gemini or Anthropic) with name, base URL, model and key; connectivity test with latency in Settings
- **Switchable charts** — chart type selector (line, area, bars, pie/donut, radar and **isometric 3D**) in Dashboard and Analytics, with persisted preference
- **Accent colour** — 4 customisable palettes for the Obsidian theme (Flame, Orchid, Ocean, Volt), applied in Settings or via command palette
- **Channel goals** — per-metric targets (subscribers, views, watch hours, videos) managed in Settings
- **Per-release news** — "What's new" dialog shown once per release, reopenable in Settings
- **Installable PWA** — manifest, icons (normal + maskable) and complete metadata
- **CI + Releases** — GitHub Actions (`ci.yml` typecheck/lint/build; `release.yml` publishes artifacts and notes from the CHANGELOG), issue/PR templates, FUNDING and Discussions enabled
- `npm run typecheck` and local storage migration v3→v4

### Improved

- **Global responsiveness** — fixed texts and tables overflowing cards; top bar without horizontal drag (overflow-x clip), filters and selects with line breaking, chat and charts contained, long URLs/IDs breakable
- **Refined Obsidian theme** — cards with gradient border adapting to the accent, balanced typography, accent scrollbar, text-break utilities
- **First-run landing** — new premium home page (badges, features, animations); shown only on first open and, with Live mode configured, the app always lands on the Dashboard
- Command palette with accent actions; integrations updated to 16 services; compact Demo/Live switch on mobile

### Fixed

- Accumulated type errors (automation actions, integrations catalogue, demo packs)
- `ChartTooltip` overflowed the card on small screens

## [3.0.0] — 2026-11-15

### Rewritten

- **New stack**: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4 · shadcn/ui · Zustand · Recharts · Framer Motion
- **Local-first**: no Firebase — data and keys in `localStorage`; Demo mode with a deterministic dataset
- **New design**: "Obsidian" dark-first theme with flame gradient accent, glass topbar, cards with focus light, light theme included
- **Single-route SPA** with 11 navigable views + `Cmd/Ctrl+K` command palette
- **Multi-platform**: Capacitor (Android/iOS, static export or remote shell) and Electron (standalone local or APP_URL)

### New features

- **Automation**: trigger→conditions→actions rule engine (comments, videos, milestones, 60s scheduler), ready-made templates, run log, webhooks
- **Integrations**: local key vault for 11 public/free services (YouTube, Gemini, Groq, OpenRouter, OpenAI, Claude, HF, Pexels, Unsplash, Pixabay, universal webhook)
- **Tools**: thumbnail A/B testing at real YouTube sizes, trending by region (mostPopular), upload planner with states, JSON backup/export
- **Multi-provider AI**: 6 providers with local demo fallback without key; chat with channel context, scripts with timestamps, 10 ideas, comment replies
- **SEO Studio**: title optimiser (weighted checklist), real tag extraction via API, keyword research via public autocomplete (with fallback), competitor analysis
- **Community**: sentiments, AI-suggested replies, templates, moderation
- **i18n PT/EN/ES** complete · light/dark mode · best-times heatmap · CSV export

### Removed

- Firebase Authentication/Firestore and associated dependencies
- TanStack Start/Router and Vite (replaced by Next.js App Router)
- Legacy Docker/Netlify configs from v2

### Migration

v3 uses new storage (`carsai-yt-studio-v3`); v2 data does not migrate automatically — export from v2 and import in Tools → Backup.

## [1.x] — legacy

React 19 + TanStack Start + Firebase app with analytics, content management, community, SEO and AI (v1.0.0 → v1.1.3). Replaced by v3.

[3.3.0]: https://github.com/carsaimz/carsai-yt-studio/releases/tag/v3.3.0
[3.2.0]: https://github.com/carsaimz/carsai-yt-studio/releases/tag/v3.2.0
[3.1.0]: https://github.com/carsaimz/carsai-yt-studio/releases/tag/v3.1.0
[3.0.0]: https://github.com/carsaimz/carsai-yt-studio/releases/tag/v3.0.0
[1.x]: https://github.com/carsaimz/carsai-yt-studio/releases
