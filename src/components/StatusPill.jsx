import { cn } from "@/lib/utils";

const STYLES = {
  ok: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  atencao: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  excede: "border-rose-400/30 bg-rose-400/10 text-rose-300",
  info: "border-border bg-secondary text-muted-foreground",
};

const LABELS = {
  ok: "OK",
  atencao: "ATENÇÃO",
  excede: "EXCEDE",
  info: "INFO",
};

export default function StatusPill({ status = "info", label, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-[0.08em]",
        STYLES[status] || STYLES.info,
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label || LABELS[status] || status}
    </span>
  );
}
