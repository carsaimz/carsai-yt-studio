<div align="center">
  <img src="public/icon.svg" alt="Carsai YT Studio" width="110" height="110" />

  <h1>Carsai YT Studio</h1>

  <p>
    <strong>🇲🇿 Plataforma local-first para criadores YouTube — analytics, SEO, comunidade, automação e IA</strong><br/>
    <strong>🇺🇸 Local-first platform for YouTube creators — analytics, SEO, community, automation & AI</strong><br/>
    <strong>🇪🇸 Plataforma local-first para creadores de YouTube — analíticas, SEO, comunidad, automatización e IA</strong>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16-black" alt="Next.js 16" />
    <img src="https://img.shields.io/badge/TypeScript-5-blue" alt="TypeScript 5" />
    <img src="https://img.shields.io/badge/Capacitor-Android-green" alt="Android" />
    <img src="https://img.shields.io/badge/Electron-Windows%20%7C%20macOS%20%7C%20Linux-purple" alt="Desktop" />
    <img src="https://img.shields.io/badge/license-MIT-yellow" alt="MIT" />
  </p>
</div>

---

<a id="pt"></a>
## 🇲🇿 Português

### O que é?

O **Carsai YT Studio v3** é uma alternativa ao YouTube Studio com superpoderes: análise o teu canal, otimiza SEO, modera a comunidade, automatiza tarefas repetitivas e usa agentes de IA — tudo numa única aplicação que corre no **browser, Android (Capacitor) e desktop (Electron)**.

Ao contrário da versão anterior, a v3 é **local-first**: os teus dados e chaves de API vivem apenas no teu dispositivo. Sem Firebase, sem backend obrigatório, sem servidores intermédios.

### Funcionalidades

| | Funcionalidade | Descrição |
|--|---|---|
| 📊 | **Painel & Analytics** | KPIs com sparklines, gráficos de 28/90 dias, origens de tráfego, curva de retenção, heatmap de melhores horários, exportação CSV |
| 🎬 | **Biblioteca de conteúdo** | Pesquisa, filtros, editor de metadados com score SEO ao vivo, capítulos, pré-visualização de miniatura |
| 🔍 | **Estúdio SEO** | Otimizador de títulos com checklist, laboratório de tags (extração real via API), pesquisa de palavras-chave (autocomplete público), análise de concorrentes |
| 💬 | **Comunidade** | Caixa de entrada com sentimentos, respostas por IA, modelos de resposta, moderação (aprovar/ocultar/spam) |
| 🤖 | **Estúdio IA** | Chat com contexto do canal, gerador de roteiros, 10 ideias de vídeos, respostas a comentários — **Gemini, Groq, OpenRouter, OpenAI, Claude, Hugging Face** |
| ⚡ | **Automação (novo)** | Motor de regras acionador→condições→ações: responder, gerar ideias, aplicar tags, notificar, webhooks. Modelos prontos e registo de execuções |
| 🔌 | **Integrações (novo)** | Cofre de chaves local para **11 serviços públicos/gratuitos** (YouTube API, Gemini, Groq, OpenRouter, Pexels, Unsplash, Pixabay, webhooks…) |
| 🧰 | **Ferramentas (novo)** | Teste A/B de miniaturas em tamanho real, tendências por região, planeador de uploads, backup/exportação JSON |
| 🌍 | **Multi-idioma** | Português · English · Español |
| ⌨️ | **Command palette** | `Cmd/Ctrl+K` para navegar e executar ações |
| 📱 | **Multi-plataforma** | Web · Android (Capacitor) · Windows/macOS/Linux (Electron) |

### Início rápido

```bash
git clone https://github.com/carsaimz/carsai-yt-studio.git
cd carsai-yt-studio
npm install
npm run dev
```

