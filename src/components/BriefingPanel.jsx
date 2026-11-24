import { useState } from "react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useSettings } from "@/lib/settings";
import { altitudeBundle } from "@/lib/performance/altitude";
import { briefingDecision } from "@/lib/performance/limits";
import { fmt, toNumber } from "@/lib/performance/format";
import { kgToLb, mToFt } from "@/lib/performance/units";
import BriefingForm from "@/components/briefing/BriefingForm";
import BriefingResults from "@/components/briefing/BriefingResults";
import Disclaimer from "@/components/Disclaimer";
import SourceBadge from "@/components/SourceBadge";

export default function BriefingPanel({ aircraft }) {
  const { settings } = useSettings();
  const { isAuthenticated, navigateToLogin } = useAuth();

  const [emptyWeight, setEmptyWeight] = useState(String(aircraft.emptyWeightKg ?? ""));
  const [crew, setCrew] = useState("160");
  const [pax, setPax] = useState("0");
  const [baggage, setBaggage] = useState("0");
  const [fuel, setFuel] = useState("200");
  const [fuelUnit, setFuelUnit] = useState("L");
  const [elevation, setElevation] = useState("1000");
  const [elevUnit, setElevUnit] = useState("ft");
  const [qnh, setQnh] = useState("1013.25");
  const [oat, setOat] = useState("20");
  const [margin, setMargin] = useState(String(settings.defaultSafetyMarginKg ?? 0));
  const [saving, setSaving] = useState(false);

  const density = aircraft.fuelDensityKgL ?? 0.79;
  const fuelQty = toNumber(fuel);
  const fuelKg = fuelUnit === "L" ? fuelQty * density : fuelQty;
  const emptyKg = toNumber(emptyWeight);
  const crewKg = toNumber(crew);
  const paxKg = toNumber(pax);
  const bagKg = toNumber(baggage);
  const totalKg = emptyKg + crewKg + paxKg + bagKg + fuelKg;
  const marginKg = toNumber(margin);

  const elevationFt = elevUnit === "m" ? mToFt(toNumber(elevation)) : toNumber(elevation);
  const qnhHpa = toNumber(qnh, 1013.25);
  const oatC = toNumber(oat);

  const bundle = altitudeBundle({ elevationFt, qnhHpa, oatC });
  const decision = briefingDecision(aircraft, {
    weightKg: totalKg,
    pressureAltitudeFt: bundle.pressureAltitudeFt,
    oatC,
    safetyMarginKg: marginKg,
  });

  const weightSteps = [
    `Peso vazio: ${fmt(emptyKg)} kg`,
    `Tripulação: ${fmt(crewKg)} kg`,
    `Passageiros: ${fmt(paxKg)} kg`,
    `Bagagem: ${fmt(bagKg)} kg`,
    fuelUnit === "L"
      ? `Combustível: ${fmt(fuelQty)} L × ${fmt(density, 2)} kg/L = ${fmt(fuelKg)} kg`
      : `Combustível: ${fmt(fuelQty)} kg`,
    `Peso total = ${fmt(emptyKg)} + ${fmt(crewKg)} + ${fmt(paxKg)} + ${fmt(bagKg)} + ${fmt(fuelKg)} = ${fmt(totalKg)} kg`,
    `Em libras: ${fmt(totalKg)} × 2,20462 = ${fmt(kgToLb(totalKg))} lb`,
    `Margem de segurança: ${fmt(marginKg)} kg (limite operacional ${fmt(aircraft.maxGrossWeightKg - marginKg)} kg)`,
  ];

  const changeElevUnit = (next) => {
    if (next === elevUnit) return;
    const value = toNumber(elevation);
    setElevation(String(Math.round(next === "m" ? value * 0.3048 : value / 0.3048)));
    setElevUnit(next);
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      navigateToLogin();
      return;
    }
    setSaving(true);
    try {
      await base44.entities.Calculation.create({
        type: "briefing",
        aircraftId: aircraft.id || aircraft.slug,
        aircraftLabel: `${aircraft.model} ${aircraft.variant}`,
        inputs: {
          emptyWeightKg: emptyKg,
          crewKg,
          paxKg,
          baggageKg: bagKg,
          fuelQty,
          fuelUnit,
          fuelKg,
          elevationFt,
          qnhHpa,
          oatC,
          safetyMarginKg: marginKg,
        },
        outputs: {
          totalWeightKg: totalKg,
          totalWeightLb: kgToLb(totalKg),
          pressureAltitudeFt: bundle.pressureAltitudeFt,
          densityAltitudeFt: bundle.densityAltitudeFt,
          isaC: bundle.isaC,
          isaDeviationC: bundle.isaDeviationC,
          verdict: decision.verdict,
          vnePowerOnKt: decision.vne.powerOnKt,
          vnePowerOffKt: decision.vne.powerOffKt,
        },
        memorySteps: {
          weight: weightSteps,
          altitude: bundle.steps,
          vne: decision.vne.memorySteps,
          maxTemperature: decision.maxTemp.memorySteps,
        },
        status: decision.status,
        createdAt: new Date().toISOString(),
      });
      toast.success("Briefing salvo no histórico");
    } catch (error) {
      toast.error("Não foi possível salvar o briefing");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start">
      <div className="space-y-4">
        <BriefingForm
          emptyWeight={emptyWeight}
          onEmptyWeightChange={setEmptyWeight}
          crew={crew}
          onCrewChange={setCrew}
          pax={pax}
          onPaxChange={setPax}
          baggage={baggage}
          onBaggageChange={setBaggage}
          fuel={fuel}
          onFuelChange={setFuel}
          fuelUnit={fuelUnit}
          onFuelUnitChange={setFuelUnit}
          elevation={elevation}
          onElevationChange={setElevation}
          elevUnit={elevUnit}
          onElevUnitChange={changeElevUnit}
          qnh={qnh}
          onQnhChange={setQnh}
          oat={oat}
          onOatChange={setOat}
          margin={margin}
          onMarginChange={setMargin}
          fuelDensityKgL={density}
        />

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Peso total</p>
            <p className="num text-xl font-semibold text-foreground">
              {fmt(totalKg)} kg
              <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">
                {fmt(kgToLb(totalKg))} lb
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Salvando..." : isAuthenticated ? "Salvar cálculo" : "Entrar para salvar"}
          </button>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Fonte</p>
          <p className="mt-1 text-xs text-foreground">{aircraft.rfmLabel}</p>
          <div className="mt-2">
            <SourceBadge aircraft={aircraft} figure="Seção 2 — Limitações" />
          </div>
        </div>
      </div>

      <div>
        <BriefingResults
          aircraft={aircraft}
          totalWeightKg={totalKg}
          marginKg={marginKg}
          bundle={bundle}
          decision={decision}
          weightSteps={weightSteps}
        />
        <Disclaimer />
      </div>
    </div>
  );
}
