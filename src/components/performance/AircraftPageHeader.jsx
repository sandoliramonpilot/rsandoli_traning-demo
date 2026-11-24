import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import SourceBadge from "@/components/SourceBadge";

export default function AircraftPageHeader({
  eyebrow,
  title,
  subtitle,
  aircraft,
  figure,
  backTo,
  backLabel = "Trocar aeronave",
  children,
}) {
  return (
    <header className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow text-primary">{eyebrow}</p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <SourceBadge aircraft={aircraft} figure={figure} />
          {backTo ? (
            <Link
              to={backTo}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {backLabel}
            </Link>
          ) : null}
        </div>
      </div>
      {children}
    </header>
  );
}
