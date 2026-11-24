import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Layers } from "lucide-react";
import {
  MODULES,
  aircraftBase,
  getSelectedAircraft,
  labelFor,
  moduleIdFromStored,
} from "@/lib/aircraftModules";
import { fmt } from "@/lib/performance/format";

export default function ModuleSelector() {
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const stored = getSelectedAircraft();
    if (stored && moduleIdFromStored(stored)) setSelected(stored);
  }, []);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-60" />
        <div className="relative">
          <p className="eyebrow text-primary">Seleção de aeronave</p>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-[1.1] text-foreground sm:text-4xl">
            Performance com memória de cálculo e fonte oficial.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Escolha o módulo para abrir briefing, hover ceiling, subida e cruzeiro. Cada resultado traz a
            figura e a revisão do manual utilizada.
          </p>
        </div>
      </section>

      {selected ? (
        <Link
          to={aircraftBase(selected.aircraftId, selected.variantId)}
          className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
        >
          Continuar com {labelFor(selected.aircraftId, selected.variantId)}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        {MODULES.map((module) => (
          <article
            key={module.id}
            className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40 sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                  {module.manufacturer}
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-foreground">{module.name}</h2>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
                <Layers className="h-5 w-5" />
              </span>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-3 border-y border-border py-4">
              <div>
                <dt className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground">MTOW</dt>
                <dd className="num mt-1 text-base text-foreground">
                  {fmt(module.mtow)} <span className="text-[10px] text-muted-foreground">kg</span>
                </dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                  Altitude máxima
                </dt>
                <dd className="num mt-1 text-base text-foreground">
                  {module.variants
                    ? module.variants.map((variant) => fmt(variant.maxAltitude)).join(" / ")
                    : fmt(module.maxAltitude)}{" "}
                  <span className="text-[10px] text-muted-foreground">ft</span>
                </dd>
              </div>
            </dl>

            {module.variants ? (
              <ul className="mt-4 space-y-1.5">
                {module.variants.map((variant) => (
                  <li key={variant.id} className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-foreground">{variant.name}</span>
                    <span className="text-muted-foreground">{variant.engine}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            <p className="mt-4 text-[11px] text-muted-foreground">{module.revision}</p>

            <Link
              to={module.route}
              className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              {module.variants ? "Escolher modelo" : "Entrar"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
