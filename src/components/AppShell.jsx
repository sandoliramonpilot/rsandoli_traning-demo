import { Link, useRouterState } from "@tanstack/react-router";
import {
  ClipboardCheck,
  Gauge,
  History as HistoryIcon,
  ListChecks,
  Settings,
  TrendingUp,
  Upload,
  Wind,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import { aircraftFromPath, screenPath } from "@/lib/aircraftModules";

const AIRCRAFT_NAV = [
  { screen: "briefing", label: "Briefing", icon: ClipboardCheck },
  { screen: "hover", label: "Hover", icon: Wind },
  { screen: "roc", label: "Subida", icon: TrendingUp },
  { screen: "cruzeiro", label: "Cruzeiro", icon: Gauge },
  { screen: "limitacoes", label: "Limites", icon: ListChecks },
];

const MOBILE_SCREENS = ["briefing", "hover", "roc", "cruzeiro"];

export default function AppShell({ children }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { user } = useAuth();
  const context = aircraftFromPath(pathname);
  const isAdmin = user?.role === "admin";

  const isActive = (path) => (path === "/" ? pathname === "/" : pathname === path);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-primary/40 bg-primary/10">
              <span className="font-heading text-sm font-bold text-primary">H</span>
            </span>
            <span className="leading-tight">
              <span className="block font-heading text-sm font-semibold tracking-[0.14em] text-foreground">
                HELIPERF
              </span>
              <span className="block text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Performance &amp; Limitações
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {context ? (
              <>
                <Link
                  to={context.base}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive(context.base)
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  Início
                </Link>
                {AIRCRAFT_NAV.map((item) => {
                  const path = screenPath(context.moduleId, context.variantId, item.screen);
                  return (
                    <Link
                      key={item.screen}
                      to={path}
                      className={cn(
                        "rounded-lg px-3 py-2 text-sm transition-colors",
                        isActive(path)
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </>
            ) : null}
            <Link
              to="/calculadora"
              className={cn(
                "rounded-lg px-3 py-2 text-sm transition-colors",
                isActive("/calculadora")
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              Altitude
            </Link>
          </nav>

          <div className="flex items-center gap-1">
            {isAdmin ? (
              <Link
                to="/importador"
                aria-label="Importador de curvas"
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                  isActive("/importador")
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Upload className="h-[18px] w-[18px]" />
              </Link>
            ) : null}
            <Link
              to="/historico"
              aria-label="Histórico"
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                isActive("/historico")
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <HistoryIcon className="h-[18px] w-[18px]" />
            </Link>
            <Link
              to="/configuracoes"
              aria-label="Configurações"
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                isActive("/configuracoes")
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Settings className="h-[18px] w-[18px]" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 sm:px-6 lg:pb-12">{children}</main>

      <footer className="border-t border-border bg-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Ferramenta de apoio a instrução. Não substitui o RFM aprovado nem o julgamento do piloto.
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground/70">
            Fontes: AW119 MKII RFM 109G0040A033 Rev. 22 · AS350 B2 EASA.R.008 RN6 · AS350 B3e EASA.R.008 RN17
          </p>
        </div>
      </footer>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur lg:hidden">
        <div className={cn("mx-auto grid max-w-lg", context ? "grid-cols-5" : "grid-cols-3")}>
          {context
            ? [{ screen: null, label: "Início", icon: Gauge }, ...AIRCRAFT_NAV.filter((item) => MOBILE_SCREENS.includes(item.screen))].map(
                (item) => {
                  const Icon = item.icon;
                  const path = item.screen
                    ? screenPath(context.moduleId, context.variantId, item.screen)
                    : context.base;
                  return (
                    <Link
                      key={item.label}
                      to={path}
                      className={cn(
                        "flex flex-col items-center gap-1 px-1 py-2.5 text-[10px] transition-colors",
                        isActive(path) ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                      {item.label}
                    </Link>
                  );
                }
              )
            : [
                { to: "/", label: "Módulos", icon: Gauge },
                { to: "/calculadora", label: "Altitude", icon: Gauge },
                { to: "/historico", label: "Histórico", icon: HistoryIcon },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex flex-col items-center gap-1 px-1 py-2.5 text-[10px] transition-colors",
                      isActive(item.to) ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    {item.label}
                  </Link>
                );
              })}
        </div>
      </nav>
    </div>
  );
}
