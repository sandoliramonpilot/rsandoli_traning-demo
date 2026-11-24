import { ChevronDown } from "lucide-react";

export default function MemorySteps({ steps, label = "Ver memória de cálculo" }) {
  if (!steps || steps.length === 0) return null;
  return (
    <details className="group mt-3 rounded-xl border border-border bg-background/50">
      <summary className="flex items-center justify-between gap-2 px-3 py-2 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground">
        {label}
        <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
      </summary>
      <ol className="space-y-1.5 border-t border-border px-3 py-2.5">
        {steps.map((step, index) => (
          <li key={index} className="num text-[11px] leading-relaxed text-foreground/80">
            {step}
          </li>
        ))}
      </ol>
    </details>
  );
}
