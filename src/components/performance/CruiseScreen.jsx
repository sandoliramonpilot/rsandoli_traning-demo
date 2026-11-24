import { useMemo, useState } from "react";
import { toast } from "sonner";
import Disclaimer from "@/components/Disclaimer";
import MemorySteps from "@/components/MemorySteps";
import NumberField from "@/components/NumberField";
import StatusPill from "@/components/StatusPill";
import AircraftPageHeader from "@/components/performance/AircraftPageHeader";
import CurveChart from "@/components/performance/CurveChart";
import CurveStateNotice from "@/components/performance/CurveStateNotice";
import { cruiseChart } from "@/components/performance/chartData";
import { useAuth } from "@/lib/AuthContext";
import { useAircraftBySlug, useCruiseCharts, useRangeChart } from "@/lib/usePerfTables";
import { CRUISE_MODES, cruisePerformance, rangeEndurance } from "@/lib/performance/curveEngine";
import { fmt, toNumber } from "@/lib/performance/format";
import { saveCalculation } from "@/lib/saveCalculation";

export default function CruiseScreen({ moduleId, variantId, aircraftSlug }) {
  const { aircraft } = useAircraftBySlug(aircraftSlug);
  const { charts, loaded } = useCruiseCharts(aircraft.id);
  const { chart: rangeChart } = useRangeChart(aircraft.id);
  const { isAuthenticated, navigateToLogin } = useAuth();

  const [mode, setMode] = useState("recommended");
  const [pressureAltitude, setPressureAltitude] = useState("3000");
  const [oat, setOat] = useState("20");
  const [weight, setWeight] = useState(String(aircraft.maxGrossWeightKg ?? 2250));
  const [fuel, setFuel] = useState("400");
  const [wind, setWind] = useState("0");
  const [saving, setSaving] = useState(false);

  const cruise = useMemo(
    () =>
      cruisePerformance({
        charts,
        grossWeightKg: toNumber(weight, null),
        pressureAltitudeFt: toNumber(pressureAltitude),
        oatC: toNumber(oat),
        mode,
      }),
    [charts, weight, pressureAltitude, oat, mode]
  );

  const range = useMemo(
    () =>
      rangeEndurance({
        availableFuelKg: toNumber(fuel),
        fuelConsumptionKgH: cruise.fuelKgH,
        trueAirspeedKt: cruise.trueAirspeedKt,
        windComponentKt: toNumber(wind),
        chart: rangeChart?.status === "validado" ? rangeChart : null,
      }),
    [fuel, wind, cruise.fuelKgH, cruise.trueAirspeedKt, rangeChart]
  );

  const chart = cruiseChart(cruise.table, cruise);
  const steps = [...(cruise.steps || []), ...(range.steps || [])];

  const handleSave = async () => {
    if (!isAuthenticated) {
      navigateToLogin();
      return;
    }
    setSaving(true);
    try {
      await saveCalculation({
        type: "cruise",
        aircraft,
        inputs: {
          mode,
          grossWeightKg: toNumber(weight, null),
          pressureAltitudeFt: toNumber(pressureAltitude),
          oatC: toNumber(oat),
          availableFuelKg: toNumber(fuel),
          windComponentKt: toNumber(wind),
          sourceFigure: cruise.sourceFigure,
          sourceRevision: cruise.sourceRevision,
        },
        outputs: {
          cruiseTasKt: cruise.trueAirspeedKt ?? null,
          cruiseIasKt: cruise.iasKt ?? null,
          cruiseTorquePct: cruise.torquePct ?? null,
          cruiseFuelKgH: cruise.fuelKgH ?? null,
          enduranceH: range.enduranceH ?? null,
          rangeNm: range.rangeNm ?? null,
        },
        memorySteps: { cruise: steps },
        status: "ok",
      });
      toast.success("Cálculo salvo no histórico");
    } catch (error) {
      toast.error("Não foi possível salvar o cálculo");
    } finally {
      setSaving(false);
    }
  };

  const backTo = moduleId === "h125" && variantId ? "/h125" : "/";

  return (
    <div className="space-y-5">
      <AircraftPageHeader
        eyebrow="Cruzeiro e autonomia"
        title={aircraft.model}
        subtitle={`${aircraft.variant} · ${CRUISE_MODES.find((entry) => entry.id === mode)?.label}`}
        aircraft={aircraft}
        figure={cruise.sourceFigure}
        backTo={backTo}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
        <section className="surface p-4">
          <div className="space-y-3">
            <label className="block">
              <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Modo de cruzeiro
              </span>
              <select
                value={mode}
                onChange={(event) => setMode(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-input bg-secondary/40 px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60"
              >
                {CRUISE_MODES.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <NumberField label="Peso bruto" unit="kg" value={weight} onChange={setWeight} />
              <NumberField
                label="Altitude de pressão"
                unit="ft"
                value={pressureAltitude}
                onChange={setPressureAltitude}
              />
              <NumberField label="OAT" unit="°C" value={oat} onChange={setOat} />
              <NumberField label="Combustível disponível" unit="kg" value={fuel} onChange={setFuel} />
              <NumberField
                label="Componente de vento"
                unit="kt"
                value={wind}
                onChange={setWind}
                hint="Positivo = proa; negativo = cauda"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {loaded ? `${charts.length} carta(s) de cruzeiro` : "Carregando curvas..."}
            </p>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !cruise.available}
              className="rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Salvando..." : isAuthenticated ? "Salvar cálculo" : "Entrar para salvar"}
            </button>
          </div>
        </section>

        <section className="space-y-4">
          {!loaded ? (
            <div className="h-48 animate-pulse rounded-2xl border border-border bg-card/60" />
          ) : cruise.blocked ? (
            <CurveStateNotice tone="pendente" title="Carta pendente de validação" description={cruise.reason} />
          ) : !cruise.available ? (
            <CurveStateNotice
              tone={cruise.outOfEnvelope ? "erro" : "ausente"}
              title={cruise.outOfEnvelope ? "Fora do envelope do RFM" : "Carta de cruzeiro não importada"}
              description={cruise.reason}
            />
          ) : (
            <>
              <div className="surface overflow-hidden">
                <div className="grid grid-cols-2 divide-x divide-y divide-border border-b border-border sm:grid-cols-4 sm:divide-y-0">
                  <Metric label="TAS" value={fmt(cruise.trueAirspeedKt)} unit="kt" />
                  <Metric label="IAS" value={fmt(cruise.iasKt)} unit="kt" />
                  <Metric label="Torque" value={fmt(cruise.torquePct, 1)} unit="%" />
                  <Metric label="Consumo" value={fmt(cruise.fuelKgH)} unit="kg/h" />
                </div>

                <div className="grid grid-cols-2 divide-x divide-border border-b border-border sm:grid-cols-4">
                  <Metric label="Autonomia" value={range.available ? range.enduranceLabel : "—"} unit="h" />
                  <Metric label="Alcance" value={range.available ? fmt(range.rangeNm) : "—"} unit="nm" />
                  <Metric label="Alcance" value={range.available ? fmt(range.rangeKm) : "—"} unit="km" />
                  <Metric
                    label="Alcance específico"
                    value={range.available ? fmt(range.specificRangeNmKg, 3) : "—"}
                    unit="nm/kg"
                  />
                </div>

                <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2">
                  <p className="text-[10px] text-muted-foreground">
                    Ground speed {range.available ? `${fmt(range.groundSpeedKt)} kt` : "—"}
                  </p>
                  <StatusPill status="ok" label="CALCULADO" />
                </div>

                <div className="px-2 pb-2 pt-3">
                  <CurveChart
                    series={chart.series}
                    point={chart.point}
                    xLabel={chart.xLabel}
                    yLabel={chart.yLabel}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-2.5">
                  <p className="text-[10px] text-muted-foreground">
                    {cruise.sourceFigure} · {cruise.sourceRevision}
                  </p>
                  <StatusPill status="ok" label="VALIDADO" />
                </div>

                <div className="px-4 pb-4">
                  <MemorySteps steps={steps} />
                </div>
              </div>
              <Disclaimer />
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value, unit }) {
  return (
    <div className="px-3 py-3">
      <p className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="num mt-1 text-lg font-semibold text-foreground">
        {value}
        <span className="ml-1 text-[10px] font-normal text-muted-foreground">{unit}</span>
      </p>
    </div>
  );
}
