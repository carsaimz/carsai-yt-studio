# Roadmap — Carsai YT Studio

**Public roadmap.** This file is the single source of truth for what is shipped, what is in progress and what is planned. It is updated with every release. Feature requests and roadmap discussion happen in [GitHub Discussions](https://github.com/carsaimz/carsai-yt-studio/discussions) — contributions are welcome (see [CONTRIBUTING.md](CONTRIBUTING.md)).

Legend: ✅ shipped · 🚧 in progress · 🗓 planned · 💡 under consideration

---

## ✅ Shipped

### v3.2.0 — 2026-11-16
- **Google OAuth 2.0 (PKCE)** — connect your Google account; tokens never leave the device, loopback capture on Electron, manual code paste elsewhere, automatic refresh
- **Real analytics via YouTube Analytics API v2** — daily reports (views, watch time, subscribers gained/lost, likes, comments, shares) + top videos, charts and CSV export
- **OAuth-gated Data API features** — own playlists (`mine=true`) and channel captions
- **Explicit web demo mode** — the browser version is testing/demo only; the Live switch is blocked with an explanation and a download banner
- **Update checker** — queries the latest GitHub release at startup and toasts when a newer version exists
- **Electron loopback IPC** for OAuth (`carsai:oauth-loopback`)

### v3.1.0 — 2026-11-15
- **YouTube Hub** — the full YouTube Data API v3 in one view: trending by region/category, global search (videos/channels/playlists) with sorting, playlists with items, subscriptions, activity feed, live broadcast search, official taxonomies (video categories, i18n regions and languages)
- **Multi-provider AI engine v2** — local providers (Ollama, LM Studio), more online services (Mistral, DeepSeek, Together) and **unlimited custom providers** (OpenAI-compatible, Gemini or Anthropic) with connectivity test and latency
- **Switchable charts** — line, area, bars, pie/donut, radar and isometric **3D** on Dashboard and Analytics, preference persisted
- **Accent palettes** for the Obsidian theme (Flame, Orchid, Ocean, Volt)
- **Channel goals**, per-release "What's new" dialog, installable PWA
- **CI + Releases** on GitHub Actions with changelog-driven release notes, issue/PR templates, FUNDING and Discussions

### v3.0.0 — 2026-11-15
- Complete premium rebuild: Next.js 15 + Capacitor 6 (mobile) + Electron (desktop)
- Dashboard, Analytics, Content, SEO Studio, Community, AI Studio, Automation, Integrations, Tools, Settings
- Live mode (your own YouTube Data API v3 key) and Demo mode (realistic sample data)
- Local-first storage with versioned migrations; keys never leave the device

---

## 🚧 In progress — v3.3.0

- **Android + Windows + macOS release builds** — the release workflow now builds the Capacitor Android app (APK + AAB) and Electron installers for Windows (NSIS) and macOS (DMG) in addition to Linux (AppImage + deb) and the web bundle. Fixes: no APK asset appeared in v3.x releases.
- **Six UI languages** — i18n dictionaries now cover PT, EN, ES, **FR, DE, IT**.
- **Public ROADMAP.md** — this file.

---

## 🗓 Planned

### YouTube write actions (OAuth)
The OAuth layer exists; the next step is enabling *write* scopes (`youtube.upload`, `youtube.force-ssl`) to unlock:
- Direct **video upload** from the studio (resumable upload with progress)
- **Edit metadata** of real videos (title, description, tags, category, thumbnail)
- **Moderate real comments** — approve/held/spam actions and real replies (not just drafts)
- Playlist management on the authenticated channel

### Deeper analytics
- Traffic-source and demographic reports (Analytics API dimensions)
- Shorts-specific reports; playlist-level reports
- Multi-period comparison (28d vs previous 28d vs year)

### Optional encrypted sync between devices
- End-to-end encrypted sync (AES-256-GCM, key derived from a user passphrase) of settings, goals, provider configs and automation rules
- Transport-agnostic: WebDAV / any object storage / manual encrypted export file
- Zero-knowledge: the server only ever sees ciphertext

### Team mode (multi-user via WebRTC/P2P)
- Join a studio session over P2P WebRTC with encrypted signalling
- Shared dashboard and comment queue with assignment ("you handle replies, I handle moderation")
- Presence indicators and per-role permissions

### More languages
- Shipped: PT, EN, ES, FR, DE, IT (dictionaries in `src/lib/studio/i18n.tsx`)
- Next: **ZH, JA, HI, AR (RTL), RU** — community translations welcome via CONTRIBUTING

### E2E tests with Playwright
- Critical flows: onboarding (demo vs live), Live-mode toggle, provider configuration, chart-type switching, language switching, automation rule editor
- Electron E2E via `_electron.launch`; mock YouTube/GitHub APIs; run on CI for every PR

### Release & distribution hardening
- Code signing for Windows (SV) and macOS (notarization) as budget allows
- Auto-update channel for Electron (`electron-updater`)
- Play Store internal track for the AAB; F-Droid metadata evaluation

---

## 💡 Under consideration (vote in Discussions)

- **Auto-publisher scheduler** — schedule metadata edits/publishes; cron runs in the Electron main process
- **Comment AI assistant** — sentiment classification + auto-drafted replies in the inbox (real posting once write scopes ship)
- **Thumbnail A/B tracker** — log thumbnail swaps and correlate with CTR changes
- **On-device transcription (whisper.cpp)** — generate subtitles locally, no cloud
- **iOS app via Capacitor** — blocked on Apple signing; community build docs first
- **Plugin system** — community plugins declared via manifest, loaded in sandboxed iframes
- **Docker image** for self-hosting the web demo
- **Accessibility pass** — WCAG AA audit, screen-reader labels, full keyboard navigation
- **CRDT local database** — optional SQLite (Electron) storage with CRDT merge, preparing for team mode

---

## Release cadence

Patch releases ship fixes as they happen; minor releases ship features roughly every 1–2 weeks. Every release is tagged `vX.Y.Z`, built by `release.yml` (Linux + Windows + macOS + Android + web) and documented in [CHANGELOG.md](CHANGELOG.md). CI must be green before each tag.
