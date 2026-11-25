import { createFileRoute } from "@tanstack/react-router";
import SettingsPanel from "@/components/settings/SettingsPanel";

export const Route = createFileRoute("/_authed/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — HeliPerf" },
      {
        name: "description",
        content: "Unidades, QNH, margem de segurança, densidade do combustível e peso vazio.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow text-primary">Configurações</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">Preferências</h1>
        <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
          Unidades, margem padrão e dados editáveis por aeronave.
        </p>
      </header>
      <SettingsPanel />
    </div>
  );
}
