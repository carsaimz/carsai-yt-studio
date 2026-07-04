export type DocSection = {
  id: string;
  label: string;
  title: string;
  intro?: string;
  steps: string[];
  info?: { type?: "info" | "warning"; text: string };
  errors?: { code: string; desc: string; fix: string }[];
  extra?: "aiTable" | "shortcuts" | "changelog";
};

const AI_TABLE_ROWS: [string, string, string, string][] = [
  ["Google Gemini", "free", "aistudio.google.com", "gemini-2.0-flash"],
  ["Groq", "free", "console.groq.com", "llama-3.3-70b-versatile"],
  ["OpenAI", "paid", "platform.openai.com", "gpt-4o-mini"],
  ["Anthropic", "paid", "console.anthropic.com", "claude-haiku-4-5"],
  ["OpenRouter", "mixed", "openrouter.ai", "google/gemini-flash-1.5"],
  ["Custom", "—", "any", "—"],
];
export { AI_TABLE_ROWS };

const SHORTCUTS_PT: [string, string][] = [
  ["g d", "Ir para Dashboard"], ["g c", "Ir para Conteúdo"], ["g a", "Ir para Analytics"],
  ["g s", "Ir para Estúdio"], ["g i", "Ir para IA"], ["?", "Mostrar atalhos"],
  ["⌘/Ctrl + K", "Barra de pesquisa global"], ["Esc", "Fechar modais / sidebars"],
];
const SHORTCUTS_EN: [string, string][] = [
  ["g d", "Go to Dashboard"], ["g c", "Go to Content"], ["g a", "Go to Analytics"],
  ["g s", "Go to Studio"], ["g i", "Go to AI"], ["?", "Show shortcuts"],
  ["⌘/Ctrl + K", "Global search bar"], ["Esc", "Close modals / sidebars"],
];
const SHORTCUTS_ES: [string, string][] = [
  ["g d", "Ir al Panel"], ["g c", "Ir a Contenido"], ["g a", "Ir a Análisis"],
  ["g s", "Ir al Estudio"], ["g i", "Ir a IA"], ["?", "Mostrar atajos"],
  ["⌘/Ctrl + K", "Barra de búsqueda global"], ["Esc", "Cerrar modales / barras laterales"],
];
export function shortcutsByLocale(lang: string) {
  if (lang === "en-US") return SHORTCUTS_EN;
  if (lang === "es-ES") return SHORTCUTS_ES;
  return SHORTCUTS_PT;
}

