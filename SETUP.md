# SETUP — Carsai YT Studio v3

Guia de instalação e configuração para as três plataformas, com instruções para obter todas as chaves gratuitas.

---

## 1. Requisitos

| Ferramenta | Versão | Nota |
|---|---|---|
| Node.js | 20+ (recomendado 22) | `node -v` |
| npm | 10+ | ou `bun` |
| Android Studio | Iguana+ | apenas para build Android |
| Java JDK | 17 | apenas para build Android |

---

## 2. Instalação

```bash
git clone https://github.com/carsaimz/carsai-yt-studio.git
cd carsai-yt-studio
npm install
npm run dev          # http://localhost:3000
```

O ecrã de boas-vindas oferece dois caminhos:

1. **Modo Demo** — dados de exemplo realistas, nada para configurar.
2. **Ligar canal ao vivo** — pede uma chave da YouTube Data API v3 + ID do canal (`UC...`).

---

## 3. Chaves gratuitas (todas opcionais)

### YouTube Data API v3 (10.000 unidades/dia grátis)

1. Abre [console.cloud.google.com](https://console.cloud.google.com)
2. Cria um projeto → **APIs & Services → Library** → ativa **YouTube Data API v3**
3. **Credentials → Create credentials → API key**
4. (Recomendado) restringe a chave à YouTube Data API
5. Cola a chave no onboarding, ou em **Definições → Cofre de chaves**

Para descobrir o teu **Channel ID**: YouTube → o teu canal → **About/Sobre** → "Share channel" → "Copy channel ID".

### IA gratuita

| Serviço | Onde obter | Nota |
|---|---|---|
| Google Gemini | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | camada gratuita generosa |
| Groq | [console.groq.com/keys](https://console.groq.com/keys) | inferência ultrarrápida |
| OpenRouter | [openrouter.ai/keys](https://openrouter.ai/keys) | modelos marcados `:free` |
| Hugging Face | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) | inferência open-source |

Configura em **Integrações** (ou **Definições → Cofre de chaves**). A chave fica **só no teu dispositivo**.

### Mídia (stock para miniaturas)

Pexels · Unsplash · Pixabay — chaves gratuitas em `pexels.com/api`, `unsplash.com/developers`, `pixabay.com/api/docs/`.

---

## 4. Web / deploy

```bash
npm run build        # build standalone em .next/standalone
npm start            # servidor de produção
```

Deploy recomendado: **Vercel** (zero config) ou `node .next/standalone/server.js` em qualquer VPS/Docker.

---

## 5. Android (Capacitor)

Dois modos:

**a) App estático embutida (offline-first):**

```bash
npm run build:mobile   # gera ./out (export estático, BUILD_TARGET=mobile)
npx cap add android    # primeira vez
npm run cap:sync       # copia ./out para o projeto nativo
npm run cap:android    # abre o Android Studio
```

**b) Shell remoto (dados sempre atualizados):**

```bash
CAP_SERVER_URL=https://o-teu-deploy.vercel.app npx cap sync android
npm run cap:android
```

> Nota: no modo estático, as chamadas às APIs (YouTube, Gemini, Groq…) são feitas diretamente do dispositivo — todas suportam CORS.

---

## 6. Desktop (Electron)

**Dev:**

```bash
npm run build                # build standalone
npm run electron:dev         # abre a janela carregando localhost:3000
```

**Produção (instaladores):**

```bash
npm run electron:build       # NSIS (Windows), DMG (macOS), AppImage/deb (Linux)
# output em dist-electron/
```

Modos do main process:

- `APP_URL=https://o-teu-deploy.vercel.app electron electron/main.cjs` → carrega o site publicado
- sem `APP_URL` → arranca o servidor Next standalone local e carrega `localhost:3000`

---

## 7. Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| `quotaExceeded` | limite diário da YouTube API | espera pela reposição (meia-noite PT) ou cria outro projeto |
| `API key not valid` | chave mal colada / restrições | verifica em Definições → Cofre de chaves |
| `Canal não encontrado` | ID inválido | usa o formato `UC…` (24+ caracteres) |
| IA não responde | sem chave do provedor ativo | configura em Integrações; sem chave usa o modo demo local |
| CORS em suggest | bloqueio raro do autocomplete | a app usa fallback local automático |

---

## 8. Dados e backup

Tudo vive em `localStorage` (chave `carsai-yt-studio-v3`):

- **Exportar**: Definições → Dados → Exportar (JSON sem chaves)
- **Importar**: Definições → Dados → Importar
- **Repor**: Definições → Zona de risco → Repor tudo
