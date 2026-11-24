import { useEffect, useState } from "react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import NumberField from "@/components/NumberField";
import Segmented from "@/components/Segmented";
import { AIRCRAFT_SPECS } from "@/lib/performance/aircraftSpecs";
import { toNumber } from "@/lib/performance/format";
import { useSettings } from "@/lib/settings";
import { useAircraftRecords } from "@/lib/useAircraft";

export default function SettingsPanel() {
  const { settings, save } = useSettings();
  const { records, loaded } = useAircraftRecords();

  const [units, setUnits] = useState(settings.units);
  const [qnhUnit, setQnhUnit] = useState(settings.qnhUnit);
  const [margin, setMargin] = useState(String(settings.defaultSafetyMarginKg ?? 0));
  const [drafts, setDrafts] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setUnits(settings.units);
    setQnhUnit(settings.qnhUnit);
    setMargin(String(settings.defaultSafetyMarginKg ?? 0));
  }, [settings.units, settings.qnhUnit, settings.defaultSafetyMarginKg]);

  useEffect(() => {
    if (!loaded) return;
    const next = {};
    AIRCRAFT_SPECS.forEach((spec) => {
      const record = records.find((entry) => entry.slug === spec.slug);
      next[spec.slug] = {
        id: record?.id,
        emptyWeightKg: String(record?.emptyWeightKg ?? spec.emptyWeightKg ?? ""),
        fuelDensityKgL: String(record?.fuelDensityKgL ?? spec.fuelDensityKgL ?? ""),
      };
    });
    setDrafts(next);
  }, [loaded, records]);

  const updateDraft = (slug, field, value) => {
    setDrafts((prev) => ({ ...prev, [slug]: { ...prev[slug], [field]: value } }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await save({
        units,
        qnhUnit,
        defaultSafetyMarginKg: toNumber(margin),
      });
      await Promise.all(
        AIRCRAFT_SPECS.map((spec) => {
          const draft = drafts[spec.slug];
          if (!draft?.id) return null;
          return base44.entities.Aircraft.update(draft.id, {
            emptyWeightKg: toNumber(draft.emptyWeightKg),
            fuelDensityKgL: toNumber(draft.fuelDensityKgL),
          });
        })
      );
      toast.success("Configurações salvas");
    } catch (error) {
      toast.error("Não foi possível salvar as configurações");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="surface p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-foreground">Preferências</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Unidades</p>
            <div className="mt-1.5">
              <Segmented
                ariaLabel="Unidades"
                value={units}
                onChange={setUnits}
                options={[
                  { value: "metric", label: "Métrico" },
                  { value: "imperial", label: "Imperial" },
                ]}
              />
            </div>
            <p className="mt-1.5 text-[10px] text-muted-foreground/70">
              Métrico: kg e °C · Imperial: lb e °F. Altitudes sempre em ft.
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">QNH</p>
            <div className="mt-1.5">
              <Segmented
                ariaLabel="Unidade de QNH"
                value={qnhUnit}
                onChange={setQnhUnit}
                options={[
                  { value: "hPa", label: "hPa" },
                  { value: "inHg", label: "inHg" },
                ]}
              />
            </div>
          </div>
          <div className="sm:max-w-xs">
            <NumberField
              label="Margem de segurança padrão"
              unit="kg"
              value={margin}
              onChange={setMargin}
              hint="Aplicada no briefing como reserva abaixo do MTOW."
            />
          </div>
        </div>
      </section>

      <section className="surface overflow-hidden">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">Aeronaves</h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Peso vazio básico típico — ajuste conforme a pesagem do seu manual.
          </p>
        </div>
        <div className="divide-y divide-border">
          {AIRCRAFT_SPECS.map((spec) => {
            const draft = drafts[spec.slug] || {};
            return (
              <div key={spec.slug} className="px-4 py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{spec.model}</p>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {spec.rfmDocument} · {spec.rfmRevision}
                  </p>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <NumberField
                    label="Peso vazio"
                    unit="kg"
                    value={draft.emptyWeightKg ?? ""}
                    onChange={(value) => updateDraft(spec.slug, "emptyWeightKg", value)}
                  />
                  <NumberField
                    label="Densidade do combustível"
                    unit="kg/L"
                    step="0.01"
                    value={draft.fuelDensityKgL ?? ""}
                    onChange={(value) => updateDraft(spec.slug, "fuelDensityKgL", value)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Salvando..." : "Salvar configurações"}
        </button>
      </div>
    </div>
  );
}
