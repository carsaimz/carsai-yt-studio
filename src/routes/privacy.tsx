import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { PublicShell, SectionCard, FloatingArt } from "@/components/public/public-shell";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacidade — Carsai YT Studio" },
      { name: "description", content: "Como o Carsai YT Studio trata seus dados." },
    ],
  }),
  component: Privacy,
});

const SECTIONS = [
  { n: 1, title: "Resumo", body: (
    <p>Carsai YT Studio é uma aplicação <strong>client-side, open-source</strong>. Suas chaves de API,
      tokens e preferências ficam <strong>apenas no seu dispositivo</strong> (localStorage, IndexedDB
      ou Capacitor Preferences no mobile). Não enviamos seu conteúdo a servidores próprios.</p>
  ) },
  { n: 2, title: "Conta de Usuário", body: (
    <p>O login da plataforma usa um provedor de autenticação gerenciado pela equipe.
      Apenas o e-mail, ID único e foto de perfil (se aplicável) são processados para
      identificar você e permitir sincronização básica entre dispositivos.</p>
  ) },
  { n: 3, title: "Dados Armazenados no Dispositivo", body: (
    <ul className="ml-4 list-disc space-y-1">
      <li>YouTube API Key e (opcional) OAuth Client ID;</li>
      <li>Tokens de acesso ao YouTube quando você conecta um canal;</li>
      <li>Chaves dos provedores de IA que você ativar;</li>
      <li>Preferências (tema, idioma, notificações);</li>
      <li>Cache de respostas das APIs para reduzir consumo de cota.</li>
    </ul>
  ) },
  { n: 4, title: "Comunicação com Terceiros", body: (
    <>
      <p>O app conversa diretamente, a partir do seu navegador/dispositivo, com:</p>
      <ul className="ml-4 mt-1 list-disc space-y-1">
        <li><strong>Google / YouTube</strong> — Data API, Analytics e OAuth (quando configurado);</li>
        <li><strong>Provedores de IA</strong> — apenas os que você ativar;</li>
        <li><strong>GitHub</strong> — endpoint público para checar novas releases.</li>
      </ul>
      <p className="mt-1">Cada serviço tem sua própria política de privacidade.</p>
    </>
  ) },
  { n: 5, title: "Notificações & Diagnóstico", body: (
    <p>Podemos enviar notificações relacionadas à conta, à versão do app ou a atualizações
      importantes. Métricas anônimas de uso e crash reports podem ser coletadas para corrigir
      bugs. Você pode desativar tudo isso em <strong>Configurações → Segurança</strong>.</p>
  ) },
  { n: 6, title: "Crianças", body: <p>O app não é destinado a menores de 13 anos.</p> },
  { n: 7, title: "Seus Direitos", body: (
    <p>Você pode apagar todos os dados locais em <strong>Configurações → Segurança → Limpar dados locais</strong>.
      Para apagar sua conta, envie um e-mail para <a className="text-primary hover:underline" href="mailto:privacy@carsai.app">privacy@carsai.app</a>.</p>
  ) },
  { n: 8, title: "Contato", body: (
    <p><a className="text-primary hover:underline" href="mailto:privacy@carsai.app">privacy@carsai.app</a></p>
  ) },
];

function Privacy() {
  return (
    <PublicShell
      eyebrow="Legal"
      icon={<ShieldCheck className="h-3 w-3" />}
      title="Política de Privacidade"
      subtitle="Última atualização: 20 de junho de 2026"
      art={<FloatingArt variant="shield" />}
    >
      <div className="grid gap-4 md:grid-cols-2">
        {SECTIONS.map((s) => (
          <SectionCard key={s.n} number={s.n} title={s.title}>{s.body}</SectionCard>
        ))}
      </div>
    </PublicShell>
  );
}