const DOCS_PT_BR: DocSection[] = [
  { id: "inicio", label: "Primeiros passos", title: "Primeiros passos", steps: [
    "Acesse o app e passe pelo assistente de configuração em /welcome → /setup.",
    "Configure o Firebase (gratuito) para autenticação.",
    "Crie uma YouTube Data API Key (gratuito) para leitura de dados.",
    "Opcionalmente, crie um OAuth 2.0 Client ID para escrita (upload, edição, playlists).",
    "Opcionalmente, adicione um provedor de IA (Gemini ou Groq têm camada gratuita generosa).",
  ]},
  { id: "firebase", label: "Firebase", title: "Configurar Firebase", steps: [
    "Acesse console.firebase.google.com e clique em 'Adicionar projecto'.",
    "Crie um projecto (ex: carsaiplay-project). Analytics é opcional.",
    "No painel do projecto, clique em '</>' para adicionar uma app Web.",
    "Registe a app com um nome (ex: Carsai YT Studio).",
    "Copie o objecto firebaseConfig e cole em Configurações → YouTube (os campos são preenchidos automaticamente via variáveis de ambiente VITE_FIREBASE_*).",
    "Em Authentication → Sign-in method, active Email/Password e Google.",
    "Em Authentication → Settings → Authorized domains, adicione o seu domínio de deploy (ex: carsai-yt-studio.vercel.app).",
  ], info: { text: "As chaves Firebase são públicas por design — são identificadores do projecto, não segredos. As regras de segurança do Firestore/Auth controlam o acesso real." }},
  { id: "youtube-api", label: "YouTube API Key", title: "YouTube Data API Key", steps: [
    "Acesse console.cloud.google.com e crie um projecto (ou reutilize o do Firebase).",
    "Em APIs & Services → Library, pesquise 'YouTube Data API v3' e clique em Enable.",
    "Em APIs & Services → Credentials, clique em '+ CREATE CREDENTIALS' → 'API key'.",
    "Copie a chave gerada (começa com AIza…).",
    "Em Application restrictions, escolha 'HTTP referrers' e adicione o seu domínio.",
    "Em API restrictions, restrinja à 'YouTube Data API v3'.",
    "Cole a chave em Configurações → YouTube → API Key e clique em Guardar.",
  ], info: { type: "warning", text: "A cota padrão é 10.000 unidades por dia. Uma pesquisa (search.list) custa 100 unidades. Solicite aumento em quotas.cloud.google.com se necessário." }},
  { id: "oauth", label: "OAuth 2.0 (passo a passo)", title: "OAuth 2.0 — passo a passo",
    intro: "OAuth 2.0 é necessário para upload de vídeos, edição, playlists, comentários e YouTube Analytics. Usa o fluxo PKCE — seguro sem expor segredos no browser.",
    steps: [
      "No Google Cloud Console (console.cloud.google.com), vá a APIs & Services → Credentials.",
      "Clique em '+ CREATE CREDENTIALS' → 'OAuth client ID'.",
      "Em Application type, escolha 'Web application'.",
      "Em 'Authorized JavaScript origins', adicione a URL da sua app (ex: https://carsai-yt-studio.vercel.app e http://localhost:3000 para desenvolvimento).",
      "Em 'Authorized redirect URIs', adicione: https://carsai-yt-studio.vercel.app/oauth/callback e http://localhost:3000/oauth/callback",
      "Clique em Create. Copie o 'Client ID' (termina em .apps.googleusercontent.com).",
      "Cole em Configurações → YouTube → OAuth Client ID e clique em Guardar.",
      "Clique em 'Conectar com Google' — será redirecionado para login Google.",
      "Autorize as permissões solicitadas (YouTube, YouTube Analytics).",
      "Será redirecionado de volta para /oauth/callback. O token é guardado localmente.",
    ], errors: [
      { code: "redirect_uri_mismatch", desc: "A URI de redirect configurada no Google Console não corresponde à URI usada pela app.", fix: "Adicione exactamente https://SEU-DOMINIO/oauth/callback nas Authorized redirect URIs do Client ID." },
      { code: "invalid_client", desc: "O Client ID está incorrecto ou mal colado.", fix: "Verifique que copiou o Client ID completo (termina em .apps.googleusercontent.com), não o Client Secret." },
      { code: "access_denied", desc: "O utilizador recusou as permissões na janela Google.", fix: "Clique novamente em Conectar e aceite todas as permissões solicitadas." },
      { code: "Token expirado / sessão inválida", desc: "O token OAuth expirou (normalmente após 1 hora).", fix: "O app tenta renovar automaticamente via refresh token. Se falhar, clique em Desconectar e conecte novamente." },
      { code: "OAuth only works on registered domains", desc: "Está a testar num domínio não registado.", fix: "Adicione localhost:3000 e o seu domínio de preview aos Authorized origins e redirect URIs." },
    ]},
  { id: "ia", label: "Provedores de IA", title: "Provedores de IA",
    intro: "O app suporta qualquer provedor com API compatível com OpenAI (endpoint /chat/completions).",
    steps: [
      "Vá a Configurações → Provedores IA → Adicionar provedor.",
      "Escolha o provedor desejado e preencha a API Key.",
      "Clique em 'Guardar provedores de IA' — este passo é obrigatório.",
      "Na página IA & Agentes, o chat usará o provedor com maior prioridade que tenha API Key preenchida.",
    ], extra: "aiTable" },
  { id: "mobile", label: "Android / iOS", title: "Android", steps: [
    "Cada push de tag (ex: git tag v1.0.0 && git push origin v1.0.0) gera APK e AAB automaticamente.",
    "Para assinar o APK, configure os secrets KEYSTORE_BASE64, KEYSTORE_PASSWORD, KEY_ALIAS e KEY_PASSWORD no repositório.",
    "Para gerar keystore: keytool -genkeypair -v -keystore carsai.jks -alias carsai -keyalg RSA -keysize 2048 -validity 10000",
    "Encode para base64: base64 -w 0 carsai.jks > carsai.b64 && cat carsai.b64",
    "Adicionar secret: gh secret set KEYSTORE_BASE64 < <(base64 -w 0 carsai.jks)",
    "O APK gerado (não assinado) pode ser instalado manualmente via adb install ou enviado para o dispositivo.",
  ]},
  { id: "desktop", label: "Desktop (Tauri)", title: "Desktop (Tauri v2)", steps: [
    "Cada push de tag gera instaladores para Windows (.exe), macOS (.dmg) e Linux (.AppImage).",
    "O src-tauri/ é criado automaticamente em CI se não existir no repositório.",
    "Para build local: npm run build:mobile && npx tauri build",
    "Requer Rust instalado: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh",
  ]},
  { id: "erros", label: "Erros comuns", title: "Erros comuns", steps: [], errors: [
    { code: "quotaExceeded / 403", desc: "Cota diária da YouTube API esgotada (10.000 unidades).", fix: "Aguarde a meia-noite (horário Pacífico) para reset. Solicite aumento em quotas.cloud.google.com." },
    { code: "API key not valid", desc: "A API Key está incorrecta, foi apagada ou tem restrições de domínio muito estritas.", fix: "Verifique a chave em Google Cloud Console → Credentials. Teste sem restrições de IP/domínio primeiro." },
    { code: "The caller does not have permission", desc: "A API solicitada não está activa no projecto Google Cloud.", fix: "Em APIs & Services → Library, active a YouTube Data API v3 e (se usar Analytics) a YouTube Analytics API." },
    { code: "Tela preta no Android", desc: "O index.html não foi gerado ou os caminhos de assets estão incorrectos.", fix: "Execute npm run build:mobile localmente e verifique que dist/client/index.html existe com caminhos relativos (./assets/...)." },
    { code: "Firebase: auth/unauthorized-domain", desc: "O domínio de deploy não está autorizado no Firebase.", fix: "Em Firebase Console → Authentication → Settings → Authorized domains, adicione o seu domínio." },
    { code: "provedores IA não funcionam", desc: "Os provedores são adicionados mas não guardados.", fix: "Em Configurações → Provedores IA, após preencher as API Keys, clique em 'Guardar provedores de IA'. O botão de guardar é obrigatório." },
  ]},
  { id: "atalhos", label: "Atalhos de teclado", title: "Atalhos de teclado", steps: [], extra: "shortcuts" },
  { id: "changelog", label: "Changelog & Releases", title: "Changelog & Releases", steps: [], extra: "changelog" },
];

