import { createFileRoute } from "@tanstack/react-router";
import HistoryList from "@/components/history/HistoryList";

export const Route = createFileRoute("/_authed/historico")({
  head: () => ({
    meta: [
      { title: "Histórico de cálculos — HeliPerf" },
      {
        name: "description",
        content: "Briefings e cálculos de altitude salvos, com memória de cálculo preservada.",
      },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow text-primary">Histórico</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">Cálculos salvos</h1>
        <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
          Cada registro guarda o snapshot de entradas, resultados e memória de cálculo — sem
          recálculo posterior.
        </p>
      </header>
      <HistoryList limit={50} />
    </div>
  );
}
