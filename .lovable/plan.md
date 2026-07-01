# Plano de atualizações

## 1. YouTube — Upload real, thumbnails aplicadas, agendamento

`**src/lib/youtube/client.ts**` — corrigir/implementar:

- `uploadVideo({ file, title, description, tags, privacyStatus, publishAt, categoryId, defaultLanguage, madeForKids })` usando **resumable upload** (`POST https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status`). Persistir `uploadUrl` para retomar em caso de queda; enviar em chunks de 256KB com progresso.
- `setThumbnail(videoId, file)` via `POST https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=…` com `Content-Type: image/jpeg|png` no corpo bruto (era enviado como multipart/JSON, por isso a thumbnail não colava).
- `scheduleVideo(videoId, publishAt: ISO)` — `PUT videos?part=status` com `status.privacyStatus = "private"` + `publishAt` (obrigatório para agendar).
- `updateVideo`, `deleteVideo`, `listCaptions/uploadCaption`, `listPlaylists/insertPlaylistItem`, `commentThreads.insert/reply`, `setModerationStatus`, `subscriptions.list`, `channelSections`, `videoAbuseReport` — expor todas as capacidades já suportadas pelo v3.

`**src/routes/content.tsx` / `studio.tsx**`:

- Formulário de upload com: arquivo, título, descrição, tags, categoria, idioma, "Made for kids", visibilidade, e **campo `Agendar para**` (datetime-local). Ao agendar, força `privacyStatus=private` + `publishAt`.
- Barra de progresso do upload resumível.
- Após criar vídeo, se houver thumbnail escolhida → chama `setThumbnail(videoId, file)` e mostra toast de confirmação.

## 2. Firebase — garantir que integrações funcionam

- Rever `src/lib/firebase/{client,auth,messaging}.ts` — validar init idempotente, verificar `getMessaging` guardado atrás de `isSupported()` (evita crash em iOS/desktop).
- FCM: registrar service worker apenas se `serviceWorker in navigator`.
- Auth: cobrir Google/Apple/email-link, mapear erros ao i18n.
- Documentar exigência de `VITE_FIREBASE_*` no `.env.example`.

## 3. Capacidades dos provedores de IA

Em `**src/lib/ai/registry.ts**` adicionar metadata por provedor:

```ts
capabilities: { chat, imageGen, imageEdit, vision, docs, audioIn, audioOut, tools, streaming }
contextWindow, maxOutputTokens, pricingHint
```

Aplicar aos 18 provedores. Em `src/routes/settings.tsx` e no seletor da página IA, exibir **badges** ("Imagens", "Documentos", "Visão", "Áudio", "Ferramentas") por provedor.
Filtrar seletores por capacidade: p. ex. o Agente de Thumbnail só lista provedores com `imageGen`; upload de PDF só habilitado para provedores com `docs`.

## 4. Área pública — sidebar/header expansível + lang picker compacto

`**src/components/lang-picker.tsx**`:

- Trigger mostra apenas bandeira + sigla (`🇵🇹 PT`), nome completo aparece só no dropdown.
- Variante `compact` para o topbar público, variante padrão para app.

`**src/components/public/public-shell.tsx**`:

- Adicionar **Sheet/Sidebar off-canvas** no mobile e menu expansível no desktop com secções: Início, Sobre, Docs, Ajuda, Changelog, Privacidade, Termos, Segurança, Auth.
- Trigger visível (hamburger) no topbar público.

## Detalhes técnicos

- Uploads binários grandes: usar `fetch` com `ReadableStream`/`FileReader` slice + retry no 308 (`Range: bytes=0-N`), padrão Google resumable.
- Todos os campos i18n usados devem existir nos 3 dicionários; adicionar chaves `content.upload.*`, `content.schedule.*`, `settings.aiCaps.*`.
- Nenhum backend novo — YouTube/Firebase permanecem chamadas diretas do dispositivo com o token OAuth do utilizador. Sem Cloud/Supabase.
- Não vou tocar em versão/workflows (foram estabilizados na iteração anterior).

## Fora de escopo (confirmar se quer nesta rodada)

- Analytics API v2 (reports.query) real — requer OAuth já habilitado; posso plugar após confirmar.
- Live streaming (liveBroadcasts/liveStreams) — grande superfície, pergunto se quer agora.

&nbsp;

**Bônus:**

- Rever i18n em todas áreas/páginas e corrigir caso necessário (onde não haver i8n ou onde há hardcoded em português)
- Melhorar design na área pública e autenticada
- Adicione modo claro (com botão de alterar modo em ambas áreas)