# Plano de Refundação – Carsai YT Studio

Vou reconstruir a plataforma para que tudo funcione com dados reais desde o primeiro acesso. Sem mocks. Todas as chaves e configs ficam no dispositivo do usuário (localStorage + IndexedDB), exceto a auth global que usa Firebase (cada usuário cola sua própria config do Firebase no wizard — assim continua "frontend-only" e cada um usa seu próprio projeto, ou um projeto padrão configurado por env).

> Importante: este plano é grande. Vou executar tudo em uma sequência de mensagens, mas cada mensagem entrega um bloco funcional e testável. Estimativa: 4-6 mensagens grandes.

---

## 1. Wizard de Instalação (`/setup`)

Rota gate: se `setup.completed !== true`, qualquer rota redireciona para `/setup`.

Passos:
1. **Boas-vindas** – tour, requisitos, política de privacidade resumida.
2. **Firebase (obrigatório)** – usuário cola `apiKey`, `authDomain`, `projectId`, `appId`. Validação ao vivo (`initializeApp` + ping `auth`).
3. **YouTube Data API v3 (obrigatório)** – API Key + teste real (`GET /youtube/v3/channels?mine=true` exige OAuth; usamos `search?part=snippet&q=test` para validar a key).
4. **Google OAuth (opcional, recomendado)** – Client ID; fluxo PKCE no browser para obter `access_token` com escopo `youtube.readonly`, `youtube.force-ssl`, `yt-analytics.readonly`.
5. **Provedores de IA (opcional)** – grid com os 18 provedores; usuário ativa quais quiser e cola cada key. Botão "Testar" por provedor.
6. **Preferências** – tema (dark/light/system), idioma (pt-BR/en), unidades, notificações.
7. **Resumo + Finalizar** – grava tudo cifrado com AES-GCM (chave derivada de PIN opcional via PBKDF2).

Componentes: `SetupLayout`, `StepIndicator`, `StepCard`, `ProviderToggle`, `KeyInput` (com mostrar/ocultar, validar, status badge).

## 2. Integrações reais

### YouTube
- `src/lib/youtube/client.ts` – wrapper fetch com refresh de token OAuth, paginação, quota tracking.
- Hooks TanStack Query: `useMyChannel`, `useMyVideos`, `useVideoAnalytics`, `useComments`, `usePlaylists`, `useSearch`, `useCaptions`.
- Sem OAuth, modo "público": usa API key para buscar canais/vídeos por ID que o usuário cole.

### IA Multi-Provedor
- `src/lib/ai/registry.ts` – metadata dos 18 provedores (Gemini, Groq, OpenAI, Anthropic, Mistral, Cohere, Together, Perplexity, OpenRouter, DeepSeek, xAI, HuggingFace, Replicate, Fireworks, Cerebras, SambaNova, AI21, NVIDIA NIM).
- `src/lib/ai/router.ts` – `chat({messages, prefer, fallbackChain})` com fallback em cascata e streaming SSE.
- `src/lib/ai/tasks/` – tarefas prontas: gerar título, descrição, tags SEO, roteiro, ideias, traduções, resposta a comentários, análise de sentimento.

### Firebase
- Auth (Email/senha + Google OAuth do Firebase, separado do OAuth do YouTube).
- Firestore opcional: armazenar preferências sincronizadas entre dispositivos (toggle no setup).
- Realtime: feed de "novidades do app" lido de uma coleção pública (read-only para usuários).

## 3. Páginas (todas reais, dinâmicas)

App (auth-gated):
- `/` Dashboard – métricas reais do canal, gráficos Recharts, próximos uploads, alertas.
- `/analytics` – views/watch time/CTR/retenção via YouTube Analytics API.
- `/content/videos`, `/content/playlists`, `/content/shorts`, `/content/live` – CRUD real (editar título, descrição, tags, thumbnail).
- `/community/comments`, `/community/inbox` – responder com IA assistida.
- `/seo` – análise de tags, sugestões, comparador, score, keyword research (DataForSEO opcional).
- `/studio/thumbnail` – editor com Fabric.js (canvas, layers, templates, export PNG).
- `/studio/script` – editor de roteiro com IA streaming.
- `/studio/scheduler` – calendário (FullCalendar) de uploads agendados (localStorage).
- `/ai/chat`, `/ai/agents`, `/ai/playground` – chat real com fallback.
- `/notifications` – central de notificações (in-app + push opcional).
- `/profile`, `/settings/{geral,integracoes,ia,aparencia,privacidade,backup}`.
- `/about` – versão atual, changelog, **verificador de updates** (`GET api.github.com/repos/{owner}/{repo}/releases/latest`).

