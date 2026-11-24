import LimitationsView from "@/components/limitations/LimitationsView";
import AircraftPageHeader from "@/components/performance/AircraftPageHeader";
import { useAircraftBySlug } from "@/lib/usePerfTables";

export default function LimitationsScreen({ moduleId, variantId, aircraftSlug }) {
  const { aircraft } = useAircraftBySlug(aircraftSlug);
  const backTo = moduleId === "h125" && variantId ? "/h125" : "/";

  return (
    <div className="space-y-5">
      <AircraftPageHeader
        eyebrow="Limitações rápidas"
        title={aircraft.model}
        subtitle={`${aircraft.variant} · ${aircraft.engine}`}
        aircraft={aircraft}
        backTo={backTo}
      />
      <LimitationsView aircraft={aircraft} />
    </div>
  );
}
