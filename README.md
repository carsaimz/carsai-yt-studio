<div align="center">
  <img src="public/icon.svg" alt="Carsai YT Studio" width="110" height="110" />

  <h1>Carsai YT Studio</h1>

  <p>
    <strong>🇲🇿 Plataforma local-first para criadores YouTube — analytics, SEO, comunidade, automação e IA</strong><br/>
    <strong>🇺🇸 Local-first platform for YouTube creators — analytics, SEO, community, automation & AI</strong><br/>
    <strong>🇪🇸 Plataforma local-first para creadores de YouTube — analíticas, SEO, comunidad, automatización e IA</strong>
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
    🌐 <strong><a href="https://carsaiytstudio.vercel.app">Site oficial — carsaiytstudio.vercel.app</a></strong>
  </p>
</div>

---

<a id="pt"></a>
## 🇲🇿 Português

### O que é?

O **Carsai YT Studio v3** é uma alternativa ao YouTube Studio com superpoderes: analisa o teu canal, otimiza SEO, modera a comunidade, automatiza tarefas repetitivas, explora **toda a YouTube Data API v3** e usa agentes de IA — tudo numa única aplicação que corre no **browser (PWA), Android/iOS (Capacitor) e desktop (Electron)**.

Ao contrário da versão anterior, a v3 é **local-first**: os teus dados e chaves de API vivem apenas no teu dispositivo. Sem Firebase, sem backend obrigatório, sem servidores intermédios. Open-source sob licença **MIT**.

### Funcionalidades

| | Funcionalidade | Descrição |
|--|---|---|
| 📊 | **Painel & Analytics** | KPIs com sparklines, gráficos de 28/90 dias, origens de tráfego, curva de retenção, heatmap de melhores horários, exportação CSV |
| 📈 | **Gráficos alternáveis (novo)** | Troca o tipo de gráfico em qualquer painel: **linha, área, barras, circular (donut), radar e 3D** |
| 🎬 | **Biblioteca de conteúdo** | Pesquisa, filtros, editor de metadados com score SEO ao vivo, capítulos, pré-visualização de miniatura |
| 🛰️ | **YouTube Hub (novo)** | Toda a YouTube Data API v3 num só lugar: tendências por região/categoria, pesquisa global (vídeos/canais/playlists), playlists, subscrições, atividades, transmissões live e taxonomias oficiais (categorias, regiões i18n, idiomas) |
| 🔍 | **Estúdio SEO** | Otimizador de títulos com checklist, laboratório de tags (extração real via API), pesquisa de palavras-chave (autocomplete público), análise de concorrentes |
| 💬 | **Comunidade** | Caixa de entrada com sentimentos, respostas por IA, modelos de resposta, moderação (aprovar/ocultar/spam) |
| 🤖 | **Estúdio IA multi-provedor** | Chat com contexto do canal, roteiros, 10 ideias, respostas — **Gemini, Groq, OpenRouter, Mistral, Hugging Face, OpenAI, Claude, DeepSeek, Together + locais (Ollama, LM Studio) + provedores personalizados ilimitados** (OpenAI-compatible / Gemini / Anthropic) |
| ⚡ | **Automação** | Motor de regras acionador→condições→ações: responder, gerar ideias, aplicar tags, notificar, webhooks. Modelos prontos e registo de execuções |
| 🔌 | **Integrações** | Cofre de chaves local para **16 serviços** públicos/gratuitos (YouTube API, Gemini, Groq, OpenRouter, Mistral, DeepSeek, Together, Ollama, LM Studio, Pexels, Unsplash, Pixabay, webhooks…) |
| 🧰 | **Ferramentas** | Teste A/B de miniaturas em tamanho real, tendências por região, planeador de uploads, backup/exportação JSON |
| 🎯 | **Objetivos (novo)** | Metas do canal (subs, views, horas, vídeos) com progresso no painel |
| 🎨 | **Temas & acentos (novo)** | Tema Obsidian dark/light + **4 acentos personalizáveis** (Flame, Orchid, Ocean, Volt) |
| 🌍 | **Multi-idioma** | Português · English · Español |
| ⌨️ | **Command palette** | `Cmd/Ctrl+K` para navegar e executar ações |
| 📲 | **PWA instalável (novo)** | Instala como app nativa no desktop e Android — funciona offline após a primeira visita |
| 📱 | **Multi-plataforma** | Web · Android/iOS (Capacitor) · Windows/macOS/Linux (Electron) |

### Início rápido

```bash
git clone https://github.com/carsaimz/carsai-yt-studio.git
cd carsai-yt-studio
npm install
npm run dev
```

