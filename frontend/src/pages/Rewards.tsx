import React, { useState, useEffect } from "react";
import { Award, Wrench, RotateCw, Recycle, Clock, ShieldCheck, TreePine } from "lucide-react";
import { api } from "../services/api";
import type { DashboardSummary } from "../types";

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
      title: "₹500 Repair Discount Voucher",
      cost: 200,
      icon: Wrench,
      description: "Redeemable at any GoFix or Buzzmeeh authorized service center for display/battery replacement.",
    },
    {
      title: "Plant a Verified Geo-Tagged Tree",
      cost: 150,
      icon: TreePine,
      description: "Partnered with SankalpTaru Foundation to reforest western ghats with official certificate.",
    },
    {
      title: "Free Tempered Glass & Bio-Case",
      cost: 250,
      icon: ShieldCheck,
      description: "100% biodegradable wheat-straw phone case shipped directly to your doorstep.",
    },
    {
      title: "Certified Refurbished Warranty Extension",
      cost: 400,
      icon: RotateCw,
      description: "Adds 6 months extended hardware warranty to any secondary trade-in device.",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">
      {/* Hero Points Card */}
      <div className="p-8 sm:p-10 rounded-3xl glass-panel-glow border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-center relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto mb-4">
          <Award className="w-8 h-8" />
        </div>
        <span className="text-xs uppercase font-mono text-emerald-400 font-semibold tracking-widest block mb-1">
          Your Circular ReWise Wallet
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-2">
          {points} <span className="text-2xl sm:text-3xl text-emerald-400 font-bold">Points</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
          Points earned through active circular stewardship. Redeemable for verified repair subsidies and green
          technology perks (not direct cash).
        </p>
      </div>

      {/* How to Earn Points Section */}
      <div>
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-xs uppercase font-bold text-emerald-400 tracking-widest mb-1.5">Action Matrix</h2>
          <h3 className="text-2xl font-bold text-white tracking-tight">How to Earn ReWise Points</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 text-center">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-3">
              <Wrench className="w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold text-emerald-400 block mb-1">+50 Points</span>
            <h4 className="text-sm font-bold text-white mb-2">Repair Your Smartphone</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Awarded upon booking a verified component repair at an authorized center, extending device lifespan.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-slate-800 text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto mb-3">
              <RotateCw className="w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold text-blue-400 block mb-1">+100 Points</span>
            <h4 className="text-sm font-bold text-white mb-2">Reuse or Resell</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Awarded when you trade in a working device for secondary market refurbishment or community donation.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-slate-800 text-center">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-3">
              <Recycle className="w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold text-amber-400 block mb-1">+200 Points</span>
            <h4 className="text-sm font-bold text-white mb-2">Responsible E-Waste Recycling</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Awarded when obsolete devices or swollen batteries are safely transferred to CPCB certified recyclers.
            </p>
          </div>
        </div>
      </div>

      {/* Circular Perks Catalogue */}
      <div>
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-xs uppercase font-bold text-emerald-400 tracking-widest mb-1.5">Perks Catalogue</h2>
          <h3 className="text-2xl font-bold text-white tracking-tight">Redeemable Rewards</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {rewardPerks.map((perk, idx) => {
            const Icon = perk.icon;
            const canAfford = points >= perk.cost;
            return (
              <div key={idx} className="p-6 rounded-2xl glass-panel border border-slate-800 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-emerald-400 shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-white">{perk.title}</h4>
                    <span className="text-xs font-mono font-bold text-emerald-400">{perk.cost} Pts</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">{perk.description}</p>
                  <button
                    disabled={!canAfford}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      canAfford
                        ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                        : "bg-slate-800 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {canAfford ? "Redeem Perk" : `Need ${perk.cost - points} more pts`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rewards History Audit Log */}
      <div>
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          <span>Reward Activity History</span>
        </h3>

        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          {dashboardData?.reward_history && dashboardData.reward_history.length > 0 ? (
            <div className="divide-y divide-slate-800/80">
              {dashboardData.reward_history.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-white font-medium block">{item.reason}</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(item.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    +{item.points_change} Pts
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No reward transactions yet. Diagnose a device and take action to earn your first points!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