const DOCS_EN_US: DocSection[] = [
  { id: "inicio", label: "Getting started", title: "Getting started", steps: [
    "Open the app and go through the setup wizard at /welcome → /setup.",
    "Configure Firebase (free) for authentication.",
    "Create a YouTube Data API key (free) for reading data.",
    "Optionally create an OAuth 2.0 Client ID for write access (upload, editing, playlists).",
    "Optionally add an AI provider (Gemini or Groq have a generous free tier).",
  ]},
  { id: "firebase", label: "Firebase", title: "Configure Firebase", steps: [
    "Go to console.firebase.google.com and click 'Add project'.",
    "Create a project (e.g. carsaiplay-project). Analytics is optional.",
    "In the project dashboard, click '</>' to add a Web app.",
    "Register the app with a name (e.g. Carsai YT Studio).",
    "Copy the firebaseConfig object and paste it into Settings → YouTube (fields are auto-filled via VITE_FIREBASE_* env vars).",
    "In Authentication → Sign-in method, enable Email/Password and Google.",
    "In Authentication → Settings → Authorized domains, add your deploy domain (e.g. carsai-yt-studio.vercel.app).",
  ], info: { text: "Firebase keys are public by design — they're project identifiers, not secrets. Firestore/Auth security rules control real access." }},
  { id: "youtube-api", label: "YouTube API Key", title: "YouTube Data API Key", steps: [
    "Go to console.cloud.google.com and create a project (or reuse the Firebase one).",
    "In APIs & Services → Library, search 'YouTube Data API v3' and click Enable.",
    "In APIs & Services → Credentials, click '+ CREATE CREDENTIALS' → 'API key'.",
    "Copy the generated key (starts with AIza…).",
    "In Application restrictions, choose 'HTTP referrers' and add your domain.",
    "In API restrictions, restrict it to 'YouTube Data API v3'.",
    "Paste the key into Settings → YouTube → API Key and click Save.",
  ], info: { type: "warning", text: "The default quota is 10,000 units per day. A search (search.list) costs 100 units. Request an increase at quotas.cloud.google.com if needed." }},
  { id: "oauth", label: "OAuth 2.0 (step by step)", title: "OAuth 2.0 — step by step",
    intro: "OAuth 2.0 is required for video uploads, editing, playlists, comments, and YouTube Analytics. It uses the PKCE flow — safe without exposing secrets in the browser.",
    steps: [
      "In Google Cloud Console (console.cloud.google.com), go to APIs & Services → Credentials.",
      "Click '+ CREATE CREDENTIALS' → 'OAuth client ID'.",
      "For Application type, choose 'Web application'.",
      "Under 'Authorized JavaScript origins', add your app's URL (e.g. https://carsai-yt-studio.vercel.app and http://localhost:3000 for development).",
      "Under 'Authorized redirect URIs', add: https://carsai-yt-studio.vercel.app/oauth/callback and http://localhost:3000/oauth/callback",
      "Click Create. Copy the 'Client ID' (ends in .apps.googleusercontent.com).",
      "Paste it into Settings → YouTube → OAuth Client ID and click Save.",
      "Click 'Connect with Google' — you'll be redirected to Google sign-in.",
      "Authorize the requested permissions (YouTube, YouTube Analytics).",
      "You'll be redirected back to /oauth/callback. The token is stored locally.",
    ], errors: [
      { code: "redirect_uri_mismatch", desc: "The redirect URI configured in Google Console doesn't match the one used by the app.", fix: "Add exactly https://YOUR-DOMAIN/oauth/callback to the Client ID's Authorized redirect URIs." },
      { code: "invalid_client", desc: "The Client ID is incorrect or was pasted wrong.", fix: "Make sure you copied the full Client ID (ends in .apps.googleusercontent.com), not the Client Secret." },
      { code: "access_denied", desc: "The user declined the permissions in the Google window.", fix: "Click Connect again and accept all requested permissions." },
      { code: "Expired token / invalid session", desc: "The OAuth token expired (usually after 1 hour).", fix: "The app tries to auto-refresh via refresh token. If it fails, click Disconnect and reconnect." },
      { code: "OAuth only works on registered domains", desc: "You're testing on an unregistered domain.", fix: "Add localhost:3000 and your preview domain to Authorized origins and redirect URIs." },
    ]},
  { id: "ia", label: "AI Providers", title: "AI Providers",
    intro: "The app supports any provider with an OpenAI-compatible API (/chat/completions endpoint).",
    steps: [
      "Go to Settings → AI Providers → Add provider.",
      "Choose the desired provider and fill in the API key.",
      "Click 'Save AI providers' — this step is required.",
      "On the AI & Agents page, chat will use the highest-priority provider that has an API key set.",
    ], extra: "aiTable" },
  { id: "mobile", label: "Android / iOS", title: "Android", steps: [
    "Each tag push (e.g. git tag v1.0.0 && git push origin v1.0.0) automatically generates APK and AAB.",
    "To sign the APK, configure the KEYSTORE_BASE64, KEYSTORE_PASSWORD, KEY_ALIAS, and KEY_PASSWORD secrets in the repository.",
    "To generate a keystore: keytool -genkeypair -v -keystore carsai.jks -alias carsai -keyalg RSA -keysize 2048 -validity 10000",
    "Encode to base64: base64 -w 0 carsai.jks > carsai.b64 && cat carsai.b64",
    "Add secret: gh secret set KEYSTORE_BASE64 < <(base64 -w 0 carsai.jks)",
    "The generated (unsigned) APK can be manually installed via adb install or sent to the device.",
  ]},
  { id: "desktop", label: "Desktop (Tauri)", title: "Desktop (Tauri v2)", steps: [
    "Each tag push generates installers for Windows (.exe), macOS (.dmg), and Linux (.AppImage).",
    "src-tauri/ is automatically created in CI if it doesn't exist in the repository.",
    "For local builds: npm run build:mobile && npx tauri build",
    "Requires Rust installed: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh",
  ]},
  { id: "erros", label: "Common errors", title: "Common errors", steps: [], errors: [
    { code: "quotaExceeded / 403", desc: "Daily YouTube API quota exhausted (10,000 units).", fix: "Wait until midnight (Pacific time) for reset. Request an increase at quotas.cloud.google.com." },
    { code: "API key not valid", desc: "The API key is incorrect, was deleted, or has overly strict domain restrictions.", fix: "Check the key in Google Cloud Console → Credentials. Test without IP/domain restrictions first." },
    { code: "The caller does not have permission", desc: "The requested API isn't enabled on the Google Cloud project.", fix: "In APIs & Services → Library, enable YouTube Data API v3 and (if using Analytics) YouTube Analytics API." },
    { code: "Black screen on Android", desc: "index.html wasn't generated or asset paths are incorrect.", fix: "Run npm run build:mobile locally and check that dist/client/index.html exists with relative paths (./assets/...)." },
    { code: "Firebase: auth/unauthorized-domain", desc: "The deploy domain isn't authorized in Firebase.", fix: "In Firebase Console → Authentication → Settings → Authorized domains, add your domain." },
    { code: "AI providers don't work", desc: "Providers are added but not saved.", fix: "In Settings → AI Providers, after filling in API keys, click 'Save AI providers'. The save button is required." },
  ]},
  { id: "atalhos", label: "Keyboard shortcuts", title: "Keyboard shortcuts", steps: [], extra: "shortcuts" },
  { id: "changelog", label: "Changelog & Releases", title: "Changelog & Releases", steps: [], extra: "changelog" },
];

