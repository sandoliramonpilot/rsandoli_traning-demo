import MemorySteps from "@/components/MemorySteps";
import SourceBadge from "@/components/SourceBadge";
import StatusPill from "@/components/StatusPill";
import { fmt } from "@/lib/performance/format";
import { kgToLb } from "@/lib/performance/units";
import { cn } from "@/lib/utils";

const VERDICT_STYLES = {
  GO: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  "ATENÇÃO": "border-amber-400/40 bg-amber-400/10 text-amber-300",
  "NO-GO": "border-rose-400/40 bg-rose-400/10 text-rose-300",
};

export default function BriefingResults({
  aircraft,
  totalWeightKg,
  marginKg,
  bundle,
  decision,
  weightSteps,
}) {
  return (
    <div className="space-y-4">
      <div className={cn("rounded-2xl border p-5", VERDICT_STYLES[decision.verdict])}>
        <p className="text-[10px] font-medium uppercase tracking-[0.24em] opacity-80">
          Veredito do briefing
        </p>
        <p className="mt-1 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
          {decision.verdict}
        </p>
        {decision.reasons.length > 0 ? (
          <ul className="mt-3 space-y-1.5">
            {decision.reasons.map((reason, index) => (
              <li key={index} className="text-xs leading-relaxed">
                {reason}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs opacity-80">
            Todos os limites verificados dentro do envelope, com margem de {fmt(marginKg)} kg.
          </p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Peso total
          </p>
          <p className="num mt-2 text-3xl font-semibold text-foreground">
            {fmt(totalWeightKg)}
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">kg</span>
          </p>
          <p className="num mt-1 text-[11px] text-muted-foreground">
            {fmt(kgToLb(totalWeightKg))} lb · MTOW {fmt(aircraft.maxGrossWeightKg)} kg
          </p>
          <MemorySteps steps={weightSteps} label="Ver memória do peso" />
        </div>

        <div className="rounded-2xl border border-primary/40 bg-primary/[0.06] p-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Altitude de densidade
          </p>
          <p className="num mt-2 text-3xl font-semibold text-foreground">
            {fmt(bundle.densityAltitudeFt)}
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">ft</span>
          </p>
          <p className="num mt-1 text-[11px] text-muted-foreground">
            AP {fmt(bundle.pressureAltitudeFt)} ft · ΔT {bundle.isaDeviationC >= 0 ? "+" : "−"}
            {fmt(Math.abs(bundle.isaDeviationC), 1)} °C
          </p>
          <MemorySteps steps={bundle.steps.densityAltitude} />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">Checagem de limites</h3>
          <SourceBadge aircraft={aircraft} figure="Seção 2 — Limitações" />
        </div>
        <ul className="divide-y divide-border">
          {decision.checks.map((check) => (
            <li key={check.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground">{check.label}</p>
                <p className="num mt-0.5 text-[11px] text-muted-foreground">
                  {check.valueText} · limite {check.limitText}
                </p>
                <p className="mt-1 text-[11px] leading-snug text-muted-foreground/80">
                  {check.detail}
                </p>
              </div>
              <StatusPill status={check.status} />
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-foreground">VNE aplicável</h3>
          <SourceBadge
            aircraft={aircraft}
            figure={decision.vne.applicable ? "Fórmula de VNE" : "Placard Fig. 1-18"}
          />
        </div>
        {decision.vne.applicable ? (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Power-on</p>
              <p className="num mt-1 text-2xl font-semibold text-foreground">
                {fmt(decision.vne.powerOnKt)}
                <span className="ml-1 text-[11px] font-normal text-muted-foreground">kt</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Power-off</p>
              <p className="num mt-1 text-2xl font-semibold text-foreground">
                {fmt(decision.vne.powerOffKt)}
                <span className="ml-1 text-[11px] font-normal text-muted-foreground">kt</span>
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {aircraft.model}: VNE definida pelo placard (Fig. 1-18) — 152 KIAS até 3.000 ft,
            reduzindo com altitude e OAT.
          </p>
        )}
        <MemorySteps steps={decision.vne.memorySteps} label="Ver memória da VNE" />
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-foreground">Temperatura máxima na altitude</h3>
        </div>
        <p className="num mt-2 text-2xl font-semibold text-foreground">
          {fmt(decision.maxTemp.value, 1)}
          <span className="ml-1 text-[11px] font-normal text-muted-foreground">°C</span>
        </p>
        <MemorySteps steps={decision.maxTemp.memorySteps} label="Ver memória do limite" />
      </div>
    </div>
  );
}
