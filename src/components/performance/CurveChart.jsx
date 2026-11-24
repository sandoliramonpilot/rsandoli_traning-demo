import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fmt } from "@/lib/performance/format";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

// Plota as curvas importadas e o ponto operacional. Nenhum ponto é inventado:
// lacunas entre curvas aparecem como lacunas.
export default function CurveChart({ series = [], point, xLabel, yLabel, height = 260 }) {
  const merged = new Map();
  series.forEach((entry) => {
    (entry.points || []).forEach((p) => {
      if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) return;
      if (!merged.has(p.x)) merged.set(p.x, { x: p.x });
      merged.get(p.x)[entry.label] = p.y;
    });
  });
  const data = [...merged.values()].sort((a, b) => a.x - b.x);

  if (data.length < 2) {
    return (
      <p className="rounded-xl border border-border bg-background/40 px-3 py-6 text-center text-[11px] text-muted-foreground">
        Curva sem pontos suficientes para plotar.
      </p>
    );
  }

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
          <XAxis
            dataKey="x"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickFormatter={(value) => fmt(value)}
            label={{
              value: xLabel,
              position: "insideBottomRight",
              offset: -4,
              fontSize: 9,
              fill: "hsl(var(--muted-foreground))",
            }}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickFormatter={(value) => fmt(value)}
            width={52}
            label={{
              value: yLabel,
              angle: -90,
              position: "insideLeft",
              fontSize: 9,
              fill: "hsl(var(--muted-foreground))",
            }}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 12,
              fontSize: 11,
            }}
            labelFormatter={(value) => `${xLabel}: ${fmt(value, 1)}`}
            formatter={(value, name) => [fmt(value, 1), name]}
          />
          {series.map((entry, index) => (
            <Line
              key={entry.label}
              type="linear"
              dataKey={entry.label}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={1.75}
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
            />
          ))}
          {point && Number.isFinite(point.x) && Number.isFinite(point.y) ? (
            <ReferenceDot
              x={point.x}
              y={point.y}
              r={5}
              fill="hsl(var(--primary))"
              stroke="hsl(var(--background))"
              strokeWidth={2}
            />
          ) : null}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
