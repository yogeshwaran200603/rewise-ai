import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Smartphone,
  Wrench,
  RotateCw,
  Recycle,
  Leaf,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  QrCode,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { api } from "../services/api";
import type { DashboardSummary } from "../types";
import { EcoMetric } from "../components/EcoMetric";

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getDashboard()
      .then((res) => setData(res))
      .catch((err) => console.error("Error fetching dashboard:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center text-xs font-mono text-emerald-400 animate-pulse">
        Loading environmental metrics and user telemetry...
      </div>
    );
  }

  const pieData = [
    { name: "Repaired (Lifespan Ext)", value: data.devices_repaired, color: "#10b981" },
    { name: "Reused / Resold (2nd Life)", value: data.devices_reused, color: "#38bdf8" },
    { name: "Recycled (Urban Mining)", value: data.devices_recycled, color: "#f59e0b" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-semibold uppercase mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Circular Stewardship Profile</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#f4f6f4] tracking-tight">
            Welcome back, {data.user_name}
          </h1>
          <p className="text-xs sm:text-sm text-[#93a299] mt-0.5 font-mono">
            Scientific LCA ledger tracking avoided emissions and diverted smartphone e-waste.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/passport"
            className="px-4 py-2.5 rounded-2xl glass-eco hover:bg-white/5 border border-white/10 text-xs font-mono text-[#93a299] hover:text-[#f4f6f4] transition-colors flex items-center gap-1.5"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Digital Passport</span>
          </Link>
          <Link
            to="/diagnose"
            className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono tracking-wide transition-all shadow-md shadow-emerald-500/25 flex items-center gap-1.5"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Diagnose New Device</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <EcoMetric
          icon={Smartphone}
          label="Devices Diagnosed"
          value={data.devices_analyzed}
          unit="Units"
          subtext="Full hardware telemetry isolated"
          variant="slate"
        />
        <EcoMetric
          icon={Wrench}
          label="Repaired Units"
          value={data.devices_repaired}
          unit="Phones"
          subtext="+1.5–3 yrs life extended"
          variant="emerald"
        />
        <EcoMetric
          icon={RotateCw}
          label="Reused & Resold"
          value={data.devices_reused}
          unit="Circulated"
          subtext="Active secondary circulation"
          variant="mint"
        />
        <EcoMetric
          icon={Recycle}
          label="Recycled Units"
          value={data.devices_recycled}
          unit="Recovered"
          subtext="CPCB zero-landfill urban mining"
          variant="amber"
        />
      </div>

      {/* Environmental Impact Showcase Banner */}
      <div className="p-6 sm:p-8 rounded-3xl glass-eco-glow border border-emerald-500/30">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-400 uppercase tracking-widest mb-4">
          <Leaf className="w-4 h-4" />
          <span>Verified Environmental Footprint Avoided (ITU-T L.1410)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div>
            <span className="text-[#93a299] text-xs font-mono block mb-1">Total CO₂e Emissions Displaced:</span>
            <span className="text-3xl sm:text-5xl font-black text-emerald-400 tracking-tight block">
              {data.total_co2e_saved_kg} <span className="text-lg font-bold text-[#f4f6f4] font-mono">kg CO₂e</span>
            </span>
            <span className="text-[11px] text-[#93a299] mt-1.5 block font-mono">
              Equivalent to ~340 km of passenger vehicle gasoline combustion avoided.
            </span>
          </div>

          <div>
            <span className="text-[#93a299] text-xs font-mono block mb-1">E-Waste Diverted from Dumpsites:</span>
            <span className="text-3xl sm:text-5xl font-black text-[#f4f6f4] tracking-tight block">
              {data.total_ewaste_diverted_kg} <span className="text-lg font-bold text-emerald-400 font-mono">kg</span>
            </span>
            <span className="text-[11px] text-[#93a299] mt-1.5 block font-mono">
              Precious elemental metals retained in verified closed loop.
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-black/60 border border-white/5 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#93a299]">ReWise Green Points:</span>
              <span className="font-bold text-emerald-400 text-sm">+{data.reward_points} pts</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#93a299]">Stewardship Tier:</span>
              <span className="font-semibold text-teal-300">Circular Guardian</span>
            </div>
            <div className="pt-2 border-t border-white/5">
              <Link
                to="/rewards"
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center justify-between transition-colors"
              >
                <span>Redeem Repair Subsidies</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Monthly Progression */}
        <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl glass-eco border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#f4f6f4]">Cumulative Carbon Avoided Trajectory (kg CO₂e)</h3>
              <p className="text-[11px] text-[#93a299] font-mono">Monthly timeline from verified circular actions</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
              <Activity className="w-3.5 h-3.5" />
              <span>+18.2% YoY</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthly_carbon_saved}>
                <defs>
                  <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="month" stroke="#93a299" fontSize={11} tickLine={false} />
                <YAxis stroke="#93a299" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0d1210",
                    borderColor: "rgba(16, 185, 129, 0.3)",
                    borderRadius: "1rem",
                    color: "#f4f6f4",
                    fontSize: "11px",
                    fontFamily: "monospace",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="carbon_kg"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#emeraldGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Circular Distribution */}
        <div className="p-6 sm:p-7 rounded-3xl glass-eco border border-white/5 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#f4f6f4]">Circular Pathway Ratio</h3>
            <p className="text-[11px] text-[#93a299] font-mono">Breakdown across 4 circular dispositions</p>
          </div>

          <div className="h-44 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={68}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0d1210",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "0.75rem",
                    color: "#f4f6f4",
                    fontSize: "11px",
                    fontFamily: "monospace",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-[#f4f6f4] font-mono">
                {data.devices_analyzed}
              </span>
              <span className="text-[9px] uppercase font-mono text-[#93a299]">Units</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-white/5 text-[11px] font-mono">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-[#93a299]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <span className="font-bold text-[#f4f6f4]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
