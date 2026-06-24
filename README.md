<div align="center">
  <img src="public/icon-192.png" alt="Carsai YT Studio" width="96" height="96" />
  <h1>Carsai YT Studio</h1>
  <p>Plataforma híbrida para criadores YouTube — análise, SEO, comunidade e agentes de IA.</p>

  <p>
    <a href="https://github.com/carsaimz/carsai-yt-studio-pro/actions/workflows/web.yml">
      <img src="https://github.com/carsaimz/carsai-yt-studio-pro/actions/workflows/web.yml/badge.svg" alt="Web Build" />
    </a>
    <a href="https://github.com/carsaimz/carsai-yt-studio-pro/actions/workflows/android.yml">
      <img src="https://github.com/carsaimz/carsai-yt-studio-pro/actions/workflows/android.yml/badge.svg" alt="Android Build" />
    </a>
    <a href="https://github.com/carsaimz/carsai-yt-studio-pro/actions/workflows/desktop.yml">
      <img src="https://github.com/carsaimz/carsai-yt-studio-pro/actions/workflows/desktop.yml/badge.svg" alt="Desktop Build" />
    </a>
    <img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" />
    <img src="https://img.shields.io/badge/node-22+-green" alt="Node 22+" />
  </p>
</div>

---

## Visão geral

**Carsai YT Studio** é uma aplicação multi-plataforma (Web, Android, iOS, Windows, macOS, Linux) que centraliza a gestão de canais YouTube com inteligência artificial integrada.

| Funcionalidade | Descrição |
|---|---|
| 📊 **Analytics** | Métricas de crescimento, visualizações e inscritos |
| 🎬 **Estúdio** | Ferramentas de criação e edição de conteúdo |
| 🔍 **SEO** | Optimização de títulos, descrições e tags |
| 💬 **Comunidade** | Gestão de comentários e engagement |
| 🤖 **IA & Agentes** | Automações e assistentes multi-provedor |
| 🔔 **Notificações** | Alertas em tempo real do canal |

---

## Stack técnica

| Camada | Tecnologia |
|---|---|
| Framework | React 19 + TanStack Start (SSR) |
| Router | TanStack Router (file-based) |
| Build | Vite 8 + Nitro |
| Estilo | Tailwind CSS v4 |
| Auth | Firebase Authentication |
| DB | Firestore |
| Ícones | Font Awesome 6 |
| Notificações | React Toastify + SweetAlert2 |
| Animações | Framer Motion |
| Gráficos | Recharts |
| Mobile | Capacitor (Android + iOS) |
| Desktop | Tauri v2 (Win + Mac + Linux) |

---

## Início rápido

```bash
# 1. Clonar
git clone https://github.com/carsaimz/carsai-yt-studio-pro.git
cd carsai-yt-studio-pro

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com as suas chaves Firebase e YouTube API

# 4. Iniciar em desenvolvimento
npm run dev
```

A app abre em `http://localhost:3000`.

---

## Variáveis de ambiente

Criar `.env` na raiz com:

```env
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# YouTube Data API v3 (opcional — pode configurar dentro da app)
VITE_YOUTUBE_API_KEY=
```

---

## Scripts disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção (Nitro SSR)
npm run build:web    # Build web com detecção automática de output
npm run build:mobile # Build para Capacitor (Android/iOS)
npm run preview      # Preview do build de produção
npm run lint         # ESLint
npm run typecheck    # TypeScript sem emit
npm run format       # Prettier
```

---

## Deploy

### Vercel (recomendado)

Ligar o repositório à Vercel. O `vercel.json` já está configurado com `NITRO_PRESET=node-server` e as rotas SSR correctas.

### Netlify

```bash
# Build command
npm run build

# Publish directory
dist/client
```

### Docker / Self-hosted

```bash
docker compose up --build
```

---

## Mobile (Android / iOS)

O GitHub Actions compila automaticamente ao criar uma tag `v*`.

Para compilar localmente:

```bash
# Instalar Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# Build web + sync
npm run build:mobile
npx cap sync android

# Abrir no Android Studio
npx cap open android
```

### Assinar o APK (GitHub Actions)

Criar os secrets no repositório via Termux:

```bash
# Gerar keystore (uma vez)
keytool -genkeypair -v \
  -keystore carsai-release.jks \
  -alias carsai -keyalg RSA -keysize 2048 -validity 10000

# Criar secrets
gh secret set KEYSTORE_BASE64 < <(base64 -w 0 carsai-release.jks)
gh secret set KEYSTORE_PASSWORD
gh secret set KEY_ALIAS
gh secret set KEY_PASSWORD
```

---

## Desktop (Tauri v2)

O workflow `desktop.yml` gera instaladores para Windows (`.msi`, `.exe`), macOS (`.dmg`) e Linux (`.AppImage`, `.deb`).

O `src-tauri/` é criado automaticamente em CI se não existir no repositório.

---

## Notificações (uso interno)

```ts
import { toast, confirm, confirmDelete, alert, prompt } from "@/lib/notifications";

toast.success("Guardado!");
toast.error("Algo correu mal.");

const ok = await confirm({ title: "Tem a certeza?", icon: "warning" });
const del = await confirmDelete("vídeo");
const nome = await prompt({ title: "Nome do canal" });
```

---

## Ícones (Font Awesome)

```tsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

<FontAwesomeIcon icon={["fas", "chart-line"]} />
<FontAwesomeIcon icon={["fab", "youtube"]} />
```

A biblioteca é registada globalmente em `__root.tsx` — não é necessário importar ícones individuais.

---

## Estrutura do projecto

```
src/
├── components/       # Componentes reutilizáveis
│   ├── ui/           # shadcn/ui primitivos
│   └── app-sidebar   # Navegação lateral
├── lib/
│   ├── firebase/     # Auth + Firestore
│   ├── youtube/      # YouTube Data API client
│   ├── notifications # Toast + SweetAlert2
│   └── updates/      # Verificador de actualizações
├── routes/           # Páginas (file-based routing)
└── styles.css        # Tema global (Tailwind v4 + CSS vars)

public/
├── icon-*.png        # Ícones web (PWA)
├── android-icons/    # Mipmap densities para Android
├── tauri-icons/      # Ícones para Tauri desktop
└── manifest.webmanifest

scripts/
├── build-web.mjs     # Build universal (detecta output Nitro)
├── cap-sync.mjs      # Build + sync Capacitor
└── version-bump.mjs  # Bump de versão semântica
```

---

## Contribuir

1. Fork → branch `feat/minha-funcionalidade`
2. Commit seguindo [Conventional Commits](https://www.conventionalcommits.org/)
3. Pull Request para `main`

---

## Licença

MIT © [carsaimz](https://github.com/carsaimz)

## Criar primeira tag (release)

```bash
# No Termux, dentro do repositório
git tag -a v0.1.0 -m "Release inicial v0.1.0"
git push origin v0.1.0
```

Isto dispara os workflows `android.yml`, `desktop.yml` e `release.yml` automaticamente.