const DOCS_ES_ES: DocSection[] = [
  { id: "inicio", label: "Primeros pasos", title: "Primeros pasos", steps: [
    "Abre la app y pasa por el asistente de configuración en /welcome → /setup.",
    "Configura Firebase (gratis) para la autenticación.",
    "Crea una YouTube Data API Key (gratis) para leer datos.",
    "Opcionalmente, crea un OAuth 2.0 Client ID para escritura (subida, edición, listas).",
    "Opcionalmente, añade un proveedor de IA (Gemini o Groq tienen un nivel gratuito generoso).",
  ]},
  { id: "firebase", label: "Firebase", title: "Configurar Firebase", steps: [
    "Ve a console.firebase.google.com y haz clic en 'Añadir proyecto'.",
    "Crea un proyecto (ej: carsaiplay-project). Analytics es opcional.",
    "En el panel del proyecto, haz clic en '</>' para añadir una app Web.",
    "Registra la app con un nombre (ej: Carsai YT Studio).",
    "Copia el objeto firebaseConfig y pégalo en Ajustes → YouTube (los campos se rellenan automáticamente vía variables VITE_FIREBASE_*).",
    "En Authentication → Sign-in method, activa Email/Password y Google.",
    "En Authentication → Settings → Authorized domains, añade tu dominio de despliegue (ej: carsai-yt-studio.vercel.app).",
  ], info: { text: "Las claves Firebase son públicas por diseño — son identificadores del proyecto, no secretos. Las reglas de seguridad de Firestore/Auth controlan el acceso real." }},
  { id: "youtube-api", label: "YouTube API Key", title: "YouTube Data API Key", steps: [
    "Ve a console.cloud.google.com y crea un proyecto (o reutiliza el de Firebase).",
    "En APIs & Services → Library, busca 'YouTube Data API v3' y haz clic en Enable.",
    "En APIs & Services → Credentials, haz clic en '+ CREATE CREDENTIALS' → 'API key'.",
    "Copia la clave generada (empieza con AIza…).",
    "En Application restrictions, elige 'HTTP referrers' y añade tu dominio.",
    "En API restrictions, restringe a 'YouTube Data API v3'.",
    "Pega la clave en Ajustes → YouTube → API Key y haz clic en Guardar.",
  ], info: { type: "warning", text: "La cuota predeterminada es 10.000 unidades al día. Una búsqueda (search.list) cuesta 100 unidades. Solicita un aumento en quotas.cloud.google.com si es necesario." }},
  { id: "oauth", label: "OAuth 2.0 (paso a paso)", title: "OAuth 2.0 — paso a paso",
    intro: "OAuth 2.0 es necesario para subir vídeos, editar, listas, comentarios y YouTube Analytics. Usa el flujo PKCE — seguro sin exponer secretos en el navegador.",
    steps: [
      "En Google Cloud Console (console.cloud.google.com), ve a APIs & Services → Credentials.",
      "Haz clic en '+ CREATE CREDENTIALS' → 'OAuth client ID'.",
      "En Application type, elige 'Web application'.",
      "En 'Authorized JavaScript origins', añade la URL de tu app (ej: https://carsai-yt-studio.vercel.app y http://localhost:3000 para desarrollo).",
      "En 'Authorized redirect URIs', añade: https://carsai-yt-studio.vercel.app/oauth/callback y http://localhost:3000/oauth/callback",
      "Haz clic en Create. Copia el 'Client ID' (termina en .apps.googleusercontent.com).",
      "Pégalo en Ajustes → YouTube → OAuth Client ID y haz clic en Guardar.",
      "Haz clic en 'Conectar con Google' — serás redirigido al login de Google.",
      "Autoriza los permisos solicitados (YouTube, YouTube Analytics).",
      "Serás redirigido de vuelta a /oauth/callback. El token se guarda localmente.",
    ], errors: [
      { code: "redirect_uri_mismatch", desc: "La URI de redirección configurada en Google Console no coincide con la usada por la app.", fix: "Añade exactamente https://TU-DOMINIO/oauth/callback en las Authorized redirect URIs del Client ID." },
      { code: "invalid_client", desc: "El Client ID es incorrecto o se pegó mal.", fix: "Verifica que copiaste el Client ID completo (termina en .apps.googleusercontent.com), no el Client Secret." },
      { code: "access_denied", desc: "El usuario rechazó los permisos en la ventana de Google.", fix: "Haz clic en Conectar de nuevo y acepta todos los permisos solicitados." },
      { code: "Token expirado / sesión inválida", desc: "El token OAuth expiró (normalmente tras 1 hora).", fix: "La app intenta renovar automáticamente vía refresh token. Si falla, haz clic en Desconectar y vuelve a conectar." },
      { code: "OAuth only works on registered domains", desc: "Estás probando en un dominio no registrado.", fix: "Añade localhost:3000 y tu dominio de vista previa a Authorized origins y redirect URIs." },
    ]},
  { id: "ia", label: "Proveedores de IA", title: "Proveedores de IA",
    intro: "La app admite cualquier proveedor con API compatible con OpenAI (endpoint /chat/completions).",
    steps: [
      "Ve a Ajustes → Proveedores IA → Añadir proveedor.",
      "Elige el proveedor deseado y rellena la API Key.",
      "Haz clic en 'Guardar proveedores de IA' — este paso es obligatorio.",
      "En la página IA & Agentes, el chat usará el proveedor de mayor prioridad que tenga API Key indicada.",
    ], extra: "aiTable" },
  { id: "mobile", label: "Android / iOS", title: "Android", steps: [
    "Cada push de tag (ej: git tag v1.0.0 && git push origin v1.0.0) genera APK y AAB automáticamente.",
    "Para firmar el APK, configura los secrets KEYSTORE_BASE64, KEYSTORE_PASSWORD, KEY_ALIAS y KEY_PASSWORD en el repositorio.",
    "Para generar el keystore: keytool -genkeypair -v -keystore carsai.jks -alias carsai -keyalg RSA -keysize 2048 -validity 10000",
    "Codificar a base64: base64 -w 0 carsai.jks > carsai.b64 && cat carsai.b64",
    "Añadir secret: gh secret set KEYSTORE_BASE64 < <(base64 -w 0 carsai.jks)",
    "El APK generado (sin firmar) se puede instalar manualmente vía adb install o enviarlo al dispositivo.",
  ]},
  { id: "desktop", label: "Escritorio (Tauri)", title: "Escritorio (Tauri v2)", steps: [
    "Cada push de tag genera instaladores para Windows (.exe), macOS (.dmg) y Linux (.AppImage).",
    "src-tauri/ se crea automáticamente en CI si no existe en el repositorio.",
    "Para build local: npm run build:mobile && npx tauri build",
    "Requiere Rust instalado: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh",
  ]},
  { id: "erros", label: "Errores comunes", title: "Errores comunes", steps: [], errors: [
    { code: "quotaExceeded / 403", desc: "Cuota diaria de la YouTube API agotada (10.000 unidades).", fix: "Espera hasta medianoche (hora del Pacífico) para el reinicio. Solicita un aumento en quotas.cloud.google.com." },
    { code: "API key not valid", desc: "La API Key es incorrecta, fue eliminada o tiene restricciones de dominio muy estrictas.", fix: "Revisa la clave en Google Cloud Console → Credentials. Prueba sin restricciones de IP/dominio primero." },
    { code: "The caller does not have permission", desc: "La API solicitada no está activa en el proyecto de Google Cloud.", fix: "En APIs & Services → Library, activa YouTube Data API v3 y (si usas Analytics) YouTube Analytics API." },
    { code: "Pantalla negra en Android", desc: "index.html no se generó o las rutas de los assets son incorrectas.", fix: "Ejecuta npm run build:mobile localmente y verifica que dist/client/index.html existe con rutas relativas (./assets/...)." },
    { code: "Firebase: auth/unauthorized-domain", desc: "El dominio de despliegue no está autorizado en Firebase.", fix: "En Firebase Console → Authentication → Settings → Authorized domains, añade tu dominio." },
    { code: "los proveedores de IA no funcionan", desc: "Los proveedores se añaden pero no se guardan.", fix: "En Ajustes → Proveedores IA, tras rellenar las API Keys, haz clic en 'Guardar proveedores de IA'. El botón de guardar es obligatorio." },
  ]},
  { id: "atalhos", label: "Atajos de teclado", title: "Atajos de teclado", steps: [], extra: "shortcuts" },
  { id: "changelog", label: "Changelog y Releases", title: "Changelog y Releases", steps: [], extra: "changelog" },
];

export function docsByLocale(lang: string): DocSection[] {
  if (lang === "en-US") return DOCS_EN_US;
  if (lang === "es-ES") return DOCS_ES_ES;
  return DOCS_PT_BR;
}
