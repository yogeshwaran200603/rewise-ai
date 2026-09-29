import React, { useState } from "react";
import { Info, type LucideIcon } from "lucide-react";

interface EcoMetricProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  methodology?: string;
  confidence?: string;
  variant?: "emerald" | "mint" | "amber" | "slate";
}

export const EcoMetric: React.FC<EcoMetricProps> = ({
  icon: Icon,
  label,
  value,
  unit,
  subtext,
  methodology,
  confidence,
  variant = "emerald",
}) => {
  const [showMethodology, setShowMethodology] = useState(false);

  const colorStyles = {
    emerald: {
      border: "border-emerald-500/20",
      iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      accent: "text-emerald-400",
    },
    mint: {
      border: "border-teal-500/20",
      iconBg: "bg-teal-500/10 text-teal-300 border-teal-500/30",
      accent: "text-teal-300",
    },
    amber: {
      border: "border-amber-500/20",
      iconBg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      accent: "text-amber-400",
    },
    slate: {
      border: "border-slate-800",
      iconBg: "bg-slate-800 text-slate-300 border-slate-700",
      accent: "text-slate-200",
    },
  }[variant];

  return (
    <div className={`relative p-5 rounded-2xl glass-eco border ${colorStyles.border} glass-eco-hover transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#93a299]">{label}</span>
        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${colorStyles.iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline gap-1.5 mb-1">
        <span className="text-2xl sm:text-3xl font-extrabold text-[#f4f6f4] tracking-tight">{value}</span>
        {unit && <span className="text-xs font-semibold text-[#93a299] font-mono">{unit}</span>}
      </div>

      {subtext && <p className="text-[11px] text-[#93a299] mt-0.5 line-clamp-1">{subtext}</p>}

      {(methodology || confidence) && (
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[10px]">
          {confidence && (
            <span className="inline-flex items-center gap-1 font-mono text-[#93a299]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {confidence}
            </span>
          )}
          {methodology && (
            <button
              onClick={() => setShowMethodology(!showMethodology)}
              className="text-[#93a299] hover:text-emerald-400 flex items-center gap-1 transition-colors ml-auto"
              title="Methodology reference"
            >
              <Info className="w-3 h-3" />
              <span>LCA Standard</span>
            </button>
          )}
        </div>
      )}

      {showMethodology && methodology && (
        <div className="mt-2.5 p-2 rounded-lg bg-black/60 border border-emerald-500/20 text-[10px] text-[#93a299] font-mono">
          {methodology}
        </div>
      )}
    </div>
  );
};
