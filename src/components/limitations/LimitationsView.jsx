import { useState } from "react";
import MemorySteps from "@/components/MemorySteps";
import NumberField from "@/components/NumberField";
import SourceBadge from "@/components/SourceBadge";
import { fmt, toNumber } from "@/lib/performance/format";
import { vneByFormula } from "@/lib/performance/limits";

export default function LimitationsView({ aircraft }) {
  const [altitude, setAltitude] = useState("5000");
  const [oat, setOat] = useState("20");
  const vne = vneByFormula(aircraft, toNumber(altitude), toNumber(oat));

  return (
    <div className="space-y-4">
      <section className="surface overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">VNE aplicável</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {aircraft.vneMode === "formula"
                ? "Cálculo dinâmico conforme altitude e OAT"
                : "Tabela do placard (Fig. 1-18)"}
            </p>
          </div>
          <SourceBadge
            aircraft={aircraft}
            figure={aircraft.vneMode === "formula" ? "Fórmula de VNE" : "Fig. 1-18"}
          />
        </div>

        {aircraft.vneMode === "formula" ? (
          <div className="p-4">
            <p className="num rounded-xl border border-border bg-secondary/40 px-3 py-2 text-[11px] leading-relaxed text-foreground/80">
              {aircraft.vneNote}
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <NumberField
                label="Altitude de pressão"
                unit="ft"
                value={altitude}
                onChange={setAltitude}
              />
              <NumberField label="OAT" unit="°C" value={oat} onChange={setOat} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-background/50 p-3">
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Power-on
                </p>
                <p className="num mt-1 text-2xl font-semibold text-foreground">
                  {fmt(vne.powerOnKt)}
                  <span className="ml-1 text-[11px] font-normal text-muted-foreground">kt</span>
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background/50 p-3">
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Power-off
                </p>
                <p className="num mt-1 text-2xl font-semibold text-foreground">
                  {fmt(vne.powerOffKt)}
                  <span className="ml-1 text-[11px] font-normal text-muted-foreground">kt</span>
                </p>
              </div>
            </div>
            {vne.outOfEnvelope ? (
              <p className="mt-2 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-[11px] text-amber-300">
                Fora do envelope do manual — curva não extrapolada.
              </p>
            ) : null}
            <MemorySteps steps={vne.memorySteps} />
          </div>
        ) : (
          <div className="p-4">
            <p className="text-[11px] leading-relaxed text-muted-foreground">{aircraft.vneNote}</p>
          </div>
        )}

        <div className="divide-y divide-border border-t border-border">
          {aircraft.vnePlacard.map((row) => (
            <div key={row.label} className="flex items-start justify-between gap-4 px-4 py-2.5">
              <div>
                <p className="text-xs text-foreground">{row.label}</p>
                {row.note ? (
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{row.note}</p>
                ) : null}
              </div>
              <p className="num shrink-0 text-right text-xs font-medium text-foreground">
                {row.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {aircraft.limitationGroups.map((group) => (
        <section key={group.title} className="surface overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold text-foreground">{group.title}</h2>
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              {group.reference}
            </p>
          </div>
          <div className="divide-y divide-border">
            {group.rows.map((row) => (
              <div key={row.label} className="flex items-start justify-between gap-4 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="text-xs text-foreground">{row.label}</p>
                  {row.note ? (
                    <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">
                      {row.note}
                    </p>
                  ) : null}
                </div>
                <p className="num shrink-0 text-right text-xs font-medium text-foreground">
                  {row.value}
                </p>
              </div>
            ))}
          </div>
        </section>
      ))}

      <p className="rounded-xl border border-border bg-secondary/30 px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
        {aircraft.rfmLabel} · {aircraft.rfmDocument} · {aircraft.rfmRevision}. Valores transcritos do
        manual; em caso de divergência, prevalece o RFM aprovado.
      </p>
    </div>
  );
}
