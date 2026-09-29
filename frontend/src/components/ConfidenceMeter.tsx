import React from "react";
import { ShieldCheck, AlertCircle, HelpCircle } from "lucide-react";

interface ConfidenceMeterProps {
  score?: number; // 0.0 - 1.0 or 0 - 100
  level?: "Confirmed" | "Likely" | "Possible" | "Cannot Confirm" | string;
  label?: string;
  size?: "sm" | "md";
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  score,
  level = "Likely",
  label = "Diagnostic Confidence",
  size = "md",
}) => {
  // Normalize percentage
  let pct = 75;
  if (score !== undefined) {
    pct = score <= 1 ? Math.round(score * 100) : Math.round(score);
  } else {
    if (level.toLowerCase().includes("confirm") && !level.toLowerCase().includes("cannot")) pct = 95;
    else if (level.toLowerCase().includes("likely") || level.toLowerCase().includes("high")) pct = 80;
    else if (level.toLowerCase().includes("possible") || level.toLowerCase().includes("moderate")) pct = 60;
    else if (level.toLowerCase().includes("cannot") || level.toLowerCase().includes("low")) pct = 35;
  }

  const getStatusColor = () => {
    if (pct >= 85) return { bar: "bg-emerald-500", text: "text-emerald-400", badge: "bg-emerald-500/10 border-emerald-500/30" };
    if (pct >= 60) return { bar: "bg-teal-400", text: "text-teal-300", badge: "bg-teal-500/10 border-teal-500/30" };
    if (pct >= 40) return { bar: "bg-amber-400", text: "text-amber-400", badge: "bg-amber-500/10 border-amber-500/30" };
    return { bar: "bg-rose-400", text: "text-rose-400", badge: "bg-rose-500/10 border-rose-500/30" };
  };

  const status = getStatusColor();

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#93a299] font-mono flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          {label}
        </span>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${status.badge} ${status.text}`}>
            {level}
          </span>
          <span className={`font-mono font-bold ${status.text}`}>{pct}%</span>
        </div>
      </div>

      <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${status.bar}`}
          style={{ width: `${Math.min(100, Math.max(5, pct))}%` }}
        />
      </div>
    </div>
  );
};
