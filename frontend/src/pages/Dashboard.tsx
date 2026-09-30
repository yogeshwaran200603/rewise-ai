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
      <div className="max-w-6xl mx-auto px-4 py-20 text-center text-xs text-slate-400 font-mono">
        Loading environmental metrics and user telemetry...
      </div>
    );
  }

  const pieData = [
    { name: "Repaired (Lifespan Ext)", value: data.devices_repaired, color: "#10b981" },
    { name: "Reused / Resold (2nd Life)", value: data.devices_reused, color: "#3b82f6" },
    { name: "Recycled (Urban Mining)", value: data.devices_recycled, color: "#f59e0b" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-mono text-emerald-400 font-semibold tracking-wider block">
            Circular Stewardship Profile
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, {data.user_name}
          </h1>
        </div>

        <Link
          to="/diagnose"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wide transition-all shadow-md shadow-emerald-500/20"
        >
          <Wrench className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Diagnose New Device</span>
        </Link>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Devices Analyzed</span>
            <Smartphone className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-white block">
            {data.devices_analyzed}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Full hardware telemetry</span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Repaired</span>
            <Wrench className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 block">
            {data.devices_repaired}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">+1.5 yrs life added</span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Reused / Resold</span>
            <RotateCw className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-blue-400 block">
            {data.devices_reused}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Active secondary circulation</span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Recycled</span>
            <Recycle className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 block">
            {data.devices_recycled}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">CPCB certified zero-landfill</span>
        </div>
      </div>

      {/* Environmental Impact Showcase Banner */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel-glow border border-emerald-500/30 bg-gradient-to-r from-slate-900/90 via-slate-950 to-slate-900">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-4">
          <Leaf className="w-4 h-4" />
          <span>Verified Environmental Footprint Avoided</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div>
            <span className="text-slate-400 text-xs block mb-1">Total CO₂e Emissions Prevented:</span>
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400 block">
              {data.total_co2e_saved_kg} <span className="text-lg font-bold text-white">kg CO₂e</span>
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Equivalent to ~340 km of passenger car gasoline combustion avoided.
            </span>
          </div>

          <div>
            <span className="text-slate-400 text-xs block mb-1">E-Waste Diverted from Landfills:</span>
            <span className="text-3xl sm:text-4xl font-extrabold text-white block">
              {data.total_ewaste_diverted_kg} <span className="text-lg font-bold text-emerald-400">kg</span>
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Precious materials retained in closed circular loops.
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <span>ReWise Circular Points:</span>
              <span className="font-mono font-bold text-emerald-400">{data.reward_points} pts</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Stewardship Tier:</span>
              <span className="font-semibold text-emerald-300">Circular Guardian</span>
            </div>
            <Link
              to="/rewards"
              className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 pt-1"
            >
              <span>Redeem Perks & Subsidies</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Monthly Progression */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-panel border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Cumulative Carbon Preserved (kg CO₂e)</h3>
              <p className="text-[11px] text-slate-400">Monthly trajectory from circular electronics actions</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <Activity className="w-3.5 h-3.5" /> Live Data
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthly_impact} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#090d16",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="co2e_saved"
                  name="CO₂e Saved (kg)"
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
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Circular Pathway Split</h3>
            <p className="text-[11px] text-slate-400 mb-2">Disposition distribution across evaluated units</p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#090d16",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    fontSize: "11px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-[11px] pt-3 border-t border-slate-800">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name.split(" ")[0]}
                </span>
                <span className="font-mono font-semibold">{d.value} devices</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-4">Recent Circular Activity</h3>
        <div className="divide-y divide-slate-800">
          {data.recent_activity.map((act, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-white font-medium block">{act.action}</span>
                  <span className="text-[11px] text-slate-400">{act.device}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-emerald-400 font-mono font-bold block">{act.points} pts</span>
                <span className="text-[11px] text-slate-400">{act.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
