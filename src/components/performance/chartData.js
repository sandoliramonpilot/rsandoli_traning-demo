// Converte as curvas importadas em séries para o gráfico, sem interpolar nada.

function numericPoints(points, xKey, yKey) {
  return (points || [])
    .map((point) => ({ x: Number(point?.[xKey]), y: Number(point?.[yKey]) }))
    .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
}

export function hoverChart(table, result, oatC) {
  if (!table?.data) {
    return { series: [], point: null, xLabel: "OAT (°C)", yLabel: "Peso máximo (kg)" };
  }
  if ((table.dataModel || "") === "B" && result?.correctedWeightKg != null) {
    const chart = result.chart || table.data.charts?.[0];
    const series = (chart?.curves || []).map((curve) => ({
      label: curve.label,
      points: numericPoints(curve.points, "correctedWeightKg", "maxWeightKg"),
    }));
    return {
      series,
      point: { x: result.correctedWeightKg, y: result.maxWeightKg },
      xLabel: "Peso corrigido (kg)",
      yLabel: "Peso máximo (kg)",
    };
  }
  const series = (table.data.curves || []).map((curve) => ({
    label: `${curve.pressureAltitudeFt ?? curve.label} ft`,
    points: numericPoints(curve.points, "oatC", "maxWeightKg"),
  }));
  return {
    series,
    point: result?.available ? { x: Number(oatC), y: result.maxWeightKg } : null,
    xLabel: "OAT (°C)",
    yLabel: "Peso máximo (kg)",
  };
}

export function rocChart(table, result, oatC) {
  if (!table?.data) {
    return { series: [], point: null, xLabel: "OAT (°C)", yLabel: "ROC (ft/min)" };
  }
  if ((table.dataModel || "") === "B" && result?.correctedWeightKg != null) {
    const chart = result.chart || table.data.charts?.[0];
    return {
      series: (chart?.curves || []).map((curve) => ({
        label: curve.label,
        points: numericPoints(curve.points, "correctedWeightKg", "rocFtMin"),
      })),
      point: { x: result.correctedWeightKg, y: result.rocFtMin },
      xLabel: "Peso corrigido (kg)",
      yLabel: "ROC (ft/min)",
    };
  }
  return {
    series: (table.data.curves || []).map((curve) => ({
      label: `${curve.pressureAltitudeFt ?? curve.label} ft`,
      points: numericPoints(curve.points, "oatC", "rocFtMin"),
    })),
    point: result?.available ? { x: Number(oatC), y: result.rocFtMin } : null,
    xLabel: "OAT (°C)",
    yLabel: "ROC (ft/min)",
  };
}

export function cruiseChart(table, result) {
  const chart = table?.data;
  if (!chart) {
    return { series: [], point: null, xLabel: "TAS (kt)", yLabel: "Torque (%)" };
  }
  return {
    series: (chart.curves || []).map((curve) => ({
      label: `${curve.grossWeightKg ?? curve.label} kg`,
      points: numericPoints(curve.points, "trueAirspeedKt", "torquePct"),
    })),
    point: result?.available ? { x: result.trueAirspeedKt, y: result.torquePct } : null,
    xLabel: "TAS (kt)",
    yLabel: "Torque (%)",
  };
}

// Série genérica para o preview do importador (modelo A ou B).
export function previewChart(payload) {
  const data = payload?.data || {};
  const kind = String(payload?.chartType || "").startsWith("roc") ? "roc" : "weight";
  const yKey = kind === "roc" ? "rocFtMin" : "maxWeightKg";

  if (payload?.dataModel === "B" && Array.isArray(data.charts)) {
    const chart = data.charts[0];
    return {
      series: (chart?.curves || []).map((curve) => ({
        label: curve.label,
        points: numericPoints(curve.points, "correctedWeightKg", yKey),
      })),
      xLabel: "Peso corrigido (kg)",
      yLabel: kind === "roc" ? "ROC (ft/min)" : "Peso máximo (kg)",
    };
  }

  return {
    series: (data.curves || []).map((curve) => ({
      label: `${curve.pressureAltitudeFt ?? curve.label} ft`,
      points: numericPoints(curve.points, "oatC", yKey),
    })),
    xLabel: "OAT (°C)",
    yLabel: kind === "roc" ? "ROC (ft/min)" : "Peso máximo (kg)",
  };
}
