import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Award, Wrench, RotateCw, Recycle, TrendingUp, Clock, ShieldCheck, TreePine, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { api } from "../services/api";
import type { DashboardSummary } from "../types";
import { RewardBadge } from "../components/RewardBadge";

export const Rewards: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    api
      .getDashboard()
      .then((data) => setDashboardData(data))
      .catch((err) => console.error("Error loading rewards dashboard:", err));
  }, []);

  const points = dashboardData?.reward_points || 350;

  const rewardPerks = [
    {
      title: "₹500 Authorized Repair Subsidy",
      cost: 200,
      icon: Wrench,
      description: "Direct discount voucher for display or battery replacements at GoFix, Buzzmeeh, or Inspire Care clinics.",
      partner: "Verified Indian Repair Network",
    },
    {
      title: "Plant a Geo-Tagged Western Ghats Tree",
      cost: 150,
      icon: TreePine,
      description: "Partnered with SankalpTaru Foundation to plant and satellite-monitor an indigenous native tree.",
      partner: "SankalpTaru Foundation",
    },
    {
      title: "100% Biodegradable Wheat-Straw Case",
      cost: 250,
      icon: ShieldCheck,
      description: "Zero-plastic drop-proof protective case molded from organic agricultural wheat residue.",
      partner: "Eco-Tech Accessories",
    },
    {
      title: "6-Month Secondary Device Warranty",
      cost: 400,
      icon: RotateCw,
      description: "Adds extended hardware motherboard and display protection to any secondary refurbished phone.",
      partner: "Cashify & ReWise Care",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-12">
      {/* Hero Points Wallet Card */}
      <div className="p-8 sm:p-12 rounded-3xl glass-eco-glow border border-emerald-500/30 text-center relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto mb-4 shadow-xl shadow-emerald-500/25">
          <Award className="w-8 h-8" />
        </div>

        <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold block mb-1">
          Circular ReWise Stewardship Wallet
        </span>

        <h1 className="text-4xl sm:text-6xl font-black text-[#f4f6f4] tracking-tight mb-2">
          {points} <span className="text-2xl sm:text-3xl text-emerald-400 font-bold font-mono">Pts</span>
        </h1>

        <p className="text-xs sm:text-sm text-[#93a299] max-w-lg mx-auto font-sans leading-relaxed">
          Green reward points earned through verified circular device actions. Redeemable for authorized repair subsidies and civic ecological impact.
        </p>

        {/* Anti-Farming Security Banner */}
        <div className="mt-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 border border-white/10 text-xs font-mono text-[#93a299]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Anti-Farming Ledger: 30-Minute Rate-Limiting Active</span>
        </div>
      </div>

      {/* Action Earning Matrix */}
      <div>
        <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">Action Matrix</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f4f6f4] tracking-tight">How to Earn ReWise Points</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-3xl glass-eco border border-emerald-500/20 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <Wrench className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-emerald-400 font-mono block">+50 Pts</span>
            <h4 className="text-sm font-bold text-[#f4f6f4]">Repair Your Phone</h4>
            <p className="text-xs text-[#93a299] leading-relaxed">
              Awarded upon booking an authorized component replacement, extending primary pocket service.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-eco border border-teal-500/20 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-300 flex items-center justify-center mx-auto">
              <RotateCw className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-teal-300 font-mono block">+40 Pts</span>
            <h4 className="text-sm font-bold text-[#f4f6f4]">Reuse & Repurpose</h4>
            <p className="text-xs text-[#93a299] leading-relaxed">
              Awarded when converting a working phone into a dedicated webcam, dashcam, or security monitor.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-eco border border-blue-500/20 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-blue-400 font-mono block">+75 Pts</span>
            <h4 className="text-sm font-bold text-[#f4f6f4]">Trade-In / Resell</h4>
            <p className="text-xs text-[#93a299] leading-relaxed">
              Awarded upon secondary trade-in circulation via Cashify, Amazon, or community donation.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-eco border border-amber-500/20 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              <Recycle className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-amber-400 font-mono block">+100 Pts</span>
            <h4 className="text-sm font-bold text-[#f4f6f4]">CPCB E-Waste Drop</h4>
            <p className="text-xs text-[#93a299] leading-relaxed">
              Awarded for dropping off irreparable hardware at accredited urban mining facilities.
            </p>
          </div>
        </div>
      </div>

      {/* Perks Redemption Catalog */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">Rewards Catalog</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f4f6f4] tracking-tight">Redeemable Eco-Tech Perks</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rewardPerks.map((perk, idx) => {
            const Icon = perk.icon;
            const canAfford = points >= perk.cost;

            return (
              <div key={idx} className="p-6 rounded-3xl glass-eco border border-white/5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-black/40 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#f4f6f4]">{perk.title}</h4>
                      <span className="text-[10px] text-teal-300 font-mono block mt-0.5">{perk.partner}</span>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold shrink-0">
                    {perk.cost} Pts
                  </span>
                </div>

                <p className="text-xs text-[#93a299] leading-relaxed">{perk.description}</p>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] text-[#93a299] font-mono">
                    {canAfford ? "Available in your wallet" : `Need ${perk.cost - points} more pts`}
                  </span>
                  <button
                    disabled={!canAfford}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                      canAfford
                        ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20"
                        : "bg-white/5 text-slate-600 cursor-not-allowed"
                    }`}
                  >
                    Redeem Perk
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
