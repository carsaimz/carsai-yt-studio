# SETUP — Carsai YT Studio v3

Installation and configuration guide for all platforms, with instructions for obtaining every free key.

---

## 1. Requirements

| Tool | Version | Note |
|---|---|---|
| Node.js | 20+ (22 recommended) | `node -v` |
| npm | 10+ | or `bun` |
| Android Studio | Iguana+ | only for local Android builds |
| Java JDK | 17 | only for Android builds |

---

## 2. Installation

```bash
git clone https://github.com/carsaimz/carsai-yt-studio.git
cd carsai-yt-studio
npm install
npm run dev          # http://localhost:3000
```

The welcome screen offers two paths:

1. **Demo mode** — realistic sample data, nothing to configure.
2. **Connect a live channel** — asks for a YouTube Data API v3 key + channel ID (`UC...`).

---

## 3. Free keys (all optional)

### YouTube Data API v3 (10,000 units/day free)

1. Open [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → **APIs & Services → Library** → enable **YouTube Data API v3**
3. **Credentials → Create credentials → API key**
4. (Recommended) restrict the key to the YouTube Data API
5. Paste the key in the onboarding, or under **Settings → API key vault**

To find your **Channel ID**: YouTube → your channel → **About** → "Share channel" → "Copy channel ID".

### Free AI

| Service | Where to get it | Note |
|---|---|---|
| Google Gemini | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | generous free tier |
| Groq | [console.groq.com/keys](https://console.groq.com/keys) | free tier, very fast |
| OpenRouter | [openrouter.ai/keys](https://openrouter.ai/keys) | free models available |
| Mistral | [console.mistral.ai](https://console.mistral.ai) | free experiment tier |
| DeepSeek / Together | platform.deepseek.ai / api.together.xyz | pay-as-you-go |
| Ollama / LM Studio | local install | 100% offline, no key |

### Google OAuth (optional — real analytics & own playlists)

1. Google Cloud Console → **Credentials → Create credentials → OAuth 2.0 Client**
2. Type **Desktop app**, redirect URI `http://localhost:8765/`
3. Paste **Client ID** and **Client secret** in Settings → Google account (OAuth)
4. Tokens stay on the device; the refresh token is applied automatically

---

## 4. Web / deploy

```bash
npm run build        # standalone build in .next/standalone
npm start            # production server
```

Recommended deploy: **Vercel** (zero config) or `node .next/standalone/server.js` on any VPS/Docker.

> The hosted web version is **testing and demonstration only** — the platform shows a demo banner and blocks the Live switch. Full functionality runs in the desktop/mobile apps.

---

## 5. Android (Capacitor)

Two modes:

**a) Bundled static app (offline-first):**

```bash
npm run build:mobile   # generates ./out (static export, BUILD_TARGET=mobile)
npx cap add android    # first time only
npm run cap:sync       # copies ./out into the native project
npm run cap:android    # opens Android Studio
```

**b) Remote shell (always-updated data):**

```bash
CAP_SERVER_URL=https://your-deploy.vercel.app npx cap sync android
npm run cap:android
```

> Note: in static mode, API calls (YouTube, Gemini, Groq…) go straight from the device — all support CORS.

**CI release builds:** the native `android/` folder is generated in CI by `scripts/prepare-android.sh` (adds the platform, syncs assets, patches release signing with the debug keystore) and built by the `android` job in `.github/workflows/release.yml`, which uploads `app-release.apk` and `app-release.aab` to the GitHub Release. Keep `android/` out of git (see `.gitignore`).

---

## 6. Desktop (Electron)

**Dev:**

```bash
npm run build                # standalone build
npm run electron:dev         # opens the window loading localhost:3000
```

**Production (installers):**

```bash
npm run electron:build       # NSIS (Windows), DMG (macOS), AppImage/deb (Linux)
# output in dist-electron/
```

Main process modes:

- `APP_URL=https://your-deploy.vercel.app electron electron/main.cjs` → loads the published site
- without `APP_URL` → spawns the local Next standalone server and loads `localhost:3000`

OAuth note: Electron registers the `carsai:oauth-loopback` IPC so the OAuth redirect to `http://localhost:8765/` is captured automatically.

---

## 7. Releases (all platforms, automated)

Tag a version and GitHub Actions builds everything (`.github/workflows/release.yml`):

```bash
npm version minor        # or patch/major — bumps package.json
git push --follow-tags
```

Jobs: `web-linux` (web.zip + AppImage/deb), `windows` (NSIS exe), `macos` (DMG), `android` (APK + AAB), `publish` (assembles the GitHub Release with notes extracted from CHANGELOG.md). CI must be green before tagging.

---

## 8. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `quotaExceeded` | YouTube API daily limit | wait for the reset (midnight PT) or create another project |
| `API key not valid` | key pasted wrong / restrictions | check under Settings → API key vault |
| `Channel not found` | invalid ID | use the `UC…` format (24+ characters) |
| AI does not respond | no key for the active provider | configure in Integrations; without a key the local demo mode is used |
| CORS on suggest | rare autocomplete block | the app falls back to a local suggestion engine automatically |

---

## 9. Data & backup

Everything lives in `localStorage` (key `carsai-yt-studio-v3`):

- **Export**: Settings → Data → Export (JSON without keys)
- **Import**: Settings → Data → Import
- **Reset**: Settings → Danger zone → Reset everything
