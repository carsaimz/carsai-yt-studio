# Troubleshooting / Resolução de Problemas

## auth/network-request-failed

**🇧🇷** O domínio não está autorizado no Firebase.
**🇺🇸** Domain not authorized in Firebase.

**Fix:** Firebase Console → Authentication → Settings → Authorized domains → Add your Vercel domain.

---

## Crawling result not available (Build Error)

**🇧🇷** Erro de TypeScript em algum ficheiro de rota impede o TanStack de analisar as rotas.
**🇺🇸** A TypeScript error in a route file prevents TanStack from crawling routes.

**Fix:** Run `npm run typecheck` locally and fix all errors before pushing.

---

## redirect_uri_mismatch (OAuth)

**Fix:** Google Cloud Console → OAuth Client → Authorized redirect URIs → Add `https://YOUR-DOMAIN/oauth/callback`

---

## Android blank screen

**🇧🇷** O `index.html` não está em `dist/client/` ou usa caminhos absolutos.
**🇺🇸** The `index.html` is missing from `dist/client/` or uses absolute paths.

**Fix:** Run `npm run build:mobile` and check that `dist/client/index.html` exists with relative paths (`./assets/...`).

---

## quotaExceeded (YouTube API)

**🇧🇷** Cota diária de 10.000 unidades esgotada. Reseta à meia-noite (horário Pacífico).
**🇺🇸** Daily 10,000 unit quota exhausted. Resets at midnight Pacific Time.
