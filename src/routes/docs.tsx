import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight, BookOpen, KeyRound, Youtube, Bot, Shield, Smartphone,
  Server, Sparkles, Zap, ListChecks, ChevronRight, AlertTriangle,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { PublicShell, SectionCard, FloatingArt } from "@/components/public/public-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Documentação — Carsai YT Studio" },
      { name: "description", content: "Guia completo: configuração, OAuth 2.0, API Keys, erros comuns." },
    ],
  }),
  component: DocsPage,
});

const sections = [
  { id: "inicio",       label: "Primeiros passos",      icon: Sparkles },
  { id: "firebase",     label: "Firebase",               icon: Shield },
  { id: "youtube-api",  label: "YouTube API Key",         icon: Youtube },
  { id: "oauth",        label: "OAuth 2.0 (passo a passo)", icon: KeyRound },
  { id: "ia",           label: "Provedores de IA",        icon: Bot },
  { id: "mobile",       label: "Android / iOS",           icon: Smartphone },
  { id: "desktop",      label: "Desktop (Tauri)",         icon: Server },
  { id: "erros",        label: "Erros comuns",            icon: AlertTriangle },
  { id: "atalhos",      label: "Atalhos de teclado",      icon: Zap },
  { id: "changelog",    label: "Changelog & Releases",    icon: ListChecks },
];

