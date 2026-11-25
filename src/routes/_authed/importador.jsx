import { createFileRoute } from "@tanstack/react-router";
import ImporterScreen from "@/components/importer/ImporterScreen";

export const Route = createFileRoute("/_authed/importador")({
  head: () => ({
    meta: [
      { title: "Importador de curvas — HeliPerf" },
      { name: "description", content: "Validação, preview e gravação das curvas de performance do RFM." },
    ],
  }),
  component: ImporterScreen,
});
