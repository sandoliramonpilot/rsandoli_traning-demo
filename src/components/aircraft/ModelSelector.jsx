import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getModule } from "@/lib/aircraftModules";
import { fmt } from "@/lib/performance/format";

export default function ModelSelector({ moduleId = "h125" }) {
  const module = getModule(moduleId);
  if (!module?.variants) return null;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Trocar módulo
        </Link>
        <p className="eyebrow text-primary">{module.manufacturer}</p>
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">{module.name}</h1>
        <p className="text-sm text-muted-foreground">Selecione o modelo para abrir as telas de performance.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        {module.variants.map((variant) => (
          <article
            key={variant.id}
            className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40 sm:p-6"
          >
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                {module.name}
              </p>
              <h2 className="mt-1 text-xl font-semibold text-foreground">{variant.name}</h2>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 border-y border-border py-4">
              <div>
                <dt className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground">Motor</dt>
                <dd className="mt-1 text-sm text-foreground">{variant.engine}</dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground">MTOW</dt>
                <dd className="num mt-1 text-sm text-foreground">
                  {fmt(variant.mtow)} <span className="text-[10px] text-muted-foreground">kg</span>
                  {variant.mtowWithSup28 ? (
                    <span className="block text-[10px] text-muted-foreground">
                      {fmt(variant.mtowWithSup28)} kg com SUP.28
                    </span>
                  ) : null}
                </dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                  Altitude máxima
                </dt>
                <dd className="num mt-1 text-sm text-foreground">
                  {fmt(variant.maxAltitude)} <span className="text-[10px] text-muted-foreground">ft</span>
                </dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground">Rotor</dt>
                <dd className="num mt-1 text-sm text-foreground">
                  {variant.rotorRpm} <span className="text-[10px] text-muted-foreground">rpm</span>
                </dd>
              </div>
            </dl>

            <p className="mt-4 text-[11px] text-muted-foreground">{variant.revision}</p>

            <Link
              to={variant.route}
              className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Entrar
              <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
