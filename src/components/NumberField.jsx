export default function NumberField({
  label,
  value,
  onChange,
  unit,
  hint,
  step = "any",
  placeholder,
}) {
  return (
    <label className="block">
      <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      <div className="mt-1.5 flex items-center rounded-xl border border-input bg-secondary/40 transition-colors focus-within:border-primary/60">
        <input
          type="number"
          inputMode="decimal"
          step={step}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="num w-full bg-transparent px-3 py-2.5 text-base text-foreground outline-none placeholder:text-muted-foreground/50"
        />
        {unit ? <span className="shrink-0 pr-3 text-[11px] text-muted-foreground">{unit}</span> : null}
      </div>
      {hint ? <span className="mt-1 block text-[10px] leading-snug text-muted-foreground/70">{hint}</span> : null}
    </label>
  );
}
