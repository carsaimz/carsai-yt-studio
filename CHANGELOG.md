# Changelog — Carsai YT Studio

Todas as alterações notáveis deste projeto estão documentadas aqui. O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o versionamento usa [SemVer](https://semver.org/lang/pt-BR/).

## [3.2.0] — 2026-11-16

### Adicionado

- **Google OAuth 2.0** — liga a conta Google com PKCE usando o client OAuth do utilizador (credenciais e tokens apenas no dispositivo); captura automática de loopback no Electron (redirect `http://localhost:8765/`) e colagem manual do código em qualquer plataforma; *refresh token* aplicado automaticamente quando o access token expira
- **YouTube Analytics API v2** — nova aba **Live · Analytics** na vista Analytics: relatórios reais diários do canal (views, minutos assistidos, subscritores ganhos/perdidos, likes, comentários, partilhas) e top vídeos do período, com gráficos e exportação CSV
- **Recursos da Data API só com OAuth** — playlists próprias (`mine=true`) e legendas do canal via token OAuth (lib `gapi.ts`)
- **Modo web demo explícito** — quando aberto num navegador comum a plataforma entra em modo de teste/demonstração: banner permanente com link para descarregar a app, alternador "Ao vivo" bloqueado com explicação, onboarding adaptado e secção OAuth desativada na web
- **Verificador de atualizações** — consulta o último release do GitHub no arranque e mostra um toast com link quando existe versão mais recente
- **Electron** — IPC `carsai:oauth-loopback` no main process (servidor loopback seguro, timeout 5 min) + preload com `contextIsolation`

### Melhorado

- Onboarding distingue a web demo (cartão "Ligar canal" desativado com nota de acesso total nas apps) das apps instaladas
- Store persistida **v5** com estado `googleAuth` e migração automática v3/v4→v5
- i18n (PT/EN/ES) completa para todos os novos ecrãs (OAuth, analytics live, banner web, atualizações)

### Notas

- A versão web fica apenas para **testes e demonstração** — a funcionalidade completa (dados reais, OAuth, automação) corre em Electron (desktop) e Capacitor (telemóvel)

## [3.1.0] — 2026-11-15

### Adicionado

- **YouTube Hub** — nova vista com toda a YouTube Data API v3: tendências por região e categoria, pesquisa global (vídeos, canais, playlists) com ordenação, playlists com detalhe de vídeos, subscrições do canal, feed de atividades, pesquisa de transmissões em direto e taxonomias oficiais (categorias de vídeo, regiões i18n, idiomas i18n)
- **Motor de IA multi-provedor v2** — provedores **locais** (Ollama, LM Studio), novos serviços online (Mistral, DeepSeek, Together) e **provedores personalizados ilimitados** (OpenAI-compatible, Gemini ou Anthropic) com nome, base URL, modelo e chave; teste de conectividade com latência em Definições
- **Gráficos alternáveis** — seletor de tipo de gráfico (linha, área, barras, circular/donut, radar e **3D isométrico**) no Dashboard e Analytics, com preferência guardada
- **Cor de acento** — 4 paletas personalizáveis para o tema Obsidian (Flame, Orchid, Ocean, Volt), aplicáveis em Definições ou pela command palette
- **Objetivos do canal** — metas por métrica (subscritores, views, horas vistas, vídeos) geridas em Definições
- **Novidades por versão** — diálogo "What's new" mostrado uma vez por lançamento, reabrível em Definições
- **PWA instalável** — manifest, ícones (normal + maskable) e metadados completos
- **CI + Releases** — GitHub Actions (`ci.yml` typecheck/lint/build; `release.yml` publica artefactos e notas a partir do CHANGELOG), templates de issues/PR, FUNDING e Discussions habilitadas
- `npm run typecheck` e migração do armazenamento local v3→v4

### Melhorado

- **Responsividade global** — corrigidos textos e tabelas que ultrapassavam cartões; barra superior sem arrasto horizontal (overflow-x clip), filtros e selects com quebra de linha, chat e gráficos contidos, URLs/IDs longos quebráveis
- **Tema Obsidian refinado** — cartões com borda gradiente adaptável ao acento, tipografia balanceada, scrollbar com acento, utilitários de quebra de texto
- **Landing de primeira abertura** — nova página inicial premium (badges, funcionalidades, animações); mostra-se apenas na primeira abertura e, com o modo Ao vivo configurado, a aplicação cai sempre no Dashboard
- Command palette com ações de acento; integrações atualizadas para 16 serviços; modo Demo/Ao vivo compacto no telemóvel

### Corrigido

- Erros de tipos acumulados (actions de automação, catálogo de integrações, packs demo)
- `ChartTooltip` ultrapassava o cartão em ecrãs pequenos

## [3.0.0] — 2026-11-15

### Reescrita

- **Stack nova**: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4 · shadcn/ui · Zustand · Recharts · Framer Motion
- **Local-first**: sem Firebase — dados e chaves em `localStorage`; modo Demo com dataset determinístico
- **Design novo**: tema "Obsidian" dark-first com acento gradiente flame, glass topbar, cartões com luz de foco, tema claro incluído
- **SPA de rota única** com 11 vistas navegáveis + command palette `Cmd/Ctrl+K`
- **Multi-plataforma**: Capacitor (Android/iOS, export estático ou shell remoto) e Electron (standalone local ou APP_URL)

### Novas funcionalidades

- **Automação**: motor de regras acionador→condições→ações (comentários, vídeos, marcos, agendador 60s), modelos prontos, registo de execuções, webhooks
- **Integrações**: cofre de chaves local para 11 serviços públicos/gratuitos (YouTube, Gemini, Groq, OpenRouter, OpenAI, Claude, HF, Pexels, Unsplash, Pixabay, webhook universal)
- **Ferramentas**: teste A/B de miniaturas em tamanhos reais do YouTube, tendências por região (mostPopular), planeador de uploads com estados, backup/exportação JSON
- **IA multi-provedor**: 6 provedores com fallback demo local sem chave; chat com contexto do canal, roteiros com timestamps, 10 ideias, respostas a comentários
- **Estúdio SEO**: otimizador de títulos (checklist ponderada), extração real de tags por API, pesquisa de keywords via autocomplete público (com fallback), análise de concorrentes
- **Comunidade**: sentimentos, resposta sugerida por IA, modelos, moderação
- **i18n PT/EN/ES** completo · modo claro/escuro · heatmap de melhores horários · exportação CSV

### Removido

- Firebase Authentication/Firestore e dependências associadas
- TanStack Start/Router e Vite (substituídos por Next.js App Router)
- Configurações Docker/Netlify legadas da v2

### Migração

A v3 usa armazenamento novo (`carsai-yt-studio-v3`); os dados da v2 não migram automaticamente — exporta da v2 e importa em Ferramentas → Backup.

## [1.x] — herança

Aplicação React 19 + TanStack Start + Firebase com analytics, gestão de conteúdo, comunidade, SEO e IA (v1.0.0 → v1.1.3). Substituída pela v3.

[3.1.0]: https://github.com/carsaimz/carsai-yt-studio/releases/tag/v3.1.0
[3.0.0]: https://github.com/carsaimz/carsai-yt-studio/releases/tag/v3.0.0
[1.x]: https://github.com/carsaimz/carsai-yt-studio/releases
