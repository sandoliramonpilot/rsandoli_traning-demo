import { useMemo, useState } from "react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useSettings } from "@/lib/settings";
import { altitudeBundle } from "@/lib/performance/altitude";
import { fmt, toNumber } from "@/lib/performance/format";
import { ftToM, mToFt, hpaToInHg, inHgToHpa, fToC } from "@/lib/performance/units";
import AltitudeForm from "@/components/altitude/AltitudeForm";
import AltitudeResultCard from "@/components/altitude/AltitudeResultCard";
import Disclaimer from "@/components/Disclaimer";

export default function AltitudeCalculator() {
  const { settings } = useSettings();
  const { isAuthenticated, navigateToLogin } = useAuth();

  const [mode, setMode] = useState("elevation");
  const [elevation, setElevation] = useState("1000");
  const [elevUnit, setElevUnit] = useState("ft");
  const [qnh, setQnh] = useState("1013.25");
  const [qnhUnit, setQnhUnit] = useState(settings.qnhUnit || "hPa");
  const [oat, setOat] = useState(settings.units === "imperial" ? "68" : "20");
  const [tempUnit, setTempUnit] = useState(settings.units === "imperial" ? "F" : "C");
  const [pressureAltitude, setPressureAltitude] = useState("5000");
  const [saving, setSaving] = useState(false);

  const elevationFt = elevUnit === "m" ? mToFt(toNumber(elevation)) : toNumber(elevation);
  const qnhHpa = qnhUnit === "inHg" ? inHgToHpa(toNumber(qnh, 29.92)) : toNumber(qnh, 1013.25);
  const oatC = tempUnit === "F" ? fToC(toNumber(oat)) : toNumber(oat);

  const bundle = useMemo(
    () =>
      altitudeBundle({
        elevationFt,
        qnhHpa,
        oatC,
        pressureAltitudeFt: mode === "pressure" ? toNumber(pressureAltitude, 0) : null,
      }),
    [elevationFt, qnhHpa, oatC, mode, pressureAltitude]
  );

  const changeElevUnit = (next) => {
    if (next === elevUnit) return;
    const converted = next === "m" ? ftToM(toNumber(elevation)) : mToFt(toNumber(elevation));
    setElevation(String(Math.round(converted)));
    setElevUnit(next);
  };

  const changeQnhUnit = (next) => {
    if (next === qnhUnit) return;
    const converted = next === "inHg" ? hpaToInHg(toNumber(qnh, 1013.25)) : inHgToHpa(toNumber(qnh, 29.92));
    setQnh(next === "inHg" ? converted.toFixed(2) : converted.toFixed(1));
    setQnhUnit(next);
  };

  const changeTempUnit = (next) => {
    if (next === tempUnit) return;
    const current = toNumber(oat);
    const converted = next === "F" ? (current * 9) / 5 + 32 : ((current - 32) * 5) / 9;
    setOat(converted.toFixed(0));
    setTempUnit(next);
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      navigateToLogin();
      return;
    }
    setSaving(true);
    try {
      await base44.entities.Calculation.create({
        type: "altitude",
        aircraftId: "",
        aircraftLabel: "Cálculo de altitude",
        inputs: bundle.inputs,
        outputs: {
          pressureAltitudeFt: bundle.pressureAltitudeFt,
          isaC: bundle.isaC,
          isaDeviationC: bundle.isaDeviationC,
          densityAltitudeFt: bundle.densityAltitudeFt,
          indicatedAltitudeFt: bundle.indicatedAltitudeFt,
          trueAltitudeFt: bundle.trueAltitudeFt,
        },
        memorySteps: bundle.steps,
        status: "ok",
        createdAt: new Date().toISOString(),
      });
      toast.success("Cálculo salvo no histórico");
    } catch (error) {
      toast.error("Não foi possível salvar o cálculo");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow text-primary">Calculadora independente</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
          Altitude de densidade
        </h1>
        <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
          AP → ISA → ΔT → AD → AI → AV, na ordem do cálculo, com memória em cada etapa.
        </p>
      </header>

      <AltitudeForm
        mode={mode}
        onModeChange={setMode}
        elevation={elevation}
        onElevationChange={setElevation}
        elevUnit={elevUnit}
        onElevUnitChange={changeElevUnit}
        qnh={qnh}
        onQnhChange={setQnh}
        qnhUnit={qnhUnit}
        onQnhUnitChange={changeQnhUnit}
        oat={oat}
        onOatChange={setOat}
        tempUnit={tempUnit}
        onTempUnitChange={changeTempUnit}
        pressureAltitude={pressureAltitude}
        onPressureAltitudeChange={setPressureAltitude}
      />

      <section>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold text-foreground">Resultados</h2>
          <span className="num text-[11px] text-muted-foreground">
            ΔT {bundle.isaDeviationC >= 0 ? "+" : "−"}
            {fmt(Math.abs(bundle.isaDeviationC), 1)} °C
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <AltitudeResultCard
            label="Altitude de pressão"
            value={bundle.pressureAltitudeFt}
            unit="ft"
            steps={bundle.steps.pressureAltitude}
            secondary={`${fmt(ftToM(bundle.pressureAltitudeFt))} m`}
          />
          <AltitudeResultCard
            label="Temperatura ISA"
            value={bundle.isaC}
            unit="°C"
            decimals={1}
            steps={bundle.steps.isa}
          />
          <AltitudeResultCard
            label="Desvio ISA (ΔT)"
            value={bundle.isaDeviationC}
            unit="°C"
            decimals={1}
            signed
            steps={bundle.steps.deviation}
          />
          <AltitudeResultCard
            label="Altitude de densidade"
            value={bundle.densityAltitudeFt}
            unit="ft"
            primary
            alert={bundle.densityAltitudeFt > 5000}
            steps={bundle.steps.densityAltitude}
            secondary={`${fmt(ftToM(bundle.densityAltitudeFt))} m`}
          />
          <AltitudeResultCard
            label="Altitude indicada"
            value={bundle.indicatedAltitudeFt}
            unit="ft"
            steps={bundle.steps.indicatedAltitude}
            secondary={`${fmt(ftToM(bundle.indicatedAltitudeFt))} m`}
          />
          <AltitudeResultCard
            label="Altitude verdadeira"
            value={bundle.trueAltitudeFt}
            unit="ft"
            steps={bundle.steps.trueAltitude}
            secondary={`${fmt(ftToM(bundle.trueAltitudeFt))} m`}
          />
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-md text-[11px] leading-relaxed text-muted-foreground">
          Fórmula prática de aviação. Para valores de performance, use sempre a carta de altitude
          densidade do RFM.
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Salvando..." : isAuthenticated ? "Salvar cálculo" : "Entrar para salvar"}
        </button>
      </div>

      <Disclaimer />
    </div>
  );
}
