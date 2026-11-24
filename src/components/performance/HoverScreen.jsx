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
import { hoverChart } from "@/components/performance/chartData";
import { useAuth } from "@/lib/AuthContext";
import { useAircraftBySlug, usePerfTables } from "@/lib/usePerfTables";
import {
  ELECTRICAL_REFERENCE_A,
  HOVER_CHART_TYPE,
  hoverCeiling,
  selectTable,
} from "@/lib/performance/curveEngine";
import { CONDITION_OPTIONS, HOVER_MODE_OPTIONS, POWER_OPTIONS, conditionLabel } from "@/lib/performance/conditions";
import { fmt, toNumber } from "@/lib/performance/format";
import { kgToLb } from "@/lib/performance/units";
import { saveCalculation } from "@/lib/saveCalculation";

export default function HoverScreen({ moduleId, variantId, aircraftSlug }) {
  const { aircraft } = useAircraftBySlug(aircraftSlug);
  const { tables, loaded } = usePerfTables(aircraft.id);
  const { isAuthenticated, navigateToLogin } = useAuth();

  const [mode, setMode] = useState("IGE");
  const [power, setPower] = useState("MCP");
  const [condition, setCondition] = useState("clean");
  const [pressureAltitude, setPressureAltitude] = useState("3000");
  const [oat, setOat] = useState("20");
  const [weight, setWeight] = useState(String(aircraft.maxGrossWeightKg ?? 2250));
  const [electricalLoad, setElectricalLoad] = useState(String(ELECTRICAL_REFERENCE_A[aircraftSlug] ?? 100));
  const [saving, setSaving] = useState(false);

  const chartType = HOVER_CHART_TYPE(mode, power);
  const table = selectTable(tables, chartType, condition);

  const result = useMemo(
    () =>
      hoverCeiling({
        aircraft,
        table,
        pressureAltitudeFt: toNumber(pressureAltitude),
        oatC: toNumber(oat),
        currentWeightKg: toNumber(weight, null),
        condition,
        electricalLoadA: toNumber(electricalLoad, null),
      }),
    [aircraft, table, pressureAltitude, oat, weight, condition, electricalLoad]
  );

  const chart = hoverChart(table, result, oat);

  const handleSave = async () => {
    if (!isAuthenticated) {
      navigateToLogin();
      return;
    }
    setSaving(true);
    try {
      await saveCalculation({
        type: "hover",
        aircraft,
        inputs: {
          mode,
          power,
          condition,
          pressureAltitudeFt: toNumber(pressureAltitude),
          oatC: toNumber(oat),
          currentWeightKg: toNumber(weight, null),
          electricalLoadA: toNumber(electricalLoad, null),
          chartType,
          sourceFigure: table?.sourceFigure,
          sourceRevision: table?.sourceRevision,
        },
        outputs: {
          hoverMaxWeightKg: result.maxWeightKg ?? null,
          hoverMaxWeightLb: result.maxWeightLb ?? null,
          hoverMarginKg: result.marginKg ?? null,
          verdict: result.verdict ?? "—",
        },
        memorySteps: { hover: result.steps },
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
        eyebrow="Hover ceiling"
        title={aircraft.model}
        subtitle={`${aircraft.variant} · ${mode} · ${power} · ${conditionLabel(condition)}`}
        aircraft={aircraft}
        figure={table?.sourceFigure}
        backTo={backTo}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
        <section className="surface p-4">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Modo
                </p>
                <div className="mt-1.5">
                  <Segmented options={HOVER_MODE_OPTIONS} value={mode} onChange={setMode} ariaLabel="Modo" />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Potência
                </p>
                <div className="mt-1.5">
                  <Segmented options={POWER_OPTIONS} value={power} onChange={setPower} ariaLabel="Potência" />
                </div>
              </div>
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
              <NumberField
                label="Altitude de pressão"
                unit="ft"
                value={pressureAltitude}
                onChange={setPressureAltitude}
              />
              <NumberField label="OAT" unit="°C" value={oat} onChange={setOat} />
              <NumberField label="Peso atual" unit="kg" value={weight} onChange={setWeight} />
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
              {loaded ? `${tables.length} curva(s) importada(s)` : "Carregando curvas..."}
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
          ) : !table ? (
            <CurveStateNotice
              tone="ausente"
              title="Curva não importada"
              description={`Nenhuma PerfTable ${chartType.toUpperCase()} para esta aeronave. Importe a figura do RFM para habilitar o cálculo.`}
            />
          ) : result.blocked ? (
            <CurveStateNotice tone="pendente" title="Curva pendente de validação" description={result.reason} />
          ) : !result.available ? (
            <CurveStateNotice
              tone={result.outOfEnvelope ? "erro" : "ausente"}
              title={result.outOfEnvelope ? "Fora do envelope do RFM" : "Cálculo indisponível"}
              description={result.reason}
            />
          ) : (
            <>
              <div className="surface overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      Peso máximo de pairado · {mode} / {power}
                    </p>
                    <p className="num mt-1 text-3xl font-semibold text-foreground">
                      {fmt(result.maxWeightKg)}
                      <span className="ml-1.5 text-xs font-normal text-muted-foreground">kg</span>
                    </p>
                    <p className="num text-[11px] text-muted-foreground">
                      {fmt(result.maxWeightLb)} lb
                    </p>
                  </div>
                  <StatusPill status={result.status} label={result.verdict} />
                </div>

                <dl className="grid grid-cols-2 divide-x divide-border border-b border-border">
                  <div className="px-4 py-3">
                    <dt className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                      Peso atual
                    </dt>
                    <dd className="num mt-1 text-sm text-foreground">
                      {fmt(toNumber(weight, null))} kg
                      <span className="ml-1 text-[10px] text-muted-foreground">
                        {fmt(kgToLb(toNumber(weight, null)))} lb
                      </span>
                    </dd>
                  </div>
                  <div className="px-4 py-3">
                    <dt className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground">Margem</dt>
                    <dd
                      className={`num mt-1 text-sm ${result.marginKg >= 0 ? "text-emerald-300" : "text-rose-300"}`}
                    >
                      {result.marginKg >= 0 ? "+" : "−"}
                      {fmt(Math.abs(result.marginKg))} kg
                    </dd>
                  </div>
                </dl>

                {result.correctedWeightKg != null ? (
                  <div className="border-b border-border px-4 py-3">
                    <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                      Peso corrigido (modelo B)
                    </p>
                    <p className="num mt-1 text-sm text-foreground">{fmt(result.correctedWeightKg)} kg</p>
                  </div>
                ) : null}

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
                    {table.sourceFigure} · {table.sourceRevision}
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
