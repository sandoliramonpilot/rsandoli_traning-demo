import { useMemo, useState } from "react";
import { toast } from "sonner";
import Disclaimer from "@/components/Disclaimer";
import MemorySteps from "@/components/MemorySteps";
import NumberField from "@/components/NumberField";
import Segmented from "@/components/Segmented";
import StatusPill from "@/components/StatusPill";
import AircraftPageHeader from "@/components/performance/AircraftPageHeader";
import CurveChart from "@/components/performance/CurveChart";
import CurveStateNotice from "@/components/performance/CurveStateNotice";
import { rocChart } from "@/components/performance/chartData";
import { useAuth } from "@/lib/AuthContext";
import { useAircraftBySlug, usePerfTables } from "@/lib/usePerfTables";
import { ELECTRICAL_REFERENCE_A, rateOfClimb } from "@/lib/performance/curveEngine";
import { CONDITION_OPTIONS, POWER_OPTIONS, conditionLabel } from "@/lib/performance/conditions";
import { fmt, toNumber } from "@/lib/performance/format";
import { saveCalculation } from "@/lib/saveCalculation";

export default function RocScreen({ moduleId, variantId, aircraftSlug }) {
  const { aircraft } = useAircraftBySlug(aircraftSlug);
  const { tables, loaded } = usePerfTables(aircraft.id);
  const { isAuthenticated, navigateToLogin } = useAuth();

  const [power, setPower] = useState("MCP");
  const [condition, setCondition] = useState("clean");
  const [pressureAltitude, setPressureAltitude] = useState("3000");
  const [oat, setOat] = useState("20");
  const [weight, setWeight] = useState(String(aircraft.maxGrossWeightKg ?? 2250));
  const [electricalLoad, setElectricalLoad] = useState(String(ELECTRICAL_REFERENCE_A[aircraftSlug] ?? 100));
  const [saving, setSaving] = useState(false);

  const result = useMemo(
    () =>
      rateOfClimb({
        aircraft,
        tables,
        grossWeightKg: toNumber(weight, null),
        pressureAltitudeFt: toNumber(pressureAltitude),
        oatC: toNumber(oat),
        power,
        condition,
        electricalLoadA: toNumber(electricalLoad, null),
      }),
    [aircraft, tables, weight, pressureAltitude, oat, power, condition, electricalLoad]
  );

  const chart = rocChart(result.table, result, oat);

  const handleSave = async () => {
    if (!isAuthenticated) {
      navigateToLogin();
      return;
    }
    setSaving(true);
    try {
      await saveCalculation({
        type: "roc",
        aircraft,
        inputs: {
          power,
          condition,
          grossWeightKg: toNumber(weight, null),
          pressureAltitudeFt: toNumber(pressureAltitude),
          oatC: toNumber(oat),
          electricalLoadA: toNumber(electricalLoad, null),
          sourceFigure: result.table?.sourceFigure,
          sourceRevision: result.table?.sourceRevision,
        },
        outputs: {
          rocFtMin: result.rocFtMin ?? null,
          rocTimeMin: result.timeTo1000FtMin ?? null,
          rocGradientPct: result.gradientPct ?? null,
        },
        memorySteps: { roc: result.steps },
        status: result.status === "excede" ? "excede" : "ok",
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
        eyebrow="Subida (ROC)"
        title={aircraft.model}
        subtitle={`${aircraft.variant} · ${power} · ${conditionLabel(condition)}`}
        aircraft={aircraft}
        figure={result.table?.sourceFigure}
        backTo={backTo}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
        <section className="surface p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Potência
              </p>
              <Segmented options={POWER_OPTIONS} value={power} onChange={setPower} ariaLabel="Potência" />
            </div>

            <label className="block">
              <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Condição
              </span>
              <select
                value={condition}
                onChange={(event) => setCondition(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-input bg-secondary/40 px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60"
              >
                {CONDITION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
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
              <NumberField
                label="Carga elétrica"
                unit="A"
                value={electricalLoad}
                onChange={setElectricalLoad}
                hint={`Referência ${fmt(ELECTRICAL_REFERENCE_A[aircraftSlug] ?? 100)} A`}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {loaded ? `${tables.filter((t) => t.chartType?.startsWith("roc")).length} carta(s) de ROC` : "Carregando curvas..."}
            </p>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !result.available}
              className="rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Salvando..." : isAuthenticated ? "Salvar cálculo" : "Entrar para salvar"}
            </button>
          </div>
        </section>

        <section className="space-y-4">
          {!loaded ? (
            <div className="h-48 animate-pulse rounded-2xl border border-border bg-card/60" />
          ) : result.blocked ? (
            <CurveStateNotice tone="pendente" title="Curva pendente de validação" description={result.reason} />
          ) : !result.available ? (
            <CurveStateNotice
              tone={result.outOfEnvelope ? "erro" : "ausente"}
              title={result.outOfEnvelope ? "Fora do envelope do RFM" : "Carta de subida não importada"}
              description={result.reason}
            />
          ) : (
            <>
              <div className="surface overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      Razão de subida · {power}
                    </p>
                    <p className="num mt-1 text-3xl font-semibold text-foreground">
                      {fmt(result.rocFtMin)}
                      <span className="ml-1.5 text-xs font-normal text-muted-foreground">ft/min</span>
                    </p>
                    <p className="num text-[11px] text-muted-foreground">{fmt(result.rocMps, 2)} m/s</p>
                  </div>
                  <StatusPill status={result.status} />
                </div>

                <dl className="grid grid-cols-3 divide-x divide-border border-b border-border">
                  <div className="px-3 py-3">
                    <dt className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">1.000 ft</dt>
                    <dd className="num mt-1 text-sm text-foreground">
                      {result.timeTo1000FtMin ? `${fmt(result.timeTo1000FtMin, 1)} min` : "—"}
                    </dd>
                  </div>
                  <div className="px-3 py-3">
                    <dt className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Gradiente</dt>
                    <dd className="num mt-1 text-sm text-foreground">
                      {result.gradientPct ? `${fmt(result.gradientPct, 1)}%` : "—"}
                    </dd>
                  </div>
                  <div className="px-3 py-3">
                    <dt className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Vy</dt>
                    <dd className="num mt-1 text-sm text-foreground">{fmt(result.vyKt)} kt</dd>
                  </div>
                </dl>

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
                    {result.table?.sourceFigure} · {result.table?.sourceRevision}
                  </p>
                  <StatusPill status="ok" label="VALIDADO" />
                </div>

                <div className="px-4 pb-4">
                  <MemorySteps steps={result.steps} />
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
