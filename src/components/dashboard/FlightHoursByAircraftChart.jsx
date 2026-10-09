import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Plane, ChevronRight } from "lucide-react";

function fmtHours(min) {
  if (!min) return "0h";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h${m.toString().padStart(2, "0")}` : `${h}h`;
}

export default function FlightHoursByAircraftChart() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    base44.entities.FlightLog.aggregate({
      groupBy: "aircraft_registration",
      sum: "flight_time_minutes",
      sort: "-sum_flight_time_minutes",
      limit: 12,
    })
      .then((res) => {
        if (!alive) return;
        const rows = (res.rows || [])
          .filter((r) => r.aircraft_registration)
          .map((r) => ({
            name: r.aircraft_registration,
            minutes: r.sum_flight_time_minutes || 0,
          }));
        setData(rows);
      })
      .catch(() => alive && setData([]));
    return () => { alive = false; };
  }, []);

  if (data === null) {
    return (
      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/60">
          <h2 className="font-semibold text-slate-100">Horas de voo por aeronave</h2>
          <p className="text-xs text-slate-500 mt-0.5">Distribuição das suas horas registradas</p>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="w-7 h-7 border-4 border-slate-700 border-t-amber-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const totalMinutes = data.reduce((s, d) => s + d.minutes, 0);

  return (
    <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/60">
        <div>
          <h2 className="font-semibold text-slate-100">Horas de voo por aeronave</h2>
          <p className="text-xs text-slate-500 mt-0.5">Distribuição das suas horas registradas</p>
        </div>
        <Link to="/flight-log" className="text-xs font-medium text-amber-400 hover:text-amber-300 inline-flex items-center gap-1">
          Diário de bordo <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="px-6 py-5">
        {data.length === 0 ? (
          <div className="h-56 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Plane className="w-6 h-6 text-amber-400/70" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300">Nenhum voo registrado ainda</p>
              <p className="text-xs text-slate-500 mt-1">Registre voos no diário de bordo para visualizar o gráfico.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-bold tracking-tight text-amber-400">{fmtHours(totalMinutes)}</span>
              <span className="text-xs text-slate-500">total em {data.length} aeronave(s)</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: "#334155" }}
                  />
                  <YAxis
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => fmtHours(v)}
                  />
                  <Tooltip
                    cursor={{ fill: "#f59e0b10" }}
                    contentStyle={{
                      background: "#12141a",
                      border: "1px solid #334155",
                      borderRadius: 10,
                      fontSize: 12,
                      color: "#f1f5f9",
                    }}
                    labelStyle={{ color: "#f59e0b", fontWeight: 600 }}
                    formatter={(v) => [fmtHours(v), "Horas"]}
                  />
                  <Bar
                    dataKey="minutes"
                    fill="#f59e0b"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={54}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}