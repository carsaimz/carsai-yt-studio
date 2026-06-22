import { createFileRoute } from "@tanstack/react-router";
import { Cookie } from "lucide-react";
import { PublicShell, SectionCard, FloatingArt } from "@/components/public/public-shell";

export const Route = createFileRoute("/cookies")({
  head: () => ({ meta: [{ title: "Cookies — Carsai YT Studio" }] }),
  component: Cookies,
});

function Cookies() {
  return (
    <PublicShell
      eyebrow="Legal"
      icon={<Cookie className="h-3 w-3" />}
      title="Política de Cookies"
      subtitle="Como tratamos cookies e armazenamento local."
      art={<FloatingArt variant="cookie" />}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard number={1} title="Sem rastreamento">
          <p>O Carsai YT Studio <strong>não utiliza cookies de rastreamento publicitário ou analítico próprio</strong>.</p>
        </SectionCard>
        <SectionCard number={2} title="Armazenamento local">
          <p>Usamos <code>localStorage</code> e <code>IndexedDB</code> para guardar suas preferências, chaves e cache.
            No app nativo, usamos Capacitor Preferences (Keychain/EncryptedSharedPreferences).</p>
        </SectionCard>
        <SectionCard number={3} title="Cookies de terceiros">
          <p>Provedores externos (Google, autenticação, provedores de IA) podem definir seus próprios cookies
            quando você os utiliza diretamente. Consulte as políticas de cada um.</p>
        </SectionCard>
        <SectionCard number={4} title="Como apagar">
          <p>Vá em <strong>Configurações → Segurança → Limpar dados locais</strong>, ou apague o site das configurações do seu navegador/app.</p>
        </SectionCard>
      </div>
    </PublicShell>
  );
}
