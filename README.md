# Carsai YT Studio

Plataforma híbrida para criadores de conteúdo YouTube — análise, SEO, comunidade e agentes de IA.

## Stack

- **React 19** + **TanStack Router** (file-based routing SSR)
- **Vite 8** + **Tailwind CSS v4**
- **Firebase** (auth + Firestore)
- **Font Awesome 6** (ícones SVG)
- **React Toastify** (notificações toast)
- **SweetAlert2** (modais de confirmação/alerta)
- **Framer Motion** (animações)
- **Recharts** (gráficos)

## Início rápido

```bash
# Instalar dependências (npm)
npm install

# Desenvolvimento
npm run dev

# Build produção
npm run build

# Preview build
npm run preview

# Lint
npm run lint

# Type-check
npm run typecheck
```

## Notificações

Usar o utilitário centralizado em `src/lib/notifications.ts`:

```ts
import { toast, confirm, confirmDelete, alert, prompt } from "@/lib/notifications";

// Toast rápido
toast.success("Guardado!");
toast.error("Algo correu mal.");
toast.loading("A guardar…");

// Confirmação com SweetAlert2
const ok = await confirm({ title: "Tem a certeza?", icon: "warning" });

// Confirmação de eliminação
const del = await confirmDelete("vídeo");

// Prompt de texto
const name = await prompt({ title: "Nome do canal", placeholder: "UC…" });
```

## Ícones (Font Awesome)

```tsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// fas = solid, fab = brands
<FontAwesomeIcon icon={["fas", "youtube"]} />
<FontAwesomeIcon icon={["fab", "youtube"]} />
```

A biblioteca é registada globalmente em `__root.tsx` — não é necessário importar ícones individuais.

## Variáveis de ambiente

Copiar `.env.example` para `.env` e preencher:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
```
