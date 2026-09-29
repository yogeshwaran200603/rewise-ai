import React from "react";
import { Sparkles, Cpu, CheckCircle2, ShieldCheck, Activity, Eye, Wrench, Leaf } from "lucide-react";

interface DiagnosticProgressProps {
  device: string;
  stepMessage: string;
  progressPercent?: number;
  hasImage?: boolean;
}

export const DiagnosticProgress: React.FC<DiagnosticProgressProps> = ({
  device,
  stepMessage,
  progressPercent = 65,
  hasImage = false,
}) => {
  const steps = [
    { label: "Device identified & specifications loaded", icon: Cpu, done: progressPercent >= 20 },
    { label: "Problem description analyzed (NLP & Tanglish parsed)", icon: Activity, done: progressPercent >= 40 },
    { label: hasImage ? "Visual damage telemetry inspected via Gemini Vision" : "Observational symptom evidence isolated", icon: Eye, done: progressPercent >= 60 },
    { label: "Empirical repair & secondary trade-in schedules queried", icon: Wrench, done: progressPercent >= 80 },
    { label: "ITU-T L.1410 circular disposition & LCA pathways computed", icon: Leaf, done: progressPercent >= 95 },
  ];

  return (
    <div className="max-w-2xl mx-auto p-8 sm:p-12 rounded-3xl glass-eco-glow border border-emerald-500/40 text-center relative overflow-hidden shadow-2xl">
      {/* Background Holographic Scan Line */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent pointer-events-none animate-scan" />

      {/* Center Cinematic Radar Spinner */}
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-8 flex items-center justify-center">
        {/* Outer Orbit Ring */}
        <div className="absolute inset-0 rounded-full border border-dashed border-emerald-500/30 animate-orbit" />
        {/* Middle Pulse Ring */}
        <div className="absolute inset-3 rounded-full border border-emerald-400/40 animate-pulse-glow" />
        {/* Core Glowing Orb */}
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-xl shadow-emerald-500/40 text-slate-950">
          <Sparkles className="w-8 h-8 animate-spin" style={{ animationDuration: "12s" }} />
        </div>
      </div>

      <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold block mb-2">
        Clinical Hardware AI Reasoning
      </span>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f4f6f4] tracking-tight mb-2">
        Analyzing {device}
      </h2>
      <p className="text-xs sm:text-sm text-[#93a299] max-w-md mx-auto mb-8 font-mono">
        {stepMessage || "Cross-referencing multimodal fault observations with verified Indian pricing benchmarks..."}
      </p>

      {/* Progress Bar */}
      <div className="w-full max-w-md mx-auto h-2 bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/5 mb-8">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.min(100, Math.max(15, progressPercent))}%` }}
        />
      </div>

      {/* Step Progress Checklist */}
      <div className="max-w-md mx-auto space-y-3 text-left">
        {steps.map((st, idx) => {
          const Icon = st.icon;
          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono transition-all ${
                st.done
                  ? "bg-emerald-500/10 border-emerald-500/30 text-[#f4f6f4]"
                  : "bg-black/30 border-white/5 text-[#93a299]/60"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${st.done ? "text-emerald-400" : "text-slate-600"}`} />
                <span>{st.label}</span>
              </div>
              {st.done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-slate-700 animate-pulse shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
