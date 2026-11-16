<div align="center">
  <img src="public/icon.svg" alt="Carsai YT Studio" width="110" height="110" />

  <h1>Carsai YT Studio</h1>

  <p>
    <strong>Plataforma local-first para criadores YouTube — analytics, SEO, comunidade, automação e IA</strong>
  </p>

  <p><strong>Ler em:</strong>
    <a href="README.md">English</a> ·
    <a href="README.pt.md">Português</a> ·
    <a href="README.es.md">Español</a> ·
    <a href="README.fr.md">Français</a> ·
    <a href="README.de.md">Deutsch</a> ·
    <a href="README.it.md">Italiano</a> ·
    <a href="README.zh.md">中文</a>
  </p>

  <p>🌐 <strong><a href="https://carsaiytstudio.vercel.app">Site oficial — carsaiytstudio.vercel.app</a></strong></p>
</div>

---

## O que é?

O **Carsai YT Studio v3** é uma alternativa ao YouTube Studio com superpoderes: analisa o teu canal, otimiza SEO, modera a comunidade, automatiza tarefas repetitivas, explora **toda a YouTube Data API v3** e usa agentes de IA — tudo numa única aplicação que corre no **browser (PWA), Android/iOS (Capacitor) e desktop (Electron)**.

A v3 é **local-first**: os teus dados e chaves de API vivem apenas no teu dispositivo. Sem Firebase, sem backend obrigatório, sem servidores intermédios. Open-source sob licença **MIT**.

> **Nota sobre a web**: a versão web funciona apenas como **teste e demonstração** (dados de exemplo, sem ligações reais). A experiência completa — dados reais, OAuth e automação — corre nas apps **Electron (desktop)** e **Capacitor (telemóvel)**, descarregáveis nos [Releases](https://github.com/carsaimz/carsai-yt-studio/releases/latest).

## Funcionalidades

| | Funcionalidade | Descrição |
|--|---|---|
| 📊 | **Painel & Analytics** | KPIs com sparklines, gráficos de 28/90 dias, origens de tráfego, curva de retenção, heatmap de melhores horários, exportação CSV |
| 📈 | **Gráficos alternáveis** | Troca o tipo de gráfico em qualquer painel: **linha, área, barras, circular (donut), radar e 3D** |
| 🔐 | **OAuth Google** | OAuth com PKCE — playlists próprias, legendas e **relatórios reais da YouTube Analytics API v2** (métricas diárias + top vídeos + CSV); captura automática loopback no Electron |
| 🎬 | **Biblioteca de conteúdo** | Pesquisa, filtros, editor de metadados com score SEO ao vivo, capítulos, pré-visualização de miniatura |
| 🛰️ | **YouTube Hub** | Toda a Data API v3 num só lugar: tendências por região/categoria, pesquisa global (vídeos/canais/playlists), playlists, subscrições, atividades, transmissões live e taxonomias oficiais |
| 🔍 | **Estúdio SEO** | Otimizador de títulos com checklist, extração real de tags via API, pesquisa de palavras-chave (autocomplete público), análise de concorrentes |
| 💬 | **Comunidade** | Caixa de entrada com sentimentos, respostas por IA, modelos de resposta, moderação (aprovar/ocultar/spam) |
| 🤖 | **Estúdio IA multi-provedor** | Chat com contexto do canal, roteiros, ideias, respostas — **Gemini, Groq, OpenRouter, Mistral, Hugging Face, OpenAI, Claude, DeepSeek, Together + locais (Ollama, LM Studio) + provedores personalizados ilimitados** |
| ⚡ | **Automação** | Motor de regras acionador→condições→ações: responder, gerar ideias, aplicar tags, notificar, webhooks. Modelos prontos e registo de execuções |
| 🔌 | **Integrações** | Cofre de chaves local para **16 serviços** públicos/gratuitos (YouTube API, Gemini, Groq, OpenRouter, Mistral, DeepSeek, Together, Ollama, LM Studio, Pexels, Unsplash, Pixabay, webhooks…) |
| 🧰 | **Ferramentas** | Teste A/B de miniaturas em tamanho real, tendências por região, planeador de uploads, backup/exportação JSON |
| 🎯 | **Objetivos** | Metas do canal (subs, views, horas, vídeos) com progresso no painel |
| 🎨 | **Temas & acentos** | Tema Obsidian dark/light + **4 acentos personalizáveis** (Flame, Orchid, Ocean, Volt) |
| 🌍 | **Seis idiomas** | Português · English · Español · Français · Deutsch · Italiano |
| ⌨️ | **Command palette** | `Cmd/Ctrl+K` para navegar e executar ações |
| 📲 | **PWA instalável** | Instala como app nativa — funciona offline após a primeira visita |
| 📱 | **Multi-plataforma** | Web · Android/iOS (Capacitor) · Windows/macOS/Linux (Electron) |

## Descargas

Cada release inclui builds para todas as plataformas (ver [CHANGELOG.md](CHANGELOG.md) para novidades):

| Plataforma | Ficheiro |
|---|---|
| 🤖 Android | `carsai-yt-studio-vX.Y.Z-android.apk` · `.aab` |
| 🪟 Windows | `carsai-yt-studio-X.Y.Z-win-x64.exe` (instalador NSIS) |
| 🍎 macOS | `carsai-yt-studio-X.Y.Z-macos-*.dmg` |
| 🐧 Linux | `carsai-yt-studio-X.Y.Z-linux-x86_64.AppImage` · `.deb` |
| 🌐 Web | `carsai-yt-studio-vX.Y.Z-web.zip` (bundle self-host) |

👉 [Último release](https://github.com/carsaimz/carsai-yt-studio/releases/latest)

## Início rápido

```bash
git clone https://github.com/carsaimz/carsai-yt-studio.git
cd carsai-yt-studio
npm install
npm run dev
```

1. Abre `http://localhost:3000`
2. Escolhe **Explorar em modo Demo** (dados de exemplo, zero configuração) ou liga o teu canal com uma chave gratuita da [YouTube Data API v3](https://console.cloud.google.com/apis/library/youtube.googleapis.com)
3. Opcionalmente configura IA gratuita em **Definições → Provedores de IA** (Gemini / Groq / OpenRouter / Mistral — ou Ollama local)

## Plataformas

| Plataforma | Comando | Notas |
|---|---|---|
| 🌐 Web | `npm run dev` / `npm run build` | Next.js standalone + PWA |
| 📱 Android | `npm run cap:android` | `build:mobile` (export estático) + `cap sync` |
| 🖥️ Desktop | `npm run electron:dev` | carrega a app web; `electron:build` gera instaladores |

> 📖 Consulta o [SETUP.md](SETUP.md) para instruções detalhadas por plataforma e obtenção de chaves gratuitas. O roadmap público está em [ROADMAP.md](ROADMAP.md).

## Segurança e privacidade

- 🔐 As chaves de API ficam em `localStorage` **apenas no teu dispositivo**
- 🌐 Chamadas externas vão diretamente do teu browser para as APIs oficiais
- 🚫 Sem analytics, telemetria ou servidores intermédios
- 🧹 Backup/exportação em **Definições**; zona de risco repõe tudo

## Contribuir

Contribuições são muito bem-vinas! Lê [CONTRIBUTING.md](CONTRIBUTING.md), participa nas [Discussões](https://github.com/carsaimz/carsai-yt-studio/discussions) e consulta o [roadmap público](ROADMAP.md). Tradutores: os dicionários i18n em `src/lib/studio/i18n.tsx` são o local para adicionar um idioma.

## Licença

MIT — ver [LICENSE](LICENSE).
