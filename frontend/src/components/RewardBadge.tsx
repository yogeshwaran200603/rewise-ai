import React from "react";
import { Award, ShieldCheck, Sparkles, Leaf } from "lucide-react";

interface RewardBadgeProps {
  points: number;
  tier?: "Eco Seedling" | "Green Restorer" | "Circular Guardian" | "Zero Waste Champion" | string;
  size?: "sm" | "md" | "lg";
  showLedgerStatus?: boolean;
}

export const RewardBadge: React.FC<RewardBadgeProps> = ({
  points,
  tier,
  size = "md",
  showLedgerStatus = false,
}) => {
  const resolvedTier =
    tier ||
    (points >= 500
      ? "Zero Waste Champion"
      : points >= 300
      ? "Circular Guardian"
      : points >= 150
      ? "Green Restorer"
      : "Eco Seedling");

  const sizeStyles = {
    sm: "px-2.5 py-1 text-xs gap-1.5",
    md: "px-3.5 py-1.5 text-xs sm:text-sm gap-2",
    lg: "px-5 py-3 text-base gap-3",
  }[size];

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <div
        className={`inline-flex items-center rounded-full glass-eco border border-emerald-500/30 text-[#f4f6f4] font-medium shadow-lg shadow-emerald-950/40 ${sizeStyles}`}
      >
        <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
          <Award className="w-3 h-3" />
        </div>
        <span className="font-extrabold text-emerald-400 font-mono tracking-tight">+{points}</span>
        <span className="text-[#93a299] text-[11px] font-mono">ReWise Pts</span>

        {tier && (
          <span className="ml-1 pl-2 border-l border-white/10 text-[10px] text-teal-300 font-medium hidden sm:inline">
            {resolvedTier}
          </span>
        )}
      </div>

      {showLedgerStatus && (
        <div className="flex items-center gap-1 text-[10px] text-[#93a299] font-mono pl-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Anti-farming 30m ledger protected</span>
        </div>
      )}
    </div>
  );
};
