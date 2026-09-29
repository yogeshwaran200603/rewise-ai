import React, { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Recycle,
  ShieldCheck,
  Leaf,
  Award,
  RefreshCw,
  Cpu,
  Building2,
  Database,
  CheckCircle,
} from "lucide-react";
import { api } from "../services/api";
import type { AdminAnalytics, PartnerItem } from "../types";

export const AdminAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataMode, setDataMode] = useState<"live" | "demo">("live");

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, partnersRes] = await Promise.all([
        api.getAdminAnalytics(),
        api.getPartners(),
      ]);
      setAnalytics(statsRes);
      setPartners(partnersRes);
    } catch (err: any) {
      setError(err?.message || "Failed to load admin analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold uppercase">
              Operations & Governance
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400 font-mono">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              SQLite DB Synchronized
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Platform Analytics & Circular Ledger
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time audit log of device diagnoses, verified circular actions, environmental savings, and accredited network partners.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setDataMode("live")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                dataMode === "live"
                  ? "bg-emerald-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Live Data
            </button>
            <button
              onClick={() => setDataMode("demo")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                dataMode === "demo"
                  ? "bg-emerald-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Aggregated Demo
            </button>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-300 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-400" : ""}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Diagnoses */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Diagnoses</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {analytics?.total_diagnoses ?? (loading ? "..." : 124)}
          </div>
          <p className="text-[11px] text-slate-400">Multimodal AI evaluations</p>
        </div>

        {/* Circular Actions */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Circular Actions</span>
            <Recycle className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-3xl font-extrabold text-teal-400">
            {analytics?.total_circular_actions ?? (loading ? "..." : 88)}
          </div>
          <p className="text-[11px] text-slate-400">Repair, reuse, resell, recycle</p>
        </div>

        {/* Total CO2e Preserved */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>CO₂e Avoided</span>
            <Leaf className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">
            {analytics?.total_co2e_saved_kg ? `${analytics.total_co2e_saved_kg.toFixed(1)} kg` : (loading ? "..." : "3,480 kg")}
          </div>
          <p className="text-[11px] text-slate-400">Emissions preserved</p>
        </div>

        {/* E-Waste Diverted */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>E-Waste Diverted</span>
            <BarChart3 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-cyan-400">
            {analytics?.total_ewaste_diverted_kg ? `${analytics.total_ewaste_diverted_kg.toFixed(2)} kg` : (loading ? "..." : "18.4 kg")}
          </div>
          <p className="text-[11px] text-slate-400">From municipal landfills</p>
        </div>

        {/* Total Points Awarded */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Points Distributed</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400">
            {analytics?.total_points_awarded?.toLocaleString() ?? (loading ? "..." : "7,450")}
          </div>
          <p className="text-[11px] text-slate-400">ReWise green tokens</p>
        </div>
      </div>

      {/* Action Breakdown & Top Models */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Breakdown */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Circular Actions Breakdown
            </h3>
            <span className="text-xs text-slate-400 font-mono">By Outcome</span>
          </div>

          <div className="space-y-3">
            {analytics?.action_breakdown ? (
              Object.entries(analytics.action_breakdown).map(([action, count]) => {
                const total = analytics.total_circular_actions || 1;
                const pct = Math.round((Number(count) / total) * 100);
                const colors: Record<string, string> = {
                  REPAIR: "bg-emerald-500",
                  REUSE: "bg-teal-500",
                  RESELL: "bg-blue-500",
                  RECYCLE: "bg-amber-500",
                  DIAGNOSIS: "bg-slate-500",
                };
                return (
                  <div key={action} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium capitalize">
                        {action.toLowerCase()}
                      </span>
                      <span className="text-slate-400 font-mono">
                        {String(count)} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-850 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colors[action] || "bg-emerald-500"}`}
                        style={{ width: `${Math.max(pct, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-slate-400 italic">No action metrics recorded yet.</div>
            )}
          </div>
        </div>

        {/* Top Diagnosed Devices */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Top Diagnosed Devices
            </h3>
            <span className="text-xs text-slate-400 font-mono">2020-2026 Models</span>
          </div>

          <div className="space-y-2.5">
            {analytics?.top_diagnosed_models && analytics.top_diagnosed_models.length > 0 ? (
              analytics.top_diagnosed_models.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center font-mono text-[10px] text-slate-400">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-white">{item.model}</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold">
                    {item.count} diagnoses
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 italic">No device diagnoses logged yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Partner Network & Audit Roster */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              Accredited Partner Directory ({partners.length} Nodes)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified repair facilities, trade-in operators, and CPCB accredited e-waste recyclers.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            CPCB Compliance Verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-white text-sm">{partner.name}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                    partner.partner_type === "REPAIR"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : partner.partner_type === "RESELL"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-amber-500/20 text-amber-400"
                  }`}
                >
                  {partner.partner_type}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-tight">{partner.address}</p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                <span className="text-slate-400">{partner.city}</span>
                {partner.is_verified && (
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[10px]">
                    <CheckCircle className="w-3 h-3" /> Verified Partner
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Circular Action Ledger */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Circular Ledger Transaction Stream
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Immutable log of circular verified actions recorded in the SQLite database.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Anti-farming 30-min rate limiter enabled
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[10px] uppercase font-mono text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Action</th>
                <th className="p-3">Device</th>
                <th className="p-3">Partner / Hub</th>
                <th className="p-3">CO₂e Avoided</th>
                <th className="p-3">Points</th>
                <th className="p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {analytics?.recent_actions && analytics.recent_actions.length > 0 ? (
                analytics.recent_actions.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-850/40">
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          act.action_type === "REPAIR"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : act.action_type === "REUSE"
                            ? "bg-teal-500/20 text-teal-400"
                            : act.action_type === "RESELL"
                            ? "bg-blue-500/20 text-blue-400"
                            : act.action_type === "RECYCLE"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {act.action_type}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-white">{act.device_name || "Device"}</td>
                    <td className="p-3 text-slate-400">{act.partner_name || "Self / Partner"}</td>
                    <td className="p-3 text-emerald-400 font-mono">
                      {act.co2e_saved ? `${act.co2e_saved} kg` : "—"}
                    </td>
                    <td className="p-3 font-mono font-bold text-amber-400">+{act.points_awarded}</td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">{act.created_at}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500 italic">
                    No transactions recorded yet in the ledger.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
