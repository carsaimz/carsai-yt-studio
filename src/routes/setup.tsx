import { createFileRoute } from "@tanstack/react-router";
import { SetupWizard } from "@/components/setup/wizard";

export const Route = createFileRoute("/setup")({
  head: () => ({
    meta: [
      { title: "Instalação — Carsai YT Studio" },
      { name: "description", content: "Configure suas chaves do Firebase, YouTube e IA para começar." },
    ],
  }),
  component: SetupWizard,
});
