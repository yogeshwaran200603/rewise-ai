import React from "react";
import { ExternalLink, ShieldCheck, Database, Calendar, CheckCircle2, X, Info } from "lucide-react";
import type { SourceTracking } from "../types";

interface SourceTransparencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  sources: SourceTracking[];
  freshnessNote?: string;
}

export const SourceTransparencyModal: React.FC<SourceTransparencyModalProps> = ({
  isOpen,
  onClose,
  title = "Verified Data Provenance & Sources",
  sources,
  freshnessNote = "Verified from statutory registries, OEM schedules, and secondary marketplaces via Apify pipeline.",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel-glow max-w-2xl w-full p-6 md:p-8 rounded-3xl border border-emerald-500/40 text-left animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 mb-5 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {title}
              </h3>
              <p className="text-xs text-emerald-400 font-medium">
                Ethical & Verifiable Data Collection • Zero Hallucination Guarantee
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Freshness Banner */}
        <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 mb-6 flex items-start gap-3">
          <Info className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-300 leading-relaxed">
            {freshnessNote}
          </p>
        </div>

        {/* Sources List */}
        <div className="space-y-3 mb-6">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Observed Primary Sources ({sources.length})
          </h4>

          {sources.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
              No specific external URLs listed for this estimate. Benchmark defaults applied.
            </div>
          ) : (
            sources.map((src, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-semibold text-white">{src.source_name}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                    {src.confidence.replace("_", " ").toUpperCase()}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Retrieved: {src.retrieved_at}</span>
                  </div>
                  {src.observed_price !== undefined && src.observed_price !== null && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500">Observed Value:</span>
                      <span className="text-emerald-400 font-semibold">
                        ₹{Number(src.observed_price).toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                </div>

                {src.source_url && (
                  <div className="pt-1">
                    <a
                      href={src.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 hover:underline break-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      <span>{src.source_url}</span>
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Ethical Scraper & Price Truth Notice */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
          <div className="flex items-center gap-2 text-white font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Strict Architectural AI Boundary</span>
          </div>
          <p className="leading-relaxed text-[11px] text-slate-400">
            ReWise AI uses Google Gemini Multimodal AI strictly for hardware fault diagnosis and user safety protocols.
            Gemini is never allowed to fabricate repair rates, resale quotes, or facility coordinates. All empirical data
            is gathered via the Apify collection pipeline and verified local database registries.
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
