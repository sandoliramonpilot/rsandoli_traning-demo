import MemorySteps from "@/components/MemorySteps";
import { fmt, fmtSigned } from "@/lib/performance/format";
import { cn } from "@/lib/utils";

export default function AltitudeResultCard({
  label,
  value,
  unit,
  decimals = 0,
  steps,
  secondary,
  primary = false,
  alert = false,
  signed = false,
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        primary
          ? "border-primary/40 bg-primary/[0.06] sm:col-span-2"
          : "border-border bg-card",
        alert && "border-amber-400/40 bg-amber-400/[0.06]"
      )}
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "num mt-2 font-semibold text-foreground",
          primary ? "text-4xl sm:text-5xl" : "text-2xl"
        )}
      >
        {signed ? fmtSigned(value, decimals) : fmt(value, decimals)}
        <span className="ml-1.5 text-xs font-normal text-muted-foreground">{unit}</span>
      </p>
      {secondary ? (
        <p className="num mt-1 text-[11px] text-muted-foreground">{secondary}</p>
      ) : null}
      {alert ? (
        <p className="mt-2 text-[11px] leading-snug text-amber-300">
          Altitude densidade acima de 5.000 ft — atenção redobrada ao envelope de performance.
        </p>
      ) : null}
      <MemorySteps steps={steps} />
    </div>
  );
}