1. Abre `http://localhost:3000`
2. Escolhe **Explorar em modo Demo** (dados de exemplo, zero configuração) ou liga o teu canal com uma chave gratuita da [YouTube Data API v3](https://console.cloud.google.com/apis/library/youtube.googleapis.com)
3. Opcionalmente configura IA gratuita em **Definições → Provedores de IA** (Gemini / Groq / OpenRouter / Mistral — ou Ollama local)

### Plataformas

| Plataforma | Comando | Notas |
|---|---|---|
| 🌐 Web | `npm run dev` / `npm run build` | Next.js standalone + PWA |
| 📱 Android | `npm run cap:android` | `build:mobile` (export estático) + `cap sync` |
| 🖥️ Desktop | `npm run electron:dev` | carrega a app web; `electron:build` gera instaladores |

> 📖 Consulta o [SETUP.md](SETUP.md) para instruções detalhadas de cada plataforma e obtenção de chaves gratuitas.

### Tecnologias

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · Zustand (persistência local) · Recharts · Framer Motion · Lucide · Capacitor 6 · Electron 33

### Arquitetura

```
src/
  app/                    # Next.js App Router (rota única / — SPA + PWA)
  components/studio/
    studio-app.tsx        # shell: topbar, sidebar, navegação SPA, acentos, novidades
    views/                # 12 vistas: dashboard, analytics, content, video, youtube (Hub),
                          # seo, community, ai, automation, integrations, tools, settings
  lib/studio/
    youtube.ts            # cliente YouTube Data API v3 completo (browser, CORS)
    ai.ts                 # motor multi-provedor (online, local, personalizado) + cérebro demo
    seo.ts                # motor de pontuação e sugestões SEO
    automation.ts         # motor de regras (tick 60s) + modelos
    store.ts              # Zustand + localStorage (local-first) com migrações
    i18n.tsx              # dicionários PT/EN/ES
    demo-data.ts          # dataset demo determinístico
```

### Segurança e privacidade

- 🔐 As chaves de API ficam em `localStorage` **apenas no teu dispositivo**
- 🌐 Chamadas externas vão diretamente do teu browser para as APIs oficiais
- 🚫 Sem analytics, telemetria ou servidores intermédios
- 🧹 Backup/exportação em **Definições**; zona de risco repõe tudo

### Contribuir

Contribuições são muito bem-vinas! Lê [CONTRIBUTING.md](CONTRIBUTING.md), participa nas [Discussões](https://github.com/carsaimz/carsai-yt-studio/discussions) e consulta o [roadmap público](https://github.com/carsaimz/carsai-yt-studio/discussions/1). Bom primeiro ponto de partida: [`good first issue`](https://github.com/carsaimz/carsai-yt-studio/labels/good%20first%20issue).

---

<a id="en"></a>
## 🇺🇸 English

### What is it?

**Carsai YT Studio v3** is a YouTube Studio alternative with superpowers: analyze your channel, optimize SEO, moderate your community, automate repetitive work, explore the **entire YouTube Data API v3** and use AI agents — all in one app that runs on **browser (PWA), Android/iOS (Capacitor) and desktop (Electron)**.

Unlike the previous version, v3 is **local-first**: your data and API keys live only on your device. No Firebase, no required backend, no middleman servers. Open-source under **MIT**.

### Features

- **Dashboard & Analytics** — KPI sparklines, 28/90-day charts, traffic sources, retention curve, best-time heatmap, CSV export
- **Switchable charts (new)** — swap chart type on any panel: **line, area, bars, donut, radar and 3D**
- **YouTube Hub (new)** — the full Data API v3 surface: trending by region/category, global search, playlists, subscriptions, activities, live broadcasts and official taxonomies
- **Content library** — search, filters, live SEO score metadata editor, chapters, thumbnail preview
- **SEO Studio** — title optimizer checklist, real tag extraction via API, keyword research, competitor analysis
- **Community** — sentiment inbox, AI-suggested replies, reply templates, moderation
- **AI Studio (multi-provider)** — channel-aware chat, scripts, ideas, replies: **Gemini, Groq, OpenRouter, Mistral, Hugging Face, OpenAI, Claude, DeepSeek, Together + local (Ollama, LM Studio) + unlimited custom providers**
- **Automation** — trigger→conditions→actions rule engine with templates and run log
- **Integrations** — local key vault for 16 public/free services
- **Goals (new)**, **accent themes (new)**, **PWA (new)**, multi-language (PT/EN/ES), command palette

### Quick start

```bash
git clone https://github.com/carsaimz/carsai-yt-studio.git
cd carsai-yt-studio
npm install
npm run dev
```

Open `http://localhost:3000`, pick **Demo mode** (sample data, zero setup) or connect your channel with a free [YouTube Data API v3](https://console.cloud.google.com/apis/library/youtube.googleapis.com) key. Optionally add free AI under **Settings → AI providers** (Gemini / Groq / OpenRouter / Mistral — or local Ollama).

---

<a id="es"></a>
## 🇪🇸 Español

### ¿Qué es?

**Carsai YT Studio v3** es una alternativa a YouTube Studio con superpoderes: analiza tu canal, optimiza el SEO, modera la comunidad, automatiza el trabajo repetitivo, explora **toda la YouTube Data API v3** y usa agentes de IA — todo en una app que funciona en **navegador (PWA), Android/iOS (Capacitor) y escritorio (Electron)**.

A diferencia de la versión anterior, la v3 es **local-first**: tus datos y claves de API viven solo en tu dispositivo. Sin Firebase, sin backend obligatorio. Open-source bajo licencia **MIT**.

### Inicio rápido

```bash
git clone https://github.com/carsaimz/carsai-yt-studio.git
cd carsai-yt-studio
npm install
npm run dev
```

Abre `http://localhost:3000`, elige **modo Demo** o conecta tu canal con una clave gratuita de la YouTube Data API v3. Añade IA gratuita en **Ajustes → Proveedores de IA**.

---

## Licença / License

MIT — ver [LICENSE](LICENSE).
