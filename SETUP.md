# Configuração rápida — Carsai YT Studio

## ⚠️ Firebase: auth/network-request-failed

Este erro acontece quando o domínio de deploy **não está autorizado** no Firebase Console.

### Solução obrigatória:

1. Acesse [Firebase Console](https://console.firebase.google.com) → seu projecto
2. **Authentication** → **Settings** → **Authorized domains**
3. Clique em **Add domain** e adicione:
   - `carsai-yt-studio-pro.vercel.app` (ou o seu domínio Vercel)
   - `localhost` (para desenvolvimento — já deve estar)
   - Qualquer domínio personalizado que use

Sem isso, o Firebase recusa todas as chamadas de autenticação.

---

## Variáveis de ambiente (Vercel)

Em **Vercel → Settings → Environment Variables**, adicione:

```
VITE_FIREBASE_API_KEY=AIzaSyDIa0A4ixGsD0mrvq0CXtvhCWshDql-fpY
VITE_FIREBASE_AUTH_DOMAIN=carsaiplay-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=carsaiplay-project
VITE_FIREBASE_STORAGE_BUCKET=carsaiplay-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=762103152507
VITE_FIREBASE_APP_ID=1:762103152507:web:d5482efcecbb718db847de
VITE_FIREBASE_MEASUREMENT_ID=G-B1V6TWKWBB
```

Depois de adicionar, faça **redeploy** (Vercel não aplica novas env vars ao deploy existente).

## Secrets GitHub (para CI/CD Android)

```bash
gh secret set VITE_FIREBASE_API_KEY        --body "AIzaSyDIa0A4ixGsD0mrvq0CXtvhCWshDql-fpY"
gh secret set VITE_FIREBASE_AUTH_DOMAIN    --body "carsaiplay-project.firebaseapp.com"
gh secret set VITE_FIREBASE_PROJECT_ID     --body "carsaiplay-project"
gh secret set VITE_FIREBASE_STORAGE_BUCKET --body "carsaiplay-project.firebasestorage.app"
gh secret set VITE_FIREBASE_MESSAGING_SENDER_ID --body "762103152507"
gh secret set VITE_FIREBASE_APP_ID         --body "1:762103152507:web:d5482efcecbb718db847de"
gh secret set VITE_FIREBASE_MEASUREMENT_ID --body "G-B1V6TWKWBB"

# Keystore para assinar o APK
gh secret set KEYSTORE_FILE < <(base64 -w 0 carsai-release.jks)
gh secret set KEYSTORE_ALIAS --body "carsai"
gh secret set KEYSTORE_PASSWORD
```
