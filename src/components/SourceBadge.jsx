export default function SourceBadge({ aircraft, figure }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
      <span className="rounded border border-border bg-secondary px-1.5 py-0.5 uppercase tracking-[0.14em]">
        {aircraft.rfmDocument}
      </span>
      <span>{aircraft.rfmRevision}</span>
      {figure ? (
        <>
          <span className="text-border">/</span>
          <span>{figure}</span>
        </>
      ) : null}
    </div>
  );
}