1. Abre `http://localhost:3000`
2. Escolhe **Explorar em modo Demo** (dados de exemplo, zero configuração) ou liga o teu canal com uma chave gratuita da [YouTube Data API v3](https://console.cloud.google.com/apis/library/youtube.googleapis.com)
3. Opcionalmente configura IA gratuita em **Integrações** (Gemini / Groq / OpenRouter)

### Plataformas

| Plataforma | Comando | Notas |
|---|---|---|
| 🌐 Web | `npm run dev` / `npm run build` | Next.js standalone |
| 📱 Android | `npm run cap:android` | `build:mobile` (export estático) + `cap sync` |
| 🖥️ Desktop | `npm run electron:dev` | carrega a app web; `electron:build` gera instaladores |

> 📖 Consulta o [SETUP.md](SETUP.md) para instruções detalhadas de cada plataforma e obtenção de chaves gratuitas.

### Tecnologias

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · Zustand (persistência local) · Recharts · Framer Motion · Lucide · Capacitor 6 · Electron 33

### Arquitetura

```
src/
  app/                    # Next.js App Router (rota única / — SPA)
  components/studio/
    studio-app.tsx        # shell: topbar, sidebar, navegação SPA
    views/                # 11 vistas: dashboard, analytics, content, video,
                          # seo, community, ai, automation, integrations, tools, settings
  lib/studio/
    youtube.ts            # cliente YouTube Data API v3 (browser, CORS)
    ai.ts                 # 6 provedores de IA + cérebro demo local
    seo.ts                # motor de pontuação e sugestões SEO
    automation.ts         # motor de regras (tick 60s) + modelos
    store.ts              # Zustand + localStorage (local-first)
    i18n.tsx              # dicionários PT/EN/ES
    demo-data.ts          # dataset demo determinístico
```

### Segurança e privacidade

- 🔐 As chaves de API ficam em `localStorage` **apenas no teu dispositivo**
- 🌐 Chamadas externas vão diretamente do teu browser para as APIs oficiais
- 🚫 Sem analytics, telemetria ou servidores intermédios
- 🧹 Backup/exportação em **Definições**; zona de risco repõe tudo

### Contribuir

Issues e PRs são bem-vindos — lê [CONTRIBUTING.md](CONTRIBUTING.md).

---

<a id="en"></a>
## 🇺🇸 English

### What is it?

**Carsai YT Studio v3** is a YouTube Studio alternative with superpowers: analyze your channel, optimize SEO, moderate your community, automate repetitive work and use AI agents — all in one app that runs on **browser, Android (Capacitor) and desktop (Electron)**.

Unlike the previous version, v3 is **local-first**: your data and API keys live only on your device. No Firebase, no required backend, no middleman servers.

### Features

- **Dashboard & Analytics** — KPI sparklines, 28/90-day charts, traffic sources, retention curve, best-time heatmap, CSV export
- **Content library** — search, filters, live SEO score metadata editor, chapters, thumbnail preview
- **SEO Studio** — title optimizer checklist, real tag extraction via API, keyword research (public autocomplete), competitor analysis
- **Community** — sentiment inbox, AI-suggested replies, reply templates, moderation
- **AI Studio** — channel-aware chat, script generator, video ideas, comment replies — Gemini, Groq, OpenRouter, OpenAI, Claude, Hugging Face
- **Automation (new)** — trigger→conditions→actions rule engine: AI drafts, ideas, tag appends, notifications, webhooks; ready-made templates and run log
- **Integrations (new)** — local key vault for 11 public/free services
- **Tools (new)** — real-size thumbnail A/B tester, trending by region, upload planner, JSON backup
- **Multi-language** — Portuguese, English, Spanish · **Command palette** — `Cmd/Ctrl+K`

### Quick start

```bash
git clone https://github.com/carsaimz/carsai-yt-studio.git
cd carsai-yt-studio
npm install
npm run dev
```

Open `http://localhost:3000`, pick **Demo mode** (sample data, zero setup) or connect your channel with a free [YouTube Data API v3](https://console.cloud.google.com/apis/library/youtube.googleapis.com) key. Optionally add free AI (Gemini / Groq / OpenRouter) under **Integrations**.

---

<a id="es"></a>
## 🇪🇸 Español

### ¿Qué es?

**Carsai YT Studio v3** es una alternativa a YouTube Studio con superpoderes: analiza tu canal, optimiza el SEO, modera la comunidad, automatiza el trabajo repetitivo y usa agentes de IA — todo en una app que funciona en **navegador, Android (Capacitor) y escritorio (Electron)**.

A diferencia de la versión anterior, la v3 es **local-first**: tus datos y claves de API viven solo en tu dispositivo. Sin Firebase, sin backend obligatorio.

### Inicio rápido

```bash
git clone https://github.com/carsaimz/carsai-yt-studio.git
cd carsai-yt-studio
npm install
npm run dev
```

Abre `http://localhost:3000`, elige **modo Demo** o conecta tu canal con una clave gratuita de la YouTube Data API v3.

---

## Licença / License

MIT — ver [LICENSE](LICENSE).
