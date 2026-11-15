# Changelog — Carsai YT Studio

## v3.0.0 — Rebuild completo (2026)

Reconstrução total da plataforma em Next.js 16 + Capacitor + Electron, abandonando TanStack Start + Firebase.

### Reescrita

- **Stack nova**: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4 · shadcn/ui · Zustand · Recharts · Framer Motion
- **Local-first**: sem Firebase — dados e chaves em `localStorage`; modo Demo com dataset determinístico
- **Design novo**: tema "Obsidian" dark-first com acento gradiente flame, glass topbar, cartões com luz de foco, tema claro incluído
- **SPA de rota única** com 11 vistas navegáveis + command palette `Cmd/Ctrl+K`
- **Multi-plataforma**: Capacitor (Android/iOS, export estático ou shell remoto) e Electron (standalone local ou APP_URL)

### Novas funcionalidades

- ⚡ **Automação**: motor de regras acionador→condições→ações (comentários, vídeos, marcos, agendador 60s), modelos prontos, registo de execuções, webhooks
- 🔌 **Integrações**: cofre de chaves local para 11 serviços públicos/gratuitos (YouTube, Gemini, Groq, OpenRouter, OpenAI, Claude, HF, Pexels, Unsplash, Pixabay, webhook universal)
- 🧰 **Ferramentas**: teste A/B de miniaturas em tamanhos reais do YouTube, tendências por região (mostPopular), planeador de uploads com estados, backup/exportação JSON
- 🤖 **IA multi-provedor**: 6 provedores com fallback demo local sem chave; chat com contexto do canal, roteiros com timestamps, 10 ideias, respostas a comentários
- 🔍 **Estúdio SEO**: otimizador de títulos (checklist ponderada), extração real de tags por API, pesquisa de keywords via autocomplete público (com fallback), análise de concorrentes
- 💬 **Comunidade**: sentimentos, resposta sugerida por IA, modelos, moderação
- 🌍 i18n PT/EN/ES completo · modo claro/escuro · heatmap de melhores horários · exportação CSV

### Removido

- Firebase Authentication/Firestore e dependências associadas
- TanStack Start/Router e Vite (substituídos por Next.js App Router)
- Configurações Docker/Netlify legadas da v2

### Migração

A v3 usa armazenamento novo (`carsai-yt-studio-v3`); os dados da v2 não migram automaticamente — exporta da v2 e importa em Ferramentas → Backup.

## v2.x — herança

Aplicação React 19 + TanStack Start + Firebase com analytics, gestão de conteúdo, comunidade, SEO e IA. Substituída pela v3.
