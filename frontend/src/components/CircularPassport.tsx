import React from "react";
import { ShieldCheck, QrCode, Cpu, Leaf, CheckCircle2, Clock, Calendar, ArrowRight } from "lucide-react";

interface PassportEvent {
  title: string;
  date: string;
  status: "completed" | "current" | "future";
  description: string;
  badge?: string;
}

interface CircularPassportProps {
  device: string;
  brand?: string;
  releaseYear?: number;
  passportId?: string;
  currentAction?: string;
  diagnosisDate?: string;
  co2SavedKg?: number;
}

export const CircularPassport: React.FC<CircularPassportProps> = ({
  device,
  brand = "Device",
  releaseYear = 2022,
  passportId,
  currentAction = "DIAGNOSED",
  diagnosisDate,
  co2SavedKg = 48.5,
}) => {
  const pId = passportId || `CP-${brand.toUpperCase().slice(0, 3)}-${releaseYear}-${Math.floor(1000 + Math.random() * 9000)}`;
  const nowStr = diagnosisDate || new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric", day: "numeric" });

  const timelineEvents: PassportEvent[] = [
    {
      title: "Virgin Manufacturing & Retail Delivery",
      date: `Est. ${releaseYear}`,
      status: "completed",
      description: "Primary distribution and entry into active consumer service.",
      badge: "Inception",
    },
    {
      title: "ReWise AI Clinical Diagnosis",
      date: nowStr,
      status: "current",
      description: "Multimodal hardware telemetry captured; symptom-to-component fault isolated.",
      badge: currentAction.toUpperCase(),
    },
    {
      title: "Circular Disposition Execution",
      date: "Pending User Selection",
      status: "future",
      description: "Lifespan extension via OEM repair, secondary resale trade-in, or CPCB urban mining.",
      badge: "Target",
    },
    {
      title: "Closed-Loop Urban Mining & Material Recovery",
      date: "End of Lifecycle",
      status: "future",
      description: "Statutory zero-landfill extraction of pure Copper, Gold, and Cobalt.",
      badge: "CPCB 2022",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto rounded-3xl glass-eco border border-emerald-500/30 overflow-hidden shadow-2xl relative">
      {/* Background Spatial Grid Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

      {/* Passport Header */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-white/5 relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Digital Product Circular Passport</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#f4f6f4] tracking-tight">{device}</h3>
            <span className="text-xs font-mono text-[#93a299] block mt-0.5">Passport ID: {pId}</span>
          </div>

          {/* QR Code Silhouette Widget */}
          <div className="p-2.5 rounded-2xl bg-black/80 border border-emerald-500/30 flex flex-col items-center justify-center shrink-0 self-end sm:self-auto">
            {/* Authentic SVG QR Code Graphic */}
            <svg
              className="w-16 h-16 text-emerald-400"
              viewBox="0 0 100 100"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Top Left Finder */}
              <rect x="5" y="5" width="30" height="30" rx="4" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="4" />
              <rect x="13" y="13" width="14" height="14" rx="2" fill="currentColor" />
              {/* Top Right Finder */}
              <rect x="65" y="5" width="30" height="30" rx="4" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="4" />
              <rect x="73" y="13" width="14" height="14" rx="2" fill="currentColor" />
              {/* Bottom Left Finder */}
              <rect x="5" y="65" width="30" height="30" rx="4" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="4" />
              <rect x="13" y="73" width="14" height="14" rx="2" fill="currentColor" />
              {/* Data matrix dots */}
              <rect x="42" y="12" width="6" height="6" rx="1" fill="currentColor" />
              <rect x="52" y="12" width="6" height="14" rx="1" fill="currentColor" />
              <rect x="42" y="26" width="16" height="6" rx="1" fill="currentColor" />
              <rect x="12" y="44" width="14" height="6" rx="1" fill="currentColor" />
              <rect x="32" y="44" width="8" height="8" rx="1" fill="currentColor" />
              <rect x="48" y="44" width="6" height="18" rx="1" fill="currentColor" />
              <rect x="62" y="44" width="26" height="6" rx="1" fill="currentColor" />
              <rect x="74" y="56" width="14" height="6" rx="1" fill="currentColor" />
              <rect x="42" y="70" width="8" height="18" rx="1" fill="currentColor" />
              <rect x="58" y="70" width="14" height="8" rx="1" fill="currentColor" />
              <rect x="78" y="70" width="10" height="18" rx="1" fill="currentColor" />
              <rect x="58" y="84" width="14" height="6" rx="1" fill="currentColor" />
            </svg>
            <span className="text-[9px] font-mono text-[#93a299] mt-1">SCAN PASSPORT</span>
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="p-6 sm:p-8 space-y-6">
        <span className="text-xs font-mono uppercase tracking-widest text-[#93a299] block mb-2">
          Circular Lifecycle Provenance
        </span>

        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2 sm:before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-teal-500 before:to-slate-800">
          {timelineEvents.map((evt, idx) => {
            const isCurrent = evt.status === "current";
            const isPast = evt.status === "completed";

            return (
              <div key={idx} className="relative group">
                {/* Node dot */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                    isCurrent
                      ? "bg-emerald-500 border-white shadow-md shadow-emerald-500/50 scale-125"
                      : isPast
                      ? "bg-teal-400 border-slate-900"
                      : "bg-slate-900 border-slate-700"
                  }`}
                >
                  {isPast && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                </div>

                <div
                  className={`p-4 rounded-2xl transition-all ${
                    isCurrent
                      ? "bg-emerald-500/10 border border-emerald-500/40 shadow-lg shadow-emerald-950/30"
                      : "bg-black/30 border border-white/5"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-bold text-[#f4f6f4]">{evt.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#93a299]">{evt.date}</span>
                      {evt.badge && (
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded-md border ${
                            isCurrent
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-bold"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}
                        >
                          {evt.badge}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-[#93a299] leading-relaxed">{evt.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Audit Bar */}
        <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono text-[#93a299]">
          <span className="flex items-center gap-1.5">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cumulative Carbon Avoided: <strong>~{co2SavedKg} kg CO₂e</strong></span>
          </span>
          <span className="text-[10px] text-slate-400">EU ESPR 2026 & India CPCB Aligned</span>
        </div>
      </div>
    </div>
  );
};
