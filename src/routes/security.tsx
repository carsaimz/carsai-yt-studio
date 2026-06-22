import { createFileRoute } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { PublicShell, SectionCard, FloatingArt } from "@/components/public/public-shell";

export const Route = createFileRoute("/security")({
  head: () => ({ meta: [{ title: "Segurança — Carsai YT Studio" }] }),
  component: Security,
});

function Security() {
  return (
    <PublicShell
      eyebrow="Segurança"
      icon={<ShieldAlert className="h-3 w-3" />}
      title="Segurança"
      subtitle="Como protegemos seus dados e como reportar vulnerabilidades."
      art={<FloatingArt variant="shield" />}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard number={1} title="Armazenamento">
          <p>Chaves e tokens ficam exclusivamente no seu dispositivo, em <code>localStorage</code> e
            <code>IndexedDB</code>. Em apps nativos usamos Capacitor Preferences (Keychain no iOS,
            EncryptedSharedPreferences no Android).</p>
        </SectionCard>
        <SectionCard number={2} title="Comunicação">
          <p>Todas as chamadas a YouTube, autenticação e provedores de IA são feitas via HTTPS,
            direto do seu dispositivo — sem proxy.</p>
        </SectionCard>
        <SectionCard number={3} title="Bloqueio biométrico">
          <p>Em apps mobile você pode ativar bloqueio por impressão digital ou Face ID em
            <strong> Configurações → Segurança</strong>.</p>
        </SectionCard>
        <SectionCard number={4} title="Relatar vulnerabilidades">
          <p>Envie e-mail para <a className="text-primary hover:underline" href="mailto:security@carsai.app">security@carsai.app</a>.
            Aceitamos divulgação responsável coordenada.</p>
        </SectionCard>
      </div>
    </PublicShell>
  );
}
