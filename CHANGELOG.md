# Changelog

Todas as alterações notáveis deste projecto estão documentadas aqui.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
versionamento segue [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Em progresso
- Integração com YouTube Analytics API (OAuth)
- Agente de IA para geração automática de títulos e descrições
- Modo offline com sincronização em background

---

## [0.3.0] — 2026-06-23

### Adicionado
- **Ícone oficial** da plataforma — letra C com circuitos, engrenagem e chave, fundo vermelho
- **Font Awesome 6** integrado globalmente (`fas` + `fab`) — substituiu Lucide em toda a UI
- **React Toastify** para notificações toast (`toast.success`, `toast.error`, `toast.loading`, etc.)
- **SweetAlert2** para confirmações e alertas modais com tema escuro personalizado
- **`src/lib/notifications.ts`** — utilitário centralizado (`toast`, `confirm`, `confirmDelete`, `alert`, `prompt`)
- **`cross-env`** — compatibilidade de variáveis de ambiente em Windows/macOS/Linux
- **`scripts/build-web.mjs`** — build universal com detecção automática do output do Nitro
- **`npm run build:mobile`** — build com geração automática de `index.html` para Capacitor
- Ícones para todas as plataformas: web (PWA), Android (mipmap-*), Tauri (Win/Mac/Linux)
- `favicon.ico` multi-tamanho (16+32+48px)
- `apple-touch-icon.png` (180px) para iOS PWA

### Alterado
- Migração de **Bun** para **npm** — removidos `bun.lock` e `bunfig.toml`
- Todos os workflows GitHub Actions actualizados (`npm install` em vez de `bun install`)
- `vercel.json` — preset `node-server`, rotas SSR via `dist/server/server.js`
- `capacitor.config.json` — `webDir` actualizado para `dist/client`
- `netlify.toml` — `publish` actualizado para `dist/client`
- Sidebar usa ícone real da app em vez de ícone Font Awesome
- Página de autenticação usa ícone real da app

### Corrigido
- `npm ci` substituído por `npm install` (sem lockfile)
- `cache: npm` removido dos workflows (requer lockfile)
- `--dist-dir` do `tauri init` substituído por `tauri.conf.json` directo (argumento removido no Tauri v2)
- Caminhos relativos (`./assets/`) no `index.html` gerado para Capacitor (absolutos falhavam com `capacitor://localhost`)
- Condições `if: ${{ secrets.X != '' }}` substituídas por `$GITHUB_ENV` (secrets não são expostos em condições)
- `BUILD_TARGET=mobile` via `cross-env` para compatibilidade com PowerShell (Windows runners)
- Repositório renomeado de `carsaimz/carsai-yt-studio` para `carsaimz/carsai-yt-studio-pro`

---

## [0.2.0] — 2026-06-22

### Adicionado
- Dashboard com métricas do canal (inscritos, visualizações, vídeos)
- Gráfico de crescimento estimado (Recharts AreaChart)
- Grid de últimos uploads com thumbnails e hover overlay
- `TopBar` com busca, link YouTube Studio, notificações e perfil
- Página de autenticação com login por e-mail/password e Google OAuth
- Fluxo de setup guiado (`/welcome` → `/setup`)
- Verificador de actualizações automático (`src/lib/updates/checker.ts`)
- Suporte a Capacitor (Android + iOS)
- Suporte a Tauri v2 (Windows + macOS + Linux)
- Workflows GitHub Actions: `web.yml`, `android.yml`, `ios.yml`, `desktop.yml`, `release.yml`
- `vercel.json` e `netlify.toml` configurados
- `Dockerfile` e `docker-compose.yml` para self-hosting

### Alterado
- Preset Nitro de `cloudflare` (default Lovable) para `node-server` / `static`
- Output de `.output/public` para `dist/client`

---

## [0.1.0] — 2026-06-20

### Adicionado
- Estrutura inicial do projecto (TanStack Start + React 19 + Tailwind v4)
- Routing file-based com TanStack Router
- Integração Firebase (Auth + Firestore)
- Cliente YouTube Data API v3
- Tema escuro com design system próprio (CSS custom properties)
- Sidebar com navegação completa
- Páginas: Dashboard, Analytics, Conteúdo, Estúdio, SEO, Comunidade, IA, Perfil, Configurações
- Páginas públicas: Docs, Ajuda, Sobre, Changelog, Privacidade, Termos, Cookies, Segurança
- shadcn/ui como biblioteca de componentes base
- Framer Motion para animações

[Unreleased]: https://github.com/carsaimz/carsai-yt-studio-pro/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/carsaimz/carsai-yt-studio-pro/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/carsaimz/carsai-yt-studio-pro/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/carsaimz/carsai-yt-studio-pro/releases/tag/v0.1.0
