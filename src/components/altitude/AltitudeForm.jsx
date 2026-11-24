import NumberField from "@/components/NumberField";
import Segmented from "@/components/Segmented";

const UNIT_CAPTION = "text-[10px] uppercase tracking-[0.14em] text-muted-foreground";

export default function AltitudeForm({
  mode,
  onModeChange,
  elevation,
  onElevationChange,
  elevUnit,
  onElevUnitChange,
  qnh,
  onQnhChange,
  qnhUnit,
  onQnhUnitChange,
  oat,
  onOatChange,
  tempUnit,
  onTempUnitChange,
  pressureAltitude,
  onPressureAltitudeChange,
}) {
  return (
    <div className="surface p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-foreground">Entradas</h2>
        <Segmented
          ariaLabel="Modo de entrada"
          value={mode}
          onChange={onModeChange}
          options={[
            { value: "elevation", label: "Elevação + QNH" },
            { value: "pressure", label: "Altitude de pressão" },
          ]}
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {mode === "elevation" ? (
          <>
            <NumberField
              label="Elevação"
              unit={elevUnit}
              value={elevation}
              onChange={onElevationChange}
            />
            <NumberField label="QNH" unit={qnhUnit} value={qnh} onChange={onQnhChange} />
          </>
        ) : (
          <NumberField
            label="Altitude de pressão"
            unit="ft"
            value={pressureAltitude}
            onChange={onPressureAltitudeChange}
            hint="QNH não é usado neste modo."
          />
        )}
        <NumberField
          label="OAT"
          unit={tempUnit === "C" ? "°C" : "°F"}
          value={oat}
          onChange={onOatChange}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-3">
        <div className="flex items-center gap-2">
          <span className={UNIT_CAPTION}>Elevação</span>
          <Segmented
            ariaLabel="Unidade de elevação"
            value={elevUnit}
            onChange={onElevUnitChange}
            options={[
              { value: "ft", label: "ft" },
              { value: "m", label: "m" },
            ]}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className={UNIT_CAPTION}>QNH</span>
          <Segmented
            ariaLabel="Unidade de QNH"
            value={qnhUnit}
            onChange={onQnhUnitChange}
            options={[
              { value: "hPa", label: "hPa" },
              { value: "inHg", label: "inHg" },
            ]}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className={UNIT_CAPTION}>OAT</span>
          <Segmented
            ariaLabel="Unidade de temperatura"
            value={tempUnit}
            onChange={onTempUnitChange}
            options={[
              { value: "C", label: "°C" },
              { value: "F", label: "°F" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
