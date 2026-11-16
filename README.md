<div align="center">
  <img src="public/icon.svg" alt="Carsai YT Studio" width="110" height="110" />

  <h1>Carsai YT Studio</h1>


  <p>
    <strong>Local-first platform for YouTube creators — analytics, SEO, community, automation & AI</strong>
  </p>

  <p>
    <a href="https://github.com/carsaimz/carsai-yt-studio/releases"><img src="https://img.shields.io/github/v/release/carsaimz/carsai-yt-studio?include_prereleases" alt="Release" /></a>
    <a href="https://github.com/carsaimz/carsai-yt-studio/actions"><img src="https://img.shields.io/github/actions/workflow/status/carsaimz/carsai-yt-studio/ci.yml?branch=main&label=CI" alt="CI" /></a>
    <a href="https://github.com/carsaimz/carsai-yt-studio/discussions"><img src="https://img.shields.io/github/discussions/carsaimz/carsai-yt-studio" alt="Discussions" /></a>
    <img src="https://img.shields.io/badge/Next.js-16-black" alt="Next.js 16" />
    <img src="https://img.shields.io/badge/TypeScript-5-blue" alt="TypeScript 5" />
    <img src="https://img.shields.io/badge/Capacitor-Android%20%7C%20iOS-green" alt="Mobile" />
    <img src="https://img.shields.io/badge/Electron-Windows%20%7C%20macOS%20%7C%20Linux-purple" alt="Desktop" />
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-yellow" alt="MIT" /></a>
    <a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen" alt="PRs welcome" /></a>
  </p>

  <p>
    🌐 <strong><a href="https://carsaiytstudio.vercel.app">Official website — carsaiytstudio.vercel.app</a></strong>
  </p>

  <p><strong>Read in:</strong>
    <a href="README.md">English</a> ·
    <a href="README.pt.md">Português</a> ·
    <a href="README.es.md">Español</a> ·
    <a href="README.fr.md">Français</a> ·
    <a href="README.de.md">Deutsch</a> ·
    <a href="README.it.md">Italiano</a> ·
    <a href="README.zh.md">中文</a>
  </p>
</div>

---

## What is it?

**Carsai YT Studio v3** is a YouTube Studio alternative with superpowers: analyze your channel, optimize SEO, moderate your community, automate repetitive work, explore the **entire YouTube Data API v3** and use AI agents — all in one app that runs on **browser (PWA), Android/iOS (Capacitor) and desktop (Electron)**.

v3 is **local-first**: your data and API keys live only on your device. No Firebase, no required backend, no middleman servers. Open-source under **MIT**.

