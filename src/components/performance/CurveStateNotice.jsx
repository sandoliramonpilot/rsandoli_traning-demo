import { Link } from "@tanstack/react-router";
import { AlertTriangle, FileQuestion, Upload } from "lucide-react";

const TONES = {
  pendente: {
    wrapper: "border-amber-400/30 bg-amber-400/10 text-amber-200",
    icon: AlertTriangle,
  },
  ausente: {
    wrapper: "border-border bg-card text-muted-foreground",
    icon: FileQuestion,
  },
  erro: {
    wrapper: "border-rose-400/30 bg-rose-400/10 text-rose-200",
    icon: AlertTriangle,
  },
};

export default function CurveStateNotice({ tone = "ausente", title, description, showImport = true }) {
  const style = TONES[tone] || TONES.ausente;
  const Icon = style.icon;

  return (
    <div className={`rounded-2xl border p-4 ${style.wrapper}`}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          {description ? <p className="mt-1 text-[11px] leading-relaxed opacity-90">{description}</p> : null}
          {showImport ? (
            <Link
              to="/importador"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-current/30 px-2.5 py-1.5 text-[11px] font-medium"
            >
              <Upload className="h-3.5 w-3.5" />
              Abrir importador de curvas
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
