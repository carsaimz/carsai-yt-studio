<div align="center">
  <img src="public/icon.svg" alt="Carsai YT Studio" width="110" height="110" />

  <h1>Carsai YT Studio</h1>

  <p>
    <strong>Piattaforma local-first per creator YouTube — analisi, SEO, community, automazione e IA</strong>
  </p>

  <p><strong>Leggi in:</strong>
    <a href="README.md">English</a> ·
    <a href="README.pt.md">Português</a> ·
    <a href="README.es.md">Español</a> ·
    <a href="README.fr.md">Français</a> ·
    <a href="README.de.md">Deutsch</a> ·
    <a href="README.it.md">Italiano</a> ·
    <a href="README.zh.md">中文</a>
  </p>

  <p>🌐 <strong><a href="https://carsaiytstudio.vercel.app">Sito ufficiale — carsaiytstudio.vercel.app</a></strong></p>
</div>

---

## Che cos'è?

**Carsai YT Studio v3** è un'alternativa a YouTube Studio con superpoteri: analizza il tuo canale, ottimizza il SEO, modera la community, automatizza il lavoro ripetitivo, esplora **tutta l'API YouTube Data v3** e usa agenti IA — tutto in un'unica app che gira su **browser (PWA), Android/iOS (Capacitor) e desktop (Electron)**.

La v3 è **local-first**: i tuoi dati e le chiavi API restano solo sul tuo dispositivo. Niente Firebase, niente backend obbligatorio, niente server intermedi. Open-source con licenza **MIT**.

> **Nota sul web**: la versione web serve solo per **test e dimostrazione** (dati di esempio, nessuna connessione reale). L'esperienza completa — dati reali, OAuth e automazione — gira nelle app **Electron (desktop)** e **Capacitor (mobile)**, scaricabili dai [Release](https://github.com/carsaimz/carsai-yt-studio/releases/latest).

## Funzionalità

| | Funzionalità | Descrizione |
|--|---|---|
| 📊 | **Dashboard e analisi** | KPI con sparkline, grafici 28/90 giorni, sorgenti di traffico, curva di ritenzione, mappa dei migliori orari, esportazione CSV |
| 📈 | **Grafici sostituibili** | Cambia il tipo di grafico in ogni pannello: **linea, area, barre, torta (donut), radar e 3D** |
| 🔐 | **OAuth Google** | OAuth con PKCE — playlist proprie, sottotitoli e **report reali dell'API YouTube Analytics v2** (metriche giornaliere + top video + CSV); cattura loopback automatica su Electron |
| 🎬 | **Libreria dei contenuti** | Ricerca, filtri, editor di metadati con punteggio SEO live, capitoli, anteprima miniatura |
| 🛰️ | **Hub YouTube** | Tutta la Data API v3 in un solo posto: tendenze per regione/categoria, ricerca globale (video/canali/playlist), playlist, iscrizioni, attività, trasmissioni live e tassonomie ufficiali |
| 🔍 | **Studio SEO** | Ottimizzatore titoli con checklist, estrazione reale dei tag via API, ricerca parole chiave (autocompletamento pubblico), analisi dei concorrenti |
| 💬 | **Community** | Inbox con sentiment, risposte suggerite dall'IA, modelli, moderazione (approva/nascondi/spam) |
| 🤖 | **Studio IA multi-provider** | Chat con contesto del canale, script, idee, risposte — **Gemini, Groq, OpenRouter, Mistral, Hugging Face, OpenAI, Claude, DeepSeek, Together + locali (Ollama, LM Studio) + provider personalizzati illimitati** |
| ⚡ | **Automazione** | Motore a regole trigger→condizioni→azioni: rispondere, generare idee, applicare tag, notificare, webhook. Modelli pronti e registro esecuzioni |
| 🔌 | **Integrazioni** | Cassaforte chiavi locale per **16 servizi** pubblici/gratuiti (API YouTube, Gemini, Groq, OpenRouter, Mistral, DeepSeek, Together, Ollama, LM Studio, Pexels, Unsplash, Pixabay, webhook…) |
| 🧰 | **Strumenti** | Test A/B miniature in dimensioni reali YouTube, tendenze per regione, pianificatore caricamenti, backup/esportazione JSON |
| 🎯 | **Obiettivi** | Mete del canale (iscritti, visualizzazioni, ore, video) con progressi nella dashboard |
| 🎨 | **Temi e accenti** | Tema Obsidian dark/light + **4 accenti personalizzabili** (Flame, Orchid, Ocean, Volt) |
| 🌍 | **Sei lingue** | Português · English · Español · Français · Deutsch · Italiano |
| ⌨️ | **Palette comandi** | `Cmd/Ctrl+K` per navigare ed eseguire azioni |
| 📲 | **PWA installabile** | Installa come app nativa — funziona offline dopo la prima visita |
| 📱 | **Multi-piattaforma** | Web · Android/iOS (Capacitor) · Windows/macOS/Linux (Electron) |

## Download

Ogni release include build per tutte le piattaforme (novità in [CHANGELOG.md](CHANGELOG.md)):

| Piattaforma | File |
|---|---|
| 🤖 Android | `carsai-yt-studio-vX.Y.Z-android.apk` · `.aab` |
| 🪟 Windows | `carsai-yt-studio-X.Y.Z-win-x64.exe` (installer NSIS) |
| 🍎 macOS | `carsai-yt-studio-X.Y.Z-macos-*.dmg` |
| 🐧 Linux | `carsai-yt-studio-X.Y.Z-linux-x86_64.AppImage` · `.deb` |
| 🌐 Web | `carsai-yt-studio-vX.Y.Z-web.zip` (bundle self-host) |

👉 [Ultima release](https://github.com/carsaimz/carsai-yt-studio/releases/latest)

## Avvio rapido

```bash
git clone https://github.com/carsaimz/carsai-yt-studio.git
cd carsai-yt-studio
npm install
npm run dev
```

1. Apri `http://localhost:3000`
2. Scegli **Esplora in modalità Demo** (dati di esempio, zero configurazione) oppure collega il tuo canale con una chiave gratuita dell'[API YouTube Data v3](https://console.cloud.google.com/apis/library/youtube.googleapis.com)
3. Facoltativamente aggiungi IA gratuita in **Impostazioni → Provider IA** (Gemini / Groq / OpenRouter / Mistral — oppure Ollama locale)

## Sicurezza e privacy

- 🔐 Le chiavi API restano in `localStorage` **solo sul tuo dispositivo**
- 🌐 Le chiamate esterne vanno direttamente dal tuo browser alle API ufficiali
- 🚫 Nessuna telemetria, nessun server intermedio
- 🧹 Backup/esportazione in **Impostazioni**; la zona pericolosa ripristina tutto

## Contribuire

I contributi sono molto benvenuti! Leggi [CONTRIBUTING.md](CONTRIBUTING.md), unisciti alle [Discussioni](https://github.com/carsaimz/carsai-yt-studio/discussions) e consulta la [roadmap pubblica](ROADMAP.md). Traduttori: i dizionari i18n in `src/lib/studio/i18n.tsx` sono il posto giusto per aggiungere una lingua.

## Licenza

MIT — vedi [LICENSE](LICENSE).
