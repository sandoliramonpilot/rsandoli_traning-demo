import { useState } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import StatusPill from "@/components/StatusPill";
import { fmt } from "@/lib/performance/format";
import { cn } from "@/lib/utils";

const OUTPUT_LABELS = {
  totalWeightKg: ["Peso total", "kg"],
  totalWeightLb: ["Peso total", "lb"],
  pressureAltitudeFt: ["Altitude de pressão", "ft"],
  densityAltitudeFt: ["Altitude de densidade", "ft"],
  indicatedAltitudeFt: ["Altitude indicada", "ft"],
  trueAltitudeFt: ["Altitude verdadeira", "ft"],
  isaC: ["ISA", "°C"],
  isaDeviationC: ["Desvio ISA", "°C"],
  verdict: ["Veredito", ""],
  vnePowerOnKt: ["VNE power-on", "kt"],
  vnePowerOffKt: ["VNE power-off", "kt"],
  hoverWeightKg: ["Peso de pairado", "kg"],
  hoverIgeCeilingFt: ["Teto IGE", "ft"],
  hoverOgeCeilingFt: ["Teto OGE", "ft"],
  hoverIgeMarginFt: ["Margem IGE", "ft"],
  hoverOgeMarginFt: ["Margem OGE", "ft"],
  hoverMaxWeightKg: ["Peso máximo de pairado", "kg"],
  hoverMaxWeightLb: ["Peso máximo de pairado", "lb"],
  hoverMarginKg: ["Margem de peso", "kg"],
  rocFtMin: ["ROC", "ft/min"],
  rocTimeMin: ["Tempo para 1.000 ft", "min"],
  rocGradientPct: ["Gradiente a Vy", "%"],
  cruiseTasKt: ["TAS", "kt"],
  cruiseIasKt: ["IAS", "kt"],
  cruiseTorquePct: ["Torque", "%"],
  cruiseFuelKgH: ["Consumo", "kg/h"],
  enduranceH: ["Autonomia", "h"],
  rangeNm: ["Alcance", "nm"],
};

const STATUS_LABELS = { ok: "OK", limite: "LIMITE", excede: "EXCEDE" };

const TYPE_LABELS = {
  briefing: "Briefing",
  altitude: "Altitude",
  hover: "Hover ceiling",
  roc: "Subida (ROC)",
  cruise: "Cruzeiro",
};

function flatten(value, out = []) {
  if (value === null || value === undefined) return out;
  if (Array.isArray(value)) {
    value.forEach((entry) => flatten(entry, out));
    return out;
  }
  if (typeof value === "object") {
    Object.values(value).forEach((entry) => flatten(entry, out));
    return out;
  }
  out.push(String(value));
  return out;
}

export default function HistoryItem({ item, onDelete }) {
  const [open, setOpen] = useState(false);
  const steps = flatten(item.memorySteps);
  const outputs = Object.entries(item.outputs || {}).filter(([key]) => OUTPUT_LABELS[key]);
  const date = item.created_date || item.createdAt;
  const dateLabel = date
    ? new Date(date).toLocaleString("pt-BR", {
        timeZone: "UTC",
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {TYPE_LABELS[item.type] || "Cálculo"} · {item.aircraftLabel || "aeronave"}
          </p>
          <p className="num mt-0.5 text-[10px] text-muted-foreground">
            {TYPE_LABELS[item.type] || "Altitude"} · {dateLabel} UTC
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <StatusPill status={item.status} label={STATUS_LABELS[item.status]} />
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        </div>
      </button>

      {open ? (
        <div className="border-t border-border px-4 py-3">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {outputs.map(([key, value]) => {
              const [label, unit] = OUTPUT_LABELS[key];
              const display =
                typeof value === "number"
                  ? fmt(value, Number.isInteger(value) ? 0 : 1)
                  : String(value);
              return (
                <div key={key}>
                  <dt className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="num mt-0.5 text-xs text-foreground">
                    {display} {unit}
                  </dd>
                </div>
              );
            })}
          </dl>

          {steps.length > 0 ? (
            <>
              <p className="mt-4 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Memória de cálculo (snapshot)
              </p>
              <ol className="mt-1.5 space-y-1">
                {steps.map((step, index) => (
                  <li key={index} className="num text-[11px] leading-relaxed text-foreground/80">
                    {step}
                  </li>
                ))}
              </ol>
            </>
          ) : null}

          {onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-rose-300 transition-colors hover:text-rose-200"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Excluir cálculo
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
