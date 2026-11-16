<div align="center">
  <img src="public/icon.svg" alt="Carsai YT Studio" width="110" height="110" />

  <h1>Carsai YT Studio</h1>

  <p>
    <strong>Local-first-Plattform für YouTube-Creator — Analysen, SEO, Community, Automatisierung und KI</strong>
  </p>

  <p><strong>Lesen auf:</strong>
    <a href="README.md">English</a> ·
    <a href="README.pt.md">Português</a> ·
    <a href="README.es.md">Español</a> ·
    <a href="README.fr.md">Français</a> ·
    <a href="README.de.md">Deutsch</a> ·
    <a href="README.it.md">Italiano</a> ·
    <a href="README.zh.md">中文</a>
  </p>

  <p>🌐 <strong><a href="https://carsaiytstudio.vercel.app">Offizielle Website — carsaiytstudio.vercel.app</a></strong></p>
</div>

---

## Was ist das?

**Carsai YT Studio v3** ist eine Alternative zu YouTube Studio mit Superkräften: Analysiere deinen Kanal, optimiere SEO, moderiere deine Community, automatisiere repetitive Aufgaben, erkunde die **komplette YouTube Data API v3** und nutze KI-Agenten — alles in einer App, die im **Browser (PWA), auf Android/iOS (Capacitor) und dem Desktop (Electron)** läuft.

Die v3 ist **local-first**: Deine Daten und API-Schlüssel bleiben ausschließlich auf deinem Gerät. Kein Firebase, kein Pflicht-Backend, keine Zwischenserver. Open-Source unter **MIT**.

