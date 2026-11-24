import { useEffect, useState } from "react";
import { Check, Filter } from "lucide-react";
import { toast } from "sonner";
import StatusPill from "@/components/StatusPill";
import { base44 } from "@/api/base44Client";
import { CHART_TYPES } from "@/lib/performance/validatePerfTable";
import { conditionLabel } from "@/lib/performance/conditions";

export default function ImportedTablesList({ aircraftList, refreshKey }) {
  const [chartType, setChartType] = useState("");
  const [status, setStatus] = useState("");
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const query = {};
    if (chartType) query.chartType = chartType;
    if (status) query.status = status;

    base44.entities.PerfTable.filter(query, { limit: 100, sort: "-created_date" })
      .then((page) => {
        if (alive) setTables(page?.items || []);
      })
      .catch(() => {
        if (alive) setTables([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [chartType, status, refreshKey, tick]);

  const aircraftLabel = (id) => {
    const record = (aircraftList || []).find((entry) => entry.id === id);
    return record ? `${record.model} ${record.variant || ""}`.trim() : "aeronave";
  };

  const handleValidate = async (table) => {
    setBusyId(table.id);
    try {
      await base44.entities.PerfTable.update(table.id, { status: "validado" });
      toast.success("Curva marcada como validada");
      setTick((value) => value + 1);
    } catch (error) {
      toast.error("Não foi possível validar a curva");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Curvas importadas</h2>
          <p className="text-[11px] text-muted-foreground">
            Confira contra o PDF do RFM e marque como validada para liberar o cálculo.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={chartType}
            onChange={(event) => setChartType(event.target.value)}
            className="rounded-lg border border-input bg-secondary/40 px-2.5 py-1.5 text-[11px] text-foreground outline-none focus:border-primary/60"
          >
            <option value="">Todos os tipos</option>
            {CHART_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-lg border border-input bg-secondary/40 px-2.5 py-1.5 text-[11px] text-foreground outline-none focus:border-primary/60"
          >
            <option value="">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="validado">Validado</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="h-32 animate-pulse rounded-2xl border border-border bg-card/60" />
      ) : tables.length === 0 ? (
        <p className="rounded-2xl border border-border bg-card px-4 py-6 text-center text-[11px] text-muted-foreground">
          Nenhuma curva importada com esses filtros.
        </p>
      ) : (
        <div className="surface divide-y divide-border overflow-hidden">
          {tables.map((table) => (
            <div key={table.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="num text-xs font-medium text-foreground">{table.chartType}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {aircraftLabel(table.aircraftId)} · {conditionLabel(table.condition || "clean")} · modelo{" "}
                  {table.dataModel || "—"} · {table.sourceFigure} · {table.sourceRevision}
                  {table.grossWeightKg ? ` · ${table.grossWeightKg} kg` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <StatusPill
                  status={table.status === "validado" ? "ok" : "atencao"}
                  label={table.status === "validado" ? "VALIDADO" : "PENDENTE"}
                />
                {table.status !== "validado" ? (
                  <button
                    type="button"
                    onClick={() => handleValidate(table)}
                    disabled={busyId === table.id}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-2.5 py-1.5 text-[11px] font-medium text-emerald-200 transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Marcar como validado
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