Públicas:
- `/welcome` landing pré-login.
- `/auth/login`, `/auth/register`, `/auth/reset-password`, `/auth/verify`.
- `/setup` wizard.
- `/docs` – documentação de uso (MDX-like, busca interna, sidebar).
- `/help` – central de ajuda com FAQ + busca + categorias + ticket via mailto.
- `/changelog` – histórico de versões puxado do GitHub Releases.
- `/privacy`, `/terms`, `/cookies`, `/security`, `/dmca`, `/acceptable-use`.
- `/status` – status das integrações do usuário (ping local).
- `/404`, `/500`, `/offline`.

## 4. UX, animações, notificações

- **Framer Motion** – transições de página, stagger nas listas, modals.
- **Lottie** (`lottie-react`) – ilustrações no wizard, empty states, sucesso/erro.
- **tsParticles** – fundo do hero/welcome.
- **Sonner** – toasts ricos com ações (já instalado).
- **Notificações in-app** – sino no header, drawer com histórico, badge animada.
- **Web Push** – via Firebase Cloud Messaging (opcional, ativa no settings).
- **Skeletons + Suspense** – loading lazy em todas rotas (`React.lazy` + `Suspense`).
- **Microinterações** – hover tilts, ripple em botões, progress nos uploads.
- **Comando ⌘K** – paleta de comandos com `cmdk` (já no shadcn).

## 5. Mobile, PWA, Desktop

- Responsividade total (grid + min-w-0 + shrink-0 padrão), bottom-nav no mobile (<768px), sidebar colapsável no desktop.
- **PWA** – `vite-plugin-pwa` com `NetworkFirst` em HTML, ícones, splash, página `/offline`.
- **Capacitor** – já configurado; adiciono plugins `@capacitor/app`, `@capacitor/preferences`, `@capacitor/push-notifications`, `@capacitor/share`, `@capacitor/filesystem`, `@capacitor/status-bar`, `@capacitor/splash-screen`, `@capacitor/haptics`.
- **Desktop** – **Tauri** (mais leve que Electron) com workflow build.

## 6. Build & Release Pipelines (`.github/workflows/`)

- `web.yml` – build Vite + deploy Pages (artifact).
- `android.yml` – `bun run build && npx cap sync android && ./gradlew assembleRelease bundleRelease` → uploads `.apk` e `.aab`.
- `ios.yml` – `xcodebuild archive` + `exportArchive` (`runs-on: macos-latest`) → `.ipa`.
- `desktop.yml` – Tauri matrix (windows/macos/linux) → instaladores.
- `release.yml` – orquestra tudo no push de tag `v*`, cria GitHub Release com todos artifacts e changelog automático.

Scripts em `scripts/`:
- `version-bump.mjs` – sobe semver, atualiza `package.json`, `capacitor.config.json`, `tauri.conf.json`, gera CHANGELOG.
- `check-updates.mjs` – usado pelo cliente in-app.

## 7. Estrutura técnica resumida

```
src/
  components/
    setup/         (wizard steps)
    layout/        (AppShell, BottomNav, Header, Sidebar)
    ui/            (shadcn)
    notifications/
    animations/
  lib/
    firebase/      (init, auth, firestore, messaging)
    youtube/       (client, oauth, hooks)
    ai/            (registry, router, tasks, streaming)
    crypto/        (AES-GCM, PBKDF2)
    storage/       (localStorage + IndexedDB via idb-keyval)
    updates/       (github releases checker)
    i18n/          (pt-BR, en)
  routes/
    __root.tsx     (gate setup + auth)
    setup.tsx
    welcome.tsx
    auth/*.tsx
    _app/*.tsx     (todas rotas auth-gated)
    docs/*.tsx
    help.tsx, privacy.tsx, terms.tsx, ...
```

## 8. Pacotes a instalar

`firebase`, `framer-motion`, `lottie-react`, `@tsparticles/react @tsparticles/slim`, `fabric`, `@fullcalendar/react @fullcalendar/daygreen @fullcalendar/timegrid @fullcalendar/interaction`, `idb-keyval`, `@tanstack/react-query`, `@capacitor/app @capacitor/preferences @capacitor/push-notifications @capacitor/share @capacitor/filesystem @capacitor/status-bar @capacitor/splash-screen @capacitor/haptics`, `cmdk`, `date-fns`, `react-markdown remark-gfm`, `fuse.js` (busca docs).

---

## Ordem de execução

1. **Msg 1** – Setup wizard + Firebase auth + gate de rotas + tema/i18n + storage cifrado.
2. **Msg 2** – YouTube client real + hooks + dashboard/analytics/content páginas reais.
3. **Msg 3** – IA router + chat + agentes + tarefas + studio (thumbnail/script/scheduler).
4. **Msg 4** – Páginas públicas (docs, help, legais, changelog, about+updater), notificações, animações, ⌘K.
5. **Msg 5** – PWA, Capacitor plugins, responsividade mobile/bottom-nav, Tauri.
6. **Msg 6** – GitHub Actions workflows, scripts de versão, README/CONTRIBUTING.

Confirma que posso seguir nessa ordem? Se sim, começo já pela Msg 1.
