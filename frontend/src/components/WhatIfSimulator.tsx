import React, { useState } from "react";
import { Wrench, RotateCw, Recycle, ArrowRight, CheckCircle2, TrendingUp, Leaf, Award } from "lucide-react";
import type { RepairEstimate, ResaleEstimate, RecyclingOption } from "../types";

interface WhatIfSimulatorProps {
  device: string;
  repairSummary?: RepairEstimate;
  resaleSummary?: ResaleEstimate;
  recycleSummary?: RecyclingOption;
  onSelectAction?: (action: "REPAIR" | "REUSE" | "RESELL" | "RECYCLE") => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  device,
  repairSummary,
  resaleSummary,
  recycleSummary,
  onSelectAction,
}) => {
  const [activeScenario, setActiveScenario] = useState<"repair" | "resell" | "recycle">("repair");

  const repairCost = repairSummary?.estimated_total || 4500;
  const resaleMid = resaleSummary?.estimated_mid || 16500;
  const resaleAfterRepair = resaleSummary?.potential_value_after_repair_mid || Math.round(resaleMid * 1.35);
  const netArbitrage = resaleAfterRepair - repairCost;

  return (
    <div className="p-6 sm:p-8 rounded-3xl glass-eco border border-white/5 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#93a299]">
            Interactive Circular Scenario Engine
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#f4f6f4] tracking-tight mt-0.5">
            What-If Disposition Simulator
          </h3>
        </div>

        {/* Scenario Toggle */}
        <div className="flex p-1 rounded-2xl bg-black/60 border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setActiveScenario("repair")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
              activeScenario === "repair"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "text-[#93a299] hover:text-[#f4f6f4]"
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>If I Repair</span>
          </button>
          <button
            onClick={() => setActiveScenario("resell")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
              activeScenario === "resell"
                ? "bg-teal-400 text-slate-950 shadow-md shadow-teal-500/20"
                : "text-[#93a299] hover:text-[#f4f6f4]"
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>If I Sell</span>
          </button>
          <button
            onClick={() => setActiveScenario("recycle")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
              activeScenario === "recycle"
                ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-[#93a299] hover:text-[#f4f6f4]"
            }`}
          >
            <Recycle className="w-3.5 h-3.5" />
            <span>If I Recycle</span>
          </button>
        </div>
      </div>

      {/* Scenario Detail Card */}
      <div className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-6">
        {activeScenario === "repair" && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div>
                <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block">
                  Scenario Outcome: Primary Device Lifespan Extension
                </span>
                <h4 className="text-lg font-bold text-[#f4f6f4] mt-0.5">
                  Keep {device} in active pocket service for +18 to 36 months
                </h4>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-mono text-[#93a299] block">Estimated Outlay:</span>
                <span className="text-2xl font-black text-emerald-400">₹{repairCost.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[11px] text-[#93a299] font-mono block">Capital Retained</span>
                <span className="text-lg font-bold text-[#f4f6f4] mt-1 block">
                  Saves ~₹{(35000 - repairCost).toLocaleString("en-IN")}
                </span>
                <p className="text-[11px] text-[#93a299] mt-0.5">Compared to purchasing a replacement unit</p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[11px] text-[#93a299] font-mono block">Avoided Footprint</span>
                <span className="text-lg font-bold text-emerald-400 mt-1 block">~48.5 kg CO₂e</span>
                <p className="text-[11px] text-[#93a299] mt-0.5">Displaces 80% virgin manufacturing emissions</p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[11px] text-[#93a299] font-mono block">Future Trade-In Value</span>
                <span className="text-lg font-bold text-teal-300 mt-1 block">
                  ₹{resaleAfterRepair.toLocaleString("en-IN")}
                </span>
                <p className="text-[11px] text-[#93a299] mt-0.5">Value restored post-screen/battery repair</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-xs text-[#93a299] font-mono">
                Source: Empirical Authorized Service Benchmark Schedules
              </span>
              {onSelectAction && (
                <button
                  onClick={() => onSelectAction("REPAIR")}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20"
                >
                  <span>Select Repair Pathway</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {activeScenario === "resell" && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div>
                <span className="text-[11px] font-mono text-teal-300 uppercase tracking-wider block">
                  Scenario Outcome: Secondary Market Circulation
                </span>
                <h4 className="text-lg font-bold text-[#f4f6f4] mt-0.5">
                  Liquidate {device} into the verified trade-in market
                </h4>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-mono text-[#93a299] block">Cashback Immediate:</span>
                <span className="text-2xl font-black text-teal-300">₹{resaleMid.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[11px] text-[#93a299] font-mono block">Repair & Resell Arbitrage</span>
                <span className="text-lg font-bold text-[#f4f6f4] mt-1 block">
                  {netArbitrage > 0 ? `+₹${netArbitrage.toLocaleString("en-IN")} Net Gain` : "Direct Trade-In Optimal"}
                </span>
                <p className="text-[11px] text-[#93a299] mt-0.5">Value delta if repaired before resale</p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[11px] text-[#93a299] font-mono block">Avoided Footprint</span>
                <span className="text-lg font-bold text-teal-300 mt-1 block">~39.0 kg CO₂e</span>
                <p className="text-[11px] text-[#93a299] mt-0.5">Prevents demand for an entry-level smartphone</p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[11px] text-[#93a299] font-mono block">ReWise Reward</span>
                <span className="text-lg font-bold text-emerald-400 mt-1 block">+75 Green Pts</span>
                <p className="text-[11px] text-[#93a299] mt-0.5">Awarded upon trade-in verification</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-xs text-[#93a299] font-mono">
                Source: Cashify & Amazon Renewed Indian Market Aggregates
              </span>
              {onSelectAction && (
                <button
                  onClick={() => onSelectAction("RESELL")}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-teal-400/20"
                >
                  <span>Select Resell Pathway</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {activeScenario === "recycle" && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div>
                <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider block">
                  Scenario Outcome: Zero-Landfill Urban Mining
                </span>
                <h4 className="text-lg font-bold text-[#f4f6f4] mt-0.5">
                  Accredited CPCB E-Waste recovery & smelter extraction
                </h4>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-mono text-[#93a299] block">Financial Outlay:</span>
                <span className="text-2xl font-black text-amber-400">₹0 (Free Drop-Off)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[11px] text-[#93a299] font-mono block">E-Waste Diverted</span>
                <span className="text-lg font-bold text-amber-400 mt-1 block">0.18 kg Diverted</span>
                <p className="text-[11px] text-[#93a299] mt-0.5">100% prevented from informal toxic burning</p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[11px] text-[#93a299] font-mono block">Elemental Metals</span>
                <span className="text-lg font-bold text-[#f4f6f4] mt-1 block">~14g Elemental Ore</span>
                <p className="text-[11px] text-[#93a299] mt-0.5">Pure Gold, Silver, Palladium & Copper recovered</p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[11px] text-[#93a299] font-mono block">ReWise Reward</span>
                <span className="text-lg font-bold text-amber-400 mt-1 block">+100 Green Pts</span>
                <p className="text-[11px] text-[#93a299] mt-0.5">Maximum civic recycling bonus</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-xs text-[#93a299] font-mono">
                Source: CPCB EPR MoEFCC Statutory Registry (33 Verified Recyclers)
              </span>
              {onSelectAction && (
                <button
                  onClick={() => onSelectAction("RECYCLE")}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-400/20"
                >
                  <span>Select Recycle Pathway</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
