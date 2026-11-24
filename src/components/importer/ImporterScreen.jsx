import { useEffect, useState } from "react";
import { Download, FileUp, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import CurveChart from "@/components/performance/CurveChart";
import ImportedTablesList from "@/components/importer/ImportedTablesList";
import { previewChart } from "@/components/performance/chartData";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { downloadDigitalizationWorkbook } from "@/lib/excel/digitalization";
import { detectDataModel, validatePerfTable } from "@/lib/performance/validatePerfTable";

export default function ImporterScreen() {
  const { user, isLoadingAuth } = useAuth();
  const [aircraftList, setAircraftList] = useState([]);
  const [selectedAircraftId, setSelectedAircraftId] = useState("");
  const [raw, setRaw] = useState("");
  const [payload, setPayload] = useState(null);
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    base44.entities.Aircraft.list("-created_date", 50)
      .then((items) => setAircraftList(items || []))
      .catch(() => setAircraftList([]));
  }, []);

  if (!isLoadingAuth && user?.role !== "admin") {
    return (
      <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-amber-200">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-4 w-4" />
          <div>
            <p className="text-sm font-semibold">Acesso restrito</p>
            <p className="mt-1 text-[11px]">
              O importador de curvas é exclusivo de administradores. Peça a um administrador do app para
              importar e validar as curvas.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleValidate = () => {
    setErrors([]);
    setPayload(null);
    if (!raw.trim()) {
      setErrors(["Cole o JSON ou selecione um arquivo antes de validar."]);
      return;
    }
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      setErrors([`JSON inválido: ${error.message}`]);
      return;
    }
    if (!parsed.dataModel) {
      const detected = detectDataModel(parsed);
      if (detected) {
        parsed.dataModel = detected;
        toast.info(`Modelo ${detected} detectado automaticamente`);
      }
    }
    if (!parsed.aircraftId && selectedAircraftId) parsed.aircraftId = selectedAircraftId;

    const result = validatePerfTable(parsed);
    setErrors(result.errors);
    if (result.valid) setPayload(parsed);
  };

  const handleSave = async () => {
    if (!payload) return;
    setSaving(true);
    try {
      await base44.entities.PerfTable.create({ ...payload, status: "pendente" });
      toast.success("Curva gravada com status pendente");
      setPayload(null);
      setRaw("");
      setRefreshKey((key) => key + 1);
    } catch (error) {
      toast.error("Não foi possível gravar a curva");
    } finally {
      setSaving(false);
    }
  };

  const chart = payload ? previewChart(payload) : null;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow text-primary">Administração</p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">Importador de curvas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Valide o JSON contra o schema antes de gravar. Toda curva entra como pendente.
          </p>
        </div>
        <button
          type="button"
          onClick={downloadDigitalizationWorkbook}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          <Download className="h-3.5 w-3.5" />
          Baixar planilha AW119 (10 abas)
        </button>
      </header>

      <section className="surface p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Aeronave (preenche aircraftId se ausente)
            </span>
            <select
              value={selectedAircraftId}
              onChange={(event) => setSelectedAircraftId(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-input bg-secondary/40 px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60"
            >
              <option value="">— manter o do JSON —</option>
              {aircraftList.map((aircraft) => (
                <option key={aircraft.id} value={aircraft.id}>
                  {aircraft.model} {aircraft.variant || ""}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Arquivo JSON
            </span>
            <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-input bg-secondary/40 px-3 py-2">
              <FileUp className="h-4 w-4 text-muted-foreground" />
              <input
                type="file"
                accept=".json,application/json"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  setRaw(await file.text());
                }}
                className="w-full text-[11px] text-muted-foreground file:mr-2 file:rounded-md file:border-0 file:bg-secondary file:px-2 file:py-1 file:text-[11px] file:text-foreground"
              />
            </div>
          </label>
        </div>

        <label className="mt-3 block">
          <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Ou cole o JSON da curva
          </span>
          <textarea
            value={raw}
            onChange={(event) => setRaw(event.target.value)}
            rows={9}
            spellCheck={false}
            placeholder='{"aircraftId":"...","chartType":"hover_ige_mcp","condition":"clean", ...}'
            className="num mt-1.5 w-full rounded-xl border border-input bg-background/60 px-3 py-2.5 text-[11px] leading-relaxed text-foreground outline-none focus:border-primary/60"
          />
        </label>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleValidate}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Validar
          </button>
          {payload ? (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-2.5 text-sm font-semibold text-emerald-200 transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "Gravando..." : "Confirmar e salvar"}
            </button>
          ) : null}
          {payload ? (
            <span className="text-[11px] text-emerald-300">
              Válido · modelo {payload.dataModel} · {payload.chartType}
            </span>
          ) : null}
        </div>

        {errors.length > 0 ? (
          <div className="mt-3 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3">
            <p className="text-[11px] font-semibold text-rose-200">
              {errors.length} erro(s) encontrado(s)
            </p>
            <ul className="mt-1.5 space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="num text-[11px] leading-relaxed text-rose-200/90">
                  {error}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {payload && chart ? (
          <div className="mt-4 rounded-xl border border-border bg-background/40 p-2">
            <p className="px-2 pb-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Preview da curva · {payload.sourceFigure} · {payload.sourceRevision}
            </p>
            <CurveChart series={chart.series} xLabel={chart.xLabel} yLabel={chart.yLabel} height={240} />
          </div>
        ) : null}
      </section>

      <ImportedTablesList aircraftList={aircraftList} refreshKey={refreshKey} />
    </div>
  );
}
