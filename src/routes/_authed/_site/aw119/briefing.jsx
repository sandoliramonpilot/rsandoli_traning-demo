import { createFileRoute } from "@tanstack/react-router";
import BriefingScreen from "@/components/performance/BriefingScreen";

export const Route = createFileRoute("/_site/aw119/briefing")({
  head: () => ({
    meta: [{ title: "Briefing AW119 MKII — HeliPerf" }],
  }),
  component: () => <BriefingScreen moduleId="aw119" variantId={null} aircraftSlug="aw119" />,
});
