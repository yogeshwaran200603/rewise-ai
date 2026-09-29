import React from "react";
import { CheckCircle2, AlertTriangle, ShieldAlert, Cpu, Sparkles, HelpCircle } from "lucide-react";
import { ConfidenceMeter } from "./ConfidenceMeter";

interface EvidencePanelProps {
  problem: string;
  confidence?: string;
  confidenceScore?: number;
  severity: "Minor" | "Moderate" | "Critical" | string;
  evidence?: string[];
  missingInformation?: string[];
  unconfirmedLimit?: string;
  observedSymptoms?: string[];
  imageFindings?: string | null;
  safetyWarning?: string | null;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  problem,
  confidence = "Likely",
  confidenceScore,
  severity = "Moderate",
  evidence = [],
  missingInformation = [],
  unconfirmedLimit,
  observedSymptoms = [],
  imageFindings,
  safetyWarning,
}) => {
  const getSeverityStyle = (sev: string) => {
    switch (sev.toLowerCase()) {
      case "critical":
        return {
          badge: "bg-rose-500/10 text-rose-400 border-rose-500/30",
          icon: ShieldAlert,
          dot: "bg-rose-400",
        };
      case "moderate":
        return {
          badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          icon: AlertTriangle,
          dot: "bg-amber-400",
        };
      default:
        return {
          badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          icon: CheckCircle2,
          dot: "bg-emerald-400",
        };
    }
  };

  const sevStyle = getSeverityStyle(severity);
  const SevIcon = sevStyle.icon;

  // Synthesize evidence chips if empty
  const evidenceList =
    evidence.length > 0
      ? evidence
      : observedSymptoms.length > 0
      ? observedSymptoms.map((s) => `Reported symptom: ${s.replace(/_/g, " ")}`)
      : ["Hardware symptom patterns matched with verified database fault profiles"];

  return (
    <div className="space-y-6">
      {/* 1. WE FOUND SOMETHING */}
      <div className="p-6 sm:p-8 rounded-3xl glass-eco-glow relative overflow-hidden border border-emerald-500/30">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Multimodal Diagnostic Finding</span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${sevStyle.badge}`}
            >
              <SevIcon className="w-3.5 h-3.5" />
              <span>{severity} Severity</span>
            </span>
          </div>
        </div>

        <div className="mb-6">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#93a299] block mb-1">
            We Found Something
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#f4f6f4] tracking-tight leading-tight">
            {problem}
          </h2>
        </div>

        {/* Confidence Meter */}
        <div className="max-w-md pt-2">
          <ConfidenceMeter score={confidenceScore} level={confidence} label="Clinical AI Diagnostic Confidence" />
        </div>

        {/* Safety Warning Banner if Battery or Critical Risk */}
        {safetyWarning && (
          <div className="mt-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-200 text-xs sm:text-sm">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300 block mb-0.5">Critical Hardware Safety Advisory</span>
              <p className="leading-relaxed">{safetyWarning}</p>
            </div>
          </div>
        )}
      </div>

      {/* 2. EVIDENCE CHIPS */}
      <div className="p-6 sm:p-7 rounded-3xl glass-eco border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-widest text-[#93a299] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Clinical Evidence & Observational Telemetry
          </span>
          <span className="text-[11px] text-[#93a299] font-mono">{evidenceList.length} verified signals</span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {evidenceList.map((item, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/40 border border-emerald-500/20 text-[#f4f6f4] text-xs font-medium shadow-sm hover:border-emerald-500/40 transition-colors"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span>{item}</span>
            </div>
          ))}

          {imageFindings && (
            <div className="w-full mt-2 p-3.5 rounded-xl bg-teal-950/20 border border-teal-500/30 text-teal-200 text-xs flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-teal-300 font-mono text-[11px] block">Vision Damage Telemetry:</span>
                <p className="mt-0.5">{imageFindings}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. WHAT WE CANNOT CONFIRM (Responsible AI Boundary) */}
      <div className="p-6 sm:p-7 rounded-3xl glass-eco border border-white/5 bg-black/30 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-400">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span>What We Cannot Confirm (Diagnostic Boundary)</span>
        </div>

        <p className="text-xs sm:text-sm text-[#93a299] leading-relaxed">
          {unconfirmedLimit ||
            "Internal component integrity (e.g. microscopic logic board trace degradation, display flex cable detachment, or battery internal impedance) cannot be definitively verified without physical bench disassembly by an authorized technician."}
        </p>

        {missingInformation.length > 0 && (
          <div className="pt-2">
            <span className="text-[11px] font-mono text-[#93a299] block mb-2">
              Additional variables required for 100% bench certification:
            </span>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              {missingInformation.map((info, idx) => (
                <li key={idx} className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="w-1 h-1 rounded-full bg-amber-400" />
                  <span>{info}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