function DocsPage() {
  return (
    <PublicShell title="Documentação">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <FloatingArt />
        <div className="relative z-10 mb-10 text-center">
          <h1 className="font-display text-4xl font-extrabold sm:text-5xl">Documentação</h1>
          <p className="mt-3 text-base text-muted-foreground">
            Guia completo de configuração, API Keys, OAuth 2.0 e resolução de erros.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`}
              className="flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1 text-xs hover:border-primary/40 transition">
              <s.icon className="h-3.5 w-3.5 text-muted-foreground" />
              {s.label}
            </a>
          ))}
        </div>

        <div className="space-y-10">

          {/* Primeiros passos */}
          <div id="inicio"><SectionCard number={1} title="Primeiros passos" icon={<Sparkles className="h-4 w-4" />}>
            <Steps items={[
              "Acesse o app e passe pelo assistente de configuração em /welcome → /setup.",
              "Configure o Firebase (gratuito) para autenticação.",
              "Crie uma YouTube Data API Key (gratuito) para leitura de dados.",
              "Opcionalmente, crie um OAuth 2.0 Client ID para escrita (upload, edição, playlists).",
              "Opcionalmente, adicione um provedor de IA (Gemini ou Groq têm camada gratuita generosa).",
            ]} />
            <div className="mt-4">
              <Button asChild size="sm" className="gradient-brand text-primary-foreground hover:opacity-90">
                <Link to="/setup"><ArrowRight className="mr-1 h-4 w-4" />Ir para configuração</Link>
              </Button>
            </div>
          </SectionCard>
          </div>

          {/* Firebase */}
          <div id="firebase"><SectionCard number={2} title="Configurar Firebase" icon={<Shield className="h-4 w-4" />}>
            <Steps items={[
              "Acesse console.firebase.google.com e clique em 'Adicionar projecto'.",
              "Crie um projecto (ex: carsaiplay-project). Analytics é opcional.",
              "No painel do projecto, clique em '</>' para adicionar uma app Web.",
              "Registe a app com um nome (ex: Carsai YT Studio).",
              "Copie o objecto firebaseConfig e cole em Configurações → YouTube (os campos são preenchidos automaticamente via variáveis de ambiente VITE_FIREBASE_*).",
              "Em Authentication → Sign-in method, active Email/Password e Google.",
              "Em Authentication → Settings → Authorized domains, adicione o seu domínio de deploy (ex: carsai-yt-studio.vercel.app).",
            ]} />
            <InfoBox>
              As chaves Firebase são públicas por design — são identificadores do projecto, não segredos.
              As regras de segurança do Firestore/Auth controlam o acesso real.
            </InfoBox>
          </SectionCard>
          </div>

          {/* YouTube API Key */}
          <div id="youtube-api"><SectionCard number={3} title="YouTube Data API Key" icon={<Youtube className="h-4 w-4" />}>
            <Steps items={[
              "Acesse console.cloud.google.com e crie um projecto (ou reutilize o do Firebase).",
              "Em APIs & Services → Library, pesquise 'YouTube Data API v3' e clique em Enable.",
              "Em APIs & Services → Credentials, clique em '+ CREATE CREDENTIALS' → 'API key'.",
              "Copie a chave gerada (começa com AIza…).",
              "Em Application restrictions, escolha 'HTTP referrers' e adicione o seu domínio.",
              "Em API restrictions, restrinja à 'YouTube Data API v3'.",
              "Cole a chave em Configurações → YouTube → API Key e clique em Guardar.",
            ]} />
            <InfoBox type="warning">
              A cota padrão é 10.000 unidades por dia. Uma pesquisa (search.list) custa 100 unidades.
              Solicite aumento em quotas.cloud.google.com se necessário.
            </InfoBox>
          </SectionCard>
          </div>

          {/* OAuth 2.0 */}
          <div id="oauth"><SectionCard number={4} title="OAuth 2.0 — passo a passo" icon={<KeyRound className="h-4 w-4" />}>
            <p className="text-sm text-muted-foreground mb-3">
              OAuth 2.0 é necessário para upload de vídeos, edição, playlists, comentários e YouTube Analytics.
              Usa o fluxo PKCE — seguro sem expor segredos no browser.
            </p>
            <Steps items={[
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
            ]} />
            <div className="mt-4 rounded-xl border border-border bg-card/60 p-4 space-y-3">
              <p className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Erros comuns OAuth
              </p>
              <ErrorItem code="redirect_uri_mismatch"
                desc="A URI de redirect configurada no Google Console não corresponde à URI usada pela app."
                fix="Adicione exactamente https://SEU-DOMINIO/oauth/callback nas Authorized redirect URIs do Client ID." />
              <ErrorItem code="invalid_client"
                desc="O Client ID está incorrecto ou mal colado."
                fix="Verifique que copiou o Client ID completo (termina em .apps.googleusercontent.com), não o Client Secret." />
              <ErrorItem code="access_denied"
                desc="O utilizador recusou as permissões na janela Google."
                fix="Clique novamente em Conectar e aceite todas as permissões solicitadas." />
              <ErrorItem code="Token expirado / sessão inválida"
                desc="O token OAuth expirou (normalmente após 1 hora)."
                fix="O app tenta renovar automaticamente via refresh token. Se falhar, clique em Desconectar e conecte novamente." />
              <ErrorItem code="OAuth only works on registered domains"
                desc="Está a testar num domínio não registado."
                fix="Adicione localhost:3000 e o seu domínio de preview aos Authorized origins e redirect URIs." />
            </div>
          </SectionCard>
          </div>

          {/* IA Providers */}
          <div id="ia"><SectionCard number={5} title="Provedores de IA" icon={<Bot className="h-4 w-4" />}>
            <p className="text-sm text-muted-foreground mb-3">
              O app suporta qualquer provedor com API compatível com OpenAI (endpoint /chat/completions).
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-sm border border-border rounded-xl overflow-hidden">
                <thead className="bg-card/50 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="p-3 text-left">Provedor</th>
                    <th className="p-3 text-left">Tier</th>
                    <th className="p-3 text-left">Onde obter chave</th>
                    <th className="p-3 text-left">Modelo sugerido</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Google Gemini", "Gratuito generoso", "aistudio.google.com", "gemini-2.0-flash"],
                    ["Groq", "Gratuito generoso", "console.groq.com", "llama-3.3-70b-versatile"],
                    ["OpenAI", "Pago (créditos)", "platform.openai.com", "gpt-4o-mini"],
                    ["Anthropic", "Pago (créditos)", "console.anthropic.com", "claude-haiku-4-5"],
                    ["OpenRouter", "Misto", "openrouter.ai", "google/gemini-flash-1.5"],
                    ["Personalizado", "—", "Qualquer API OpenAI-compat.", "—"],
                  ].map(([name, tier, url, model]) => (
                    <tr key={name} className="border-t border-border">
                      <td className="p-3 font-medium">{name}</td>
                      <td className="p-3"><Badge variant={tier.includes("Gratuito") ? "default" : "secondary"} className="text-xs">{tier}</Badge></td>
                      <td className="p-3 text-muted-foreground text-xs">{url}</td>
                      <td className="p-3 font-mono text-xs">{model}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Steps items={[
              "Vá a Configurações → Provedores IA → Adicionar provedor.",
              "Escolha o provedor desejado e preencha a API Key.",
              "Clique em 'Guardar provedores de IA' — este passo é obrigatório.",
              "Na página IA & Agentes, o chat usará o provedor com maior prioridade que tenha API Key preenchida.",
            ]} />
          </SectionCard>
          </div>

          {/* Mobile */}
          <div id="mobile"><SectionCard number={6} title="Android" icon={<Smartphone className="h-4 w-4" />}>
            <Steps items={[
              "Cada push de tag (ex: git tag v1.0.0 && git push origin v1.0.0) gera APK e AAB automaticamente.",
              "Para assinar o APK, configure os secrets KEYSTORE_BASE64, KEYSTORE_PASSWORD, KEY_ALIAS e KEY_PASSWORD no repositório.",
              "Para gerar keystore: keytool -genkeypair -v -keystore carsai.jks -alias carsai -keyalg RSA -keysize 2048 -validity 10000",
              "Encode para base64: base64 -w 0 carsai.jks > carsai.b64 && cat carsai.b64",
              "Adicionar secret: gh secret set KEYSTORE_BASE64 < <(base64 -w 0 carsai.jks)",
              "O APK gerado (não assinado) pode ser instalado manualmente via adb install ou enviado para o dispositivo.",
            ]} />
          </SectionCard>
          </div>

          {/* Desktop */}
          <div id="desktop"><SectionCard number={7} title="Desktop (Tauri v2)" icon={<Server className="h-4 w-4" />}>
            <Steps items={[
              "Cada push de tag gera instaladores para Windows (.msi/.exe), macOS (.dmg) e Linux (.AppImage/.deb).",
              "O src-tauri/ é criado automaticamente em CI se não existir no repositório.",
              "Para build local: npm run build:mobile && npx tauri build",
              "Requer Rust instalado: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh",
            ]} />
          </SectionCard>
          </div>

          {/* Erros comuns */}
          <div id="erros"><SectionCard number={8} title="Erros comuns" icon={<AlertTriangle className="h-4 w-4" />}>
            <div className="space-y-3">
              <ErrorItem code="quotaExceeded / 403"
                desc="Cota diária da YouTube API esgotada (10.000 unidades)."
                fix="Aguarde a meia-noite (horário Pacífico) para reset. Solicite aumento em quotas.cloud.google.com." />
              <ErrorItem code="API key not valid"
                desc="A API Key está incorrecta, foi apagada ou tem restrições de domínio muito estritas."
                fix="Verifique a chave em Google Cloud Console → Credentials. Teste sem restrições de IP/domínio primeiro." />
              <ErrorItem code="The caller does not have permission"
                desc="A API solicitada não está activa no projecto Google Cloud."
                fix="Em APIs & Services → Library, active a YouTube Data API v3 e (se usar Analytics) a YouTube Analytics API." />
              <ErrorItem code="Tela branca no Android"
                desc="O index.html não foi gerado ou os caminhos de assets estão incorrectos."
                fix="Execute npm run build:mobile localmente e verifique que dist/client/index.html existe com caminhos relativos (./assets/...)." />
              <ErrorItem code="Firebase: auth/unauthorized-domain"
                desc="O domínio de deploy não está autorizado no Firebase."
                fix="Em Firebase Console → Authentication → Settings → Authorized domains, adicione o seu domínio." />
              <ErrorItem code="provedores IA não funcionam"
                desc="Os provedores são adicionados mas não guardados."
                fix="Em Configurações → Provedores IA, após preencher as API Keys, clique em 'Guardar provedores de IA'. O botão de guardar é obrigatório." />
            </div>
          </SectionCard>
          </div>

          {/* Atalhos */}
          <div id="atalhos"><SectionCard number={9} title="Atalhos de teclado" icon={<Zap className="h-4 w-4" />}>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {[
                ["g d", "Ir para Dashboard"],
                ["g c", "Ir para Conteúdo"],
                ["g a", "Ir para Analytics"],
                ["g s", "Ir para Estúdio"],
                ["g i", "Ir para IA"],
                ["?",   "Mostrar atalhos"],
                ["⌘/Ctrl + K", "Barra de pesquisa global"],
                ["Esc",        "Fechar modais / sidebars"],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center justify-between rounded-lg border border-border bg-card/50 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">{desc}</span>
                  <kbd className="rounded bg-muted px-2 py-0.5 font-mono text-xs">{key}</kbd>
                </div>
              ))}
            </div>
          </SectionCard>
          </div>

          {/* Changelog */}
          <div id="changelog"><SectionCard number={10} title="Changelog & Releases" icon={<ListChecks className="h-4 w-4" />}>
            <p className="text-sm text-muted-foreground">
              Veja o histórico completo de versões em{" "}
              <Link to="/changelog" className="text-primary underline">Changelog</Link>{" "}
              ou no{" "}
              <a href="https://github.com/carsaimz/carsai-yt-studio-pro/releases"
                target="_blank" rel="noreferrer" className="text-primary underline">
                GitHub Releases
              </a>.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Para criar uma release:
            </p>
            <pre className="mt-2 overflow-x-auto rounded-xl bg-muted/50 p-3 text-xs font-mono">
{`git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0`}
            </pre>
          </SectionCard>
          </div>

        </div>
      </div>
    </PublicShell>
  );
}

function Steps({ items }: { items: string[] }) {
  return (
    <ol className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-sm">
          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full gradient-brand text-[10px] font-bold text-primary-foreground mt-0.5">
            {i + 1}
          </span>
          <span className="text-muted-foreground">{item}</span>
        </li>
      ))}
    </ol>
  );
}

function InfoBox({ children, type = "info" }: { children: React.ReactNode; type?: "info" | "warning" }) {
  return (
    <div className={`mt-3 rounded-xl border p-3 text-sm ${type === "warning" ? "border-warning/40 bg-warning/5 text-warning" : "border-primary/30 bg-primary/5 text-primary"}`}>
      {children}
    </div>
  );
}

function ErrorItem({ code, desc, fix }: { code: string; desc: string; fix: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-3 space-y-1">
      <p className="font-mono text-xs font-semibold text-destructive">{code}</p>
      <p className="text-xs text-muted-foreground">{desc}</p>
      <p className="text-xs text-foreground">
        <span className="font-medium text-success">Fix:</span> {fix}
      </p>
    </div>
  );
}
