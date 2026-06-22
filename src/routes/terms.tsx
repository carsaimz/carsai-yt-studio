import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { PublicShell, SectionCard, FloatingArt } from "@/components/public/public-shell";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — Carsai YT Studio" },
      { name: "description", content: "Termos de uso do Carsai YT Studio." },
    ],
  }),
  component: Terms,
});

const SECTIONS = [
  { n: 1, title: "Aceite dos Termos", body: (
    <p>Ao acessar e usar o Carsai YT Studio você concorda integralmente com estes Termos. Se não concordar, não utilize o serviço.</p>
  ) },
  { n: 2, title: "Definição do Serviço", body: (
    <p>Plataforma open-source para criadores gerenciarem canais do YouTube com auxílio de IA.
      Disponível como web app, PWA, app Android (APK/AAB), iOS (IPA) e desktop (Tauri). Código sob licença MIT.</p>
  ) },
  { n: 3, title: "Uso Responsável", body: (
    <ul className="ml-4 list-disc space-y-1">
      <li>Respeite os <a className="text-primary hover:underline" href="https://developers.google.com/youtube/terms/api-services-terms-of-service" target="_blank" rel="noreferrer">Termos da YouTube API</a> e as Políticas do YouTube;</li>
      <li>Respeite os termos de cada provedor de IA que conectar;</li>
      <li>Você é responsável pelo conteúdo que cria, edita ou publica.</li>
    </ul>
  ) },
  { n: 4, title: "Limitações de Responsabilidade", body: (
    <>
      <p>O app é fornecido <em>"como está"</em>, sem garantias. Não nos responsabilizamos por:</p>
      <ul className="ml-4 mt-1 list-disc space-y-1">
        <li>Bloqueios, suspensões ou rate-limit do YouTube, Google ou provedores de IA;</li>
        <li>Custos de chamadas a provedores de IA pagos;</li>
        <li>Perda de dados locais, falhas em sincronização ou interrupções de serviço.</li>
      </ul>
    </>
  ) },
  { n: 5, title: "Propriedade Intelectual", body: (
    <p>O código-fonte é MIT. O conteúdo que você cria, edita ou publica é seu.</p>
  ) },
  { n: 6, title: "Disponibilidade", body: (
    <p>Pode ser usado online, instalado como app ou auto-hospedado em qualquer servidor estático. Não garantimos uptime de hospedagens públicas.</p>
  ) },
  { n: 7, title: "Alterações dos Termos", body: (
    <p>Podemos atualizar estes Termos. Mudanças significativas serão registradas no <a href="/changelog" className="text-primary hover:underline">changelog</a>.</p>
  ) },
  { n: 8, title: "Contato", body: (
    <p>Para dúvidas legais: <a className="text-primary hover:underline" href="mailto:legal@carsai.app">legal@carsai.app</a>.</p>
  ) },
];

function Terms() {
  return (
    <PublicShell
      eyebrow="Legal"
      icon={<FileText className="h-3 w-3" />}
      title="Termos de Uso"
      subtitle="Última atualização: 20 de junho de 2026"
      art={<FloatingArt variant="doc" />}
    >
      <div className="grid gap-4 md:grid-cols-2">
        {SECTIONS.map((s) => (
          <SectionCard key={s.n} number={s.n} title={s.title}>{s.body}</SectionCard>
        ))}
      </div>
    </PublicShell>
  );
}
