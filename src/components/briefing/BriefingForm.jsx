import NumberField from "@/components/NumberField";
import Segmented from "@/components/Segmented";

export default function BriefingForm({
  emptyWeight,
  onEmptyWeightChange,
  crew,
  onCrewChange,
  pax,
  onPaxChange,
  baggage,
  onBaggageChange,
  fuel,
  onFuelChange,
  fuelUnit,
  onFuelUnitChange,
  elevation,
  onElevationChange,
  elevUnit,
  onElevUnitChange,
  qnh,
  onQnhChange,
  oat,
  onOatChange,
  margin,
  onMarginChange,
  fuelDensityKgL,
}) {
  return (
    <div className="surface p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-foreground">Carga e condições</h2>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <NumberField
          label="Peso vazio"
          unit="kg"
          value={emptyWeight}
          onChange={onEmptyWeightChange}
          hint="Pré-preenchido · editável em Configurações"
        />
        <NumberField label="Tripulação" unit="kg" value={crew} onChange={onCrewChange} />
        <NumberField label="Passageiros" unit="kg" value={pax} onChange={onPaxChange} />
        <NumberField label="Bagagem" unit="kg" value={baggage} onChange={onBaggageChange} />
        <NumberField
          label="Combustível"
          unit={fuelUnit}
          value={fuel}
          onChange={onFuelChange}
          hint={`Densidade ${fuelDensityKgL.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} kg/L`}
        />
        <div className="flex flex-col justify-end pb-2">
          <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Unidade do combustível
          </span>
          <Segmented
            ariaLabel="Unidade do combustível"
            value={fuelUnit}
            onChange={onFuelUnitChange}
            options={[
              { value: "L", label: "Litros" },
              { value: "kg", label: "kg" },
            ]}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-4">
        <NumberField label="Elevação" unit={elevUnit} value={elevation} onChange={onElevationChange} />
        <NumberField label="QNH" unit="hPa" value={qnh} onChange={onQnhChange} />
        <NumberField label="OAT" unit="°C" value={oat} onChange={onOatChange} />
        <NumberField
          label="Margem de segurança"
          unit="kg"
          value={margin}
          onChange={onMarginChange}
        />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Elevação em</span>
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
    </div>
  );
}