> **Web note**: the hosted web version is for **testing and demonstration only** (sample data, no real connections). The full experience — real data, OAuth and automation — runs in the **Electron (desktop)** and **Capacitor (mobile)** apps, downloadable from [Releases](https://github.com/carsaimz/carsai-yt-studio/releases/latest).

## Features

| | Feature | Description |
|--|---|---|
| 📊 | **Dashboard & Analytics** | KPI sparklines, 28/90-day charts, traffic sources, retention curve, best-time heatmap, CSV export |
| 📈 | **Switchable charts** | Swap chart type on any panel: **line, area, bars, donut, radar and 3D** |
| 🔐 | **Google OAuth** | PKCE OAuth — own playlists, captions and **real YouTube Analytics API v2 reports** (daily metrics + top videos + CSV); automatic loopback capture on Electron |
| 🎬 | **Content library** | Search, filters, live SEO-score metadata editor, chapters, thumbnail preview |
| 🛰️ | **YouTube Hub** | The full Data API v3 surface: trending by region/category, global search (videos/channels/playlists), playlists, subscriptions, activities, live broadcasts and official taxonomies |
| 🔍 | **SEO Studio** | Title optimizer checklist, real tag extraction via API, keyword research (public autocomplete), competitor analysis |
| 💬 | **Community** | Sentiment inbox, AI-suggested replies, reply templates, moderation (approve/hide/spam) |
| 🤖 | **Multi-provider AI Studio** | Channel-aware chat, scripts, ideas, replies — **Gemini, Groq, OpenRouter, Mistral, Hugging Face, OpenAI, Claude, DeepSeek, Together + local (Ollama, LM Studio) + unlimited custom providers** (OpenAI-compatible / Gemini / Anthropic) |
| ⚡ | **Automation** | Trigger→conditions→actions rule engine: reply, generate ideas, apply tags, notify, webhooks. Ready-made templates and run log |
| 🔌 | **Integrations** | Local key vault for **16 public/free services** (YouTube API, Gemini, Groq, OpenRouter, Mistral, DeepSeek, Together, Ollama, LM Studio, Pexels, Unsplash, Pixabay, webhooks…) |
| 🧰 | **Tools** | Thumbnail A/B testing at real YouTube sizes, trending by region, upload planner, JSON backup/export |
| 🎯 | **Goals** | Channel targets (subs, views, watch hours, videos) with dashboard progress |
| 🎨 | **Themes & accents** | Obsidian dark/light theme + **4 custom accents** (Flame, Orchid, Ocean, Volt) |
| 🌍 | **Six languages** | Português · English · Español · Français · Deutsch · Italiano |
| ⌨️ | **Command palette** | `Cmd/Ctrl+K` to navigate and run actions |
| 📲 | **Installable PWA** | Install as a native app — works offline after first visit |
| 📱 | **Multi-platform** | Web · Android/iOS (Capacitor) · Windows/macOS/Linux (Electron) |

## Downloads

Every release ships builds for all platforms (see [CHANGELOG.md](CHANGELOG.md) for what changed):

| Platform | File |
|---|---|
| 🤖 Android | `carsai-yt-studio-vX.Y.Z-android.apk` · `.aab` |
| 🪟 Windows | `carsai-yt-studio-X.Y.Z-win-x64.exe` (NSIS installer) |
| 🍎 macOS | `carsai-yt-studio-X.Y.Z-macos-*.dmg` |
| 🐧 Linux | `carsai-yt-studio-X.Y.Z-linux-x86_64.AppImage` · `.deb` |
| 🌐 Web | `carsai-yt-studio-vX.Y.Z-web.zip` (self-host bundle) |

👉 [Latest release](https://github.com/carsaimz/carsai-yt-studio/releases/latest)

## Quick start

```bash
git clone https://github.com/carsaimz/carsai-yt-studio.git
cd carsai-yt-studio
npm install
npm run dev
```

1. Open `http://localhost:3000`
2. Pick **Explore in Demo mode** (sample data, zero setup) or connect your channel with a free [YouTube Data API v3](https://console.cloud.google.com/apis/library/youtube.googleapis.com) key
3. Optionally add free AI under **Settings → AI providers** (Gemini / Groq / OpenRouter / Mistral — or local Ollama)

## Platforms

| Platform | Command | Notes |
|---|---|---|
| 🌐 Web | `npm run dev` / `npm run build` | Next.js standalone + PWA |
| 📱 Android | `npm run cap:android` | `build:mobile` (static export) + `cap sync` |
| 🖥️ Desktop | `npm run electron:dev` | loads the web app; `electron:build` builds installers |

> 📖 See [SETUP.md](SETUP.md) for detailed per-platform instructions and how to get free API keys. The public roadmap lives in [ROADMAP.md](ROADMAP.md).

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · Zustand (local persistence) · Recharts · Framer Motion · Lucide · Capacitor 6 · Electron 33

## Architecture

```
src/
  app/                    # Next.js App Router (single route / — SPA + PWA)
  components/studio/
    studio-app.tsx        # shell: topbar, sidebar, SPA navigation, accents, what's new
    views/                # 12 views: dashboard, analytics, content, video, youtube (Hub),
                          # seo, community, ai, automation, integrations, tools, settings
  lib/studio/
    youtube.ts            # full YouTube Data API v3 client (browser, CORS-safe)
    gapi.ts               # OAuth-gated endpoints (own playlists, captions)
    oauth.ts              # Google OAuth 2.0 PKCE flow
    ai.ts                 # multi-provider engine (online, local, custom) + demo brain
    seo.ts                # SEO scoring and suggestion engine
    automation.ts         # rule engine (60s tick) + templates
    store.ts              # Zustand + localStorage (local-first) with migrations
    i18n.tsx              # dictionaries: PT/EN/ES/FR/DE/IT
    demo-data.ts          # deterministic demo dataset
```

## Security & privacy

- 🔐 API keys live in `localStorage` **on your device only**
- 🌐 External calls go straight from your browser to the official APIs
- 🚫 No analytics, no telemetry, no middleman servers
- 🧹 Backup/export in **Settings**; the danger zone resets everything

## Contributing

Contributions are very welcome! Read [CONTRIBUTING.md](CONTRIBUTING.md), join the [Discussions](https://github.com/carsaimz/carsai-yt-studio/discussions) and check the [public roadmap](ROADMAP.md). Good first starting points: [`good first issue`](https://github.com/carsaimz/carsai-yt-studio/labels/good%20first%20issue). Translators: the i18n dictionaries in `src/lib/studio/i18n.tsx` are the place to add a language.

## License

MIT — see [LICENSE](LICENSE).