> **Hinweis zum Web**: Die Webversion dient nur zum **Testen und zur Demonstration** (Beispieldaten, keine echten Verbindungen). Das volle Erlebnis — echte Daten, OAuth und Automatisierung — läuft in den Apps **Electron (Desktop)** und **Capacitor (mobil)**, herunterladbar unter [Releases](https://github.com/carsaimz/carsai-yt-studio/releases/latest).

## Funktionen

| | Funktion | Beschreibung |
|--|---|---|
| 📊 | **Dashboard und Analysen** | KPIs mit Sparklines, 28/90-Tage-Diagramme, Traffic-Quellen, Retention-Kurve, Heatmap der besten Zeiten, CSV-Export |
| 📈 | **Umschaltbare Diagramme** | Wechsle den Diagrammtyp in jedem Panel: **Linie, Fläche, Balken, Kreis (Donut), Radar und 3D** |
| 🔐 | **Google OAuth** | OAuth mit PKCE — eigene Playlists, Untertitel und **echte Berichte der YouTube Analytics API v2** (tägliche Metriken + Top-Videos + CSV); automatische Loopback-Erfassung in Electron |
| 🎬 | **Inhaltsbibliothek** | Suche, Filter, Metadaten-Editor mit Live-SEO-Score, Kapitel, Vorschaubild-Vorschau |
| 🛰️ | **YouTube-Hub** | Die komplette Data-API-v3-Oberfläche: Trends nach Region/Kategorie, globale Suche (Videos/Kanäle/Playlists), Playlists, Abos, Aktivitäten, Live-Übertragungen und offizielle Taxonomien |
| 🔍 | **SEO-Studio** | Titel-Optimierer mit Checkliste, echte Tag-Extraktion per API, Keyword-Recherche (öffentliche Autovervollständigung), Wettbewerbsanalyse |
| 💬 | **Community** | Eingang mit Stimmung, KI-geschlagene Antworten, Vorlagen, Moderation (genehmigen/verbergen/Spam) |
| 🤖 | **Multi-Provider-KI-Studio** | Kanalbezogener Chat, Skripte, Ideen, Antworten — **Gemini, Groq, OpenRouter, Mistral, Hugging Face, OpenAI, Claude, DeepSeek, Together + lokal (Ollama, LM Studio) + unbegrenzt eigene Provider** |
| ⚡ | **Automatisierung** | Regel-Engine Auslöser→Bedingungen→Aktionen: antworten, Ideen generieren, Tags anwenden, benachrichtigen, Webhooks. Fertige Vorlagen und Ausführungsprotokoll |
| 🔌 | **Integrationen** | Lokaler Schlüsseltresor für **16 öffentliche/kostenlose Dienste** (YouTube API, Gemini, Groq, OpenRouter, Mistral, DeepSeek, Together, Ollama, LM Studio, Pexels, Unsplash, Pixabay, Webhooks…) |
| 🧰 | **Werkzeuge** | Vorschaubild-A/B-Test in echter YouTube-Größe, Trends nach Region, Upload-Planer, JSON-Backup/Export |
| 🎯 | **Ziele** | Kanalziele (Abos, Aufrufe, Stunden, Videos) mit Fortschritt im Dashboard |
| 🎨 | **Designs und Akzente** | Obsidian dark/light + **4 individuelle Akzentfarben** (Flame, Orchid, Ocean, Volt) |
| 🌍 | **Sechs Sprachen** | Português · English · Español · Français · Deutsch · Italiano |
| ⌨️ | **Befehlspalette** | `Cmd/Ctrl+K` zum Navigieren und Ausführen von Aktionen |
| 📲 | **Installierbare PWA** | Als native App installieren — funktioniert offline nach dem ersten Besuch |
| 📱 | **Multiplattform** | Web · Android/iOS (Capacitor) · Windows/macOS/Linux (Electron) |

## Downloads

Jede Version enthält Builds für alle Plattformen (Neuigkeiten in [CHANGELOG.md](CHANGELOG.md)):

| Plattform | Datei |
|---|---|
| 🤖 Android | `carsai-yt-studio-vX.Y.Z-android.apk` · `.aab` |
| 🪟 Windows | `carsai-yt-studio-X.Y.Z-win-x64.exe` (NSIS-Installer) |
| 🍎 macOS | `carsai-yt-studio-X.Y.Z-macos-*.dmg` |
| 🐧 Linux | `carsai-yt-studio-X.Y.Z-linux-x86_64.AppImage` · `.deb` |
| 🌐 Web | `carsai-yt-studio-vX.Y.Z-web.zip` (Self-Host-Bundle) |

👉 [Neueste Version](https://github.com/carsaimz/carsai-yt-studio/releases/latest)

## Schnellstart

```bash
git clone https://github.com/carsaimz/carsai-yt-studio.git
cd carsai-yt-studio
npm install
npm run dev
```

1. Öffne `http://localhost:3000`
2. Wähle **Im Demo-Modus erkunden** (Beispieldaten, keine Einrichtung) oder verbinde deinen Kanal mit einem kostenlosen [YouTube-Data-API-v3](https://console.cloud.google.com/apis/library/youtube.googleapis.com)-Schlüssel
3. Optional kostenlose KI unter **Einstellungen → KI-Anbieter** hinzufügen (Gemini / Groq / OpenRouter / Mistral — oder lokales Ollama)

## Sicherheit und Datenschutz

- 🔐 API-Schlüssel bleiben in `localStorage` **nur auf deinem Gerät**
- 🌐 Externe Aufrufe gehen direkt aus deinem Browser an die offiziellen APIs
- 🚫 Keine Analysen, keine Telemetrie, keine Zwischenserver
- 🧹 Backup/Export in den **Einstellungen**; die Gefahrenzone setzt alles zurück

## Mitwirken

Beiträge sind sehr willkommen! Lies [CONTRIBUTING.md](CONTRIBUTING.md), mach bei den [Discussions](https://github.com/carsaimz/carsai-yt-studio/discussions) mit und sieh dir die [öffentliche Roadmap](ROADMAP.md) an. Übersetzer: Die i18n-Wörterbücher in `src/lib/studio/i18n.tsx` sind der Ort, um eine Sprache hinzuzufügen.

## Lizenz

MIT — siehe [LICENSE](LICENSE).
