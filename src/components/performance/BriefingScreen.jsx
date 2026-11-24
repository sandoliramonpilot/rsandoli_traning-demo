import BriefingPanel from "@/components/BriefingPanel";
import AircraftPageHeader from "@/components/performance/AircraftPageHeader";
import { useAircraftBySlug } from "@/lib/usePerfTables";

export default function BriefingScreen({ moduleId, variantId, aircraftSlug }) {
  const { aircraft, loaded } = useAircraftBySlug(aircraftSlug);
  const backTo = moduleId === "h125" && variantId ? "/h125" : "/";

  return (
    <div className="space-y-5">
      <AircraftPageHeader
        eyebrow="Briefing de voo"
        title={aircraft.model}
        subtitle={`${aircraft.variant} · ${aircraft.engine} · MTOW ${aircraft.maxGrossWeightKg} kg`}
        aircraft={aircraft}
        backTo={backTo}
      />
      {loaded ? (
        <BriefingPanel key={aircraft.slug} aircraft={aircraft} />
      ) : (
        <div className="h-64 animate-pulse rounded-2xl border border-border bg-card/60" />
      )}
    </div>
  );
}
