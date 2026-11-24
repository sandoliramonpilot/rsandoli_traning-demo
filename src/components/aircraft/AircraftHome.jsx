import { ClipboardCheck, Gauge, History as HistoryIcon, ListChecks, TrendingUp, Wind } from "lucide-react";
import { Link } from "@tanstack/react-router";
import QuickAction from "@/components/QuickAction";
import RecentHistory from "@/components/history/RecentHistory";
import { labelFor, saveSelectedAircraft, screenPath } from "@/lib/aircraftModules";
import { useEffect } from "react";

export default function AircraftHome({ moduleId, variantId }) {
  const label = labelFor(moduleId, variantId);

  useEffect(() => {
    saveSelectedAircraft(moduleId, variantId);
  }, [moduleId, variantId]);

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow text-primary">Módulo</p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">{label}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Briefing, hover, subida e cruzeiro com memória de cálculo.
          </p>
        </div>
        <Link
          to={moduleId === "h125" && variantId ? "/h125" : "/"}
          className="rounded-lg border border-border px-3 py-2 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          Trocar aeronave
        </Link>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <QuickAction
          to={screenPath(moduleId, variantId, "briefing")}
          icon={ClipboardCheck}
          title="Briefing de voo"
          description="Peso, limites e veredito GO / ATENÇÃO / NO-GO."
        />
        <QuickAction
          to={screenPath(moduleId, variantId, "hover")}
          icon={Wind}
          title="Hover ceiling"
          description="Peso máximo de pairado IGE/OGE por PA e OAT."
        />
        <QuickAction
          to={screenPath(moduleId, variantId, "roc")}
          icon={TrendingUp}
          title="Subida (ROC)"
          description="Razão de subida, tempo para 1.000 ft e gradiente."
        />
        <QuickAction
          to={screenPath(moduleId, variantId, "cruzeiro")}
          icon={Gauge}
          title="Cruzeiro e autonomia"
          description="TAS, IAS, torque, consumo, autonomia e alcance."
        />
        <QuickAction
          to={screenPath(moduleId, variantId, "limitacoes")}
          icon={ListChecks}
          title="Limitações"
          description="VNE, pesos, rampa, motor, rotor e combustível."
        />
        <QuickAction
          to="/historico"
          icon={HistoryIcon}
          title="Histórico"
          description="Cálculos salvos com a memória de cálculo."
        />
      </div>

      <section>
        <div className="mb-3 flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-semibold text-foreground">Histórico recente</h2>
          <Link to="/historico" className="text-xs font-medium text-primary hover:underline">
            Ver tudo
          </Link>
        </div>
        <RecentHistory />
      </section>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Ferramenta de apoio a instrução. Não substitui o RFM aprovado nem o julgamento do piloto.
      </p>
    </div>
  );
}
