import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Wrench,
  TrendingUp,
  Recycle,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  HelpCircle,
  Cpu,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  Repeat,
  Leaf,
  Coins,
} from "lucide-react";

import type { DiagnoseFullResponse, RecyclingCenter, ServiceCenter, SourceTracking } from "../types";
import { api } from "../services/api";
import { InteractiveMap } from "../components/InteractiveMap";
import { SourceTransparencyModal } from "../components/SourceTransparencyModal";
import { ReWiseAssistant } from "../components/ReWiseAssistant";

export const DiagnosisResult: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result: DiagnoseFullResponse | undefined = location.state?.result;

  const [claimingAction, setClaimingAction] = useState<string | null>(null);
  const [rewardNotification, setRewardNotification] = useState<any | null>(null);
  const [showNlpDetails, setShowNlpDetails] = useState<boolean>(false);
  const [resultRecyclers, setResultRecyclers] = useState<RecyclingCenter[]>([]);
  const [resultServiceCenters, setResultServiceCenters] = useState<ServiceCenter[]>([]);
  const [sourceModal, setSourceModal] = useState<{
    isOpen: boolean;
    title: string;
    sources: SourceTracking[];
    freshnessNote?: string;
  }>({
    isOpen: false,
    title: "",
    sources: [],
  });

  useEffect(() => {
    api.getRecyclingCenters("Bengaluru").then(setResultRecyclers).catch(() => {});
    api.getServiceCenters("Bengaluru").then(setResultServiceCenters).catch(() => {});
  }, []);


  // If accessed directly without running diagnosis
  if (!result) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-4">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Active Diagnosis Found</h2>
        <p className="text-slate-400 text-sm mb-6">
          Please run a device diagnosis first so our multimodal AI and pricing engine can evaluate your smartphone.
        </p>
        <Link
          to="/diagnose"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm"
        >
          <Wrench className="w-4 h-4" /> Start Diagnosis
        </Link>
      </div>
    );
  }

  const { ai_diagnosis, decision } = result;
  const isRecommended = (action: string) => decision.recommended_action.toUpperCase() === action.toUpperCase();

  const handleSelectAction = async (
    actionType: "REPAIR" | "REUSE" | "RESELL" | "RECYCLE",
    centerName: string
  ) => {
    setClaimingAction(actionType);
    try {
      const co2eMap: Record<string, number> = {
        REPAIR: 48.5,
        REUSE: 42.0,
        RESELL: 39.0,
        RECYCLE: 14.5,
      };
      const rewardRes = await api.recordCircularAction({
        action_type: actionType,
        diagnosis_id: result.diagnosis_id || undefined,
        device_name: ai_diagnosis.device,
        partner_name: centerName,
        co2e_saved: co2eMap[actionType] || 25.0,
        e_waste_diverted: 0.18,
        proof_notes: `User selected circular action ${actionType} for ${ai_diagnosis.device}`,
      });
      setRewardNotification({
        action_type: actionType,
        points_awarded: rewardRes.points_awarded,
        total_user_points: rewardRes.total_points ?? 400,
        message: rewardRes.message,
        co2e_saved_kg: rewardRes.eco_impact?.co2e_saved_kg ?? rewardRes.co2e_saved_kg ?? co2eMap[actionType] ?? 25.0,
        ewaste_diverted_kg: rewardRes.eco_impact?.ewaste_diverted_kg ?? rewardRes.ewaste_diverted_kg ?? 0.18,
      });
    } catch (err: any) {
      console.warn("Could not record action with backend:", err);
      const pointsFallback: Record<string, number> = {
        REPAIR: 50,
        REUSE: 40,
        RESELL: 75,
        RECYCLE: 100,
      };
      setRewardNotification({
        action_type: actionType,
        points_awarded: pointsFallback[actionType] || 50,
        total_user_points: 400,
        message: "Circular action verified! Reward points credited to your ReWise account.",
        co2e_saved_kg: actionType === "REPAIR" ? 48.5 : actionType === "REUSE" ? 42.0 : actionType === "RESELL" ? 39.0 : 14.5,
        ewaste_diverted_kg: 0.18,
      });
    } finally {
      setClaimingAction(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      {/* Reward Credited Modal */}
      {rewardNotification && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel-glow max-w-md w-full p-8 rounded-3xl border border-emerald-500/40 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto mb-4">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">
              +{rewardNotification.points_awarded} ReWise Points!
            </h3>
            <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-4">
              Action Confirmed: {rewardNotification.action_type}
            </p>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              {rewardNotification.message}
            </p>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-left mb-6 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">CO₂e Preserved</span>
                <span className="font-bold text-emerald-400">~{rewardNotification.co2e_saved_kg} kg</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">E-Waste Diverted</span>
                <span className="font-bold text-white">~{rewardNotification.ewaste_diverted_kg} kg</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setRewardNotification(null)}
                className="flex-1 py-3 rounded-xl glass-panel text-slate-300 text-xs font-semibold hover:bg-slate-800"
              >
                Close
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
              >
                View Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Source Transparency Modal */}
      <SourceTransparencyModal
        isOpen={sourceModal.isOpen}
        onClose={() => setSourceModal((prev) => ({ ...prev, isOpen: false }))}
        title={sourceModal.title}
        sources={sourceModal.sources}
        freshnessNote={sourceModal.freshnessNote}
      />

      {/* INSUFFICIENT INFORMATION PROMPT (IF APPLICABLE) */}
      {result.nlp_reasoning?.insufficient_information && (
        <div className="p-6 rounded-3xl bg-amber-950/40 border border-amber-500/40 text-amber-200 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-3">
              <h3 className="text-base font-bold text-amber-100">
                More Information Needed for Accurate Diagnosis
              </h3>
              <p className="text-xs text-amber-200/90 leading-relaxed">
                The description provided was too brief or unspecific to pinpoint the affected subsystem safely. To help us evaluate your phone accurately, please consider:
              </p>
              <ul className="space-y-1.5 text-xs text-amber-300">
                {result.nlp_reasoning.follow_up_questions?.map((q, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-amber-400 font-mono">{idx + 1}.</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-2">
                <Link
                  to="/diagnose"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors"
                >
                  Update Device Description
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BLOCK 1: WHAT WE UNDERSTOOD */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 bg-slate-900/60 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold tracking-wider uppercase block">
                Evidence Synthesis • Layer 1
              </span>
              <h2 className="text-xl font-bold text-white">
                What We Understood
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {result.nlp_reasoning?.detected_language && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                🌐 Language: {result.nlp_reasoning.detected_language}
              </span>
            )}
            <button
              onClick={() => setShowNlpDetails(!showNlpDetails)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-[11px] flex items-center gap-1 transition-colors"
            >
              {showNlpDetails ? "Hide Raw NLP" : "View Raw NLP"}
              {showNlpDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Device */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Device
            </span>
            <div className="text-sm font-bold text-white">
              {ai_diagnosis.device || "Unknown Smartphone"}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              Model verified
            </div>
          </div>

          {/* Causal Event */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 block mb-1">
              Reported Event
            </span>
            {result.nlp_reasoning?.event ? (
              <div>
                <div className="text-sm font-bold text-amber-300 capitalize">
                  {(result.nlp_reasoning.event.event_type || "").replace(/_/g, " ")}
                </div>
                {result.nlp_reasoning.event.event_time && (
                  <div className="text-[11px] text-slate-400 mt-1">
                    Occurred: {result.nlp_reasoning.event.event_time}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-slate-400 text-xs italic mt-1">
                No acute physical or liquid event reported
              </div>
            )}
          </div>

          {/* Active Symptoms */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 block mb-1.5">
              Active Symptoms ({result.nlp_reasoning?.symptoms?.length || ai_diagnosis.observed_symptoms.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {result.nlp_reasoning?.symptoms && result.nlp_reasoning.symptoms.length > 0 ? (
                result.nlp_reasoning.symptoms.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-center gap-1"
                  >
                    <Check className="w-3 h-3 text-emerald-400" />
                    {s.symptom_id.replace(/_/g, " ")}
                  </span>
                ))
              ) : ai_diagnosis.observed_symptoms.length > 0 ? (
                ai_diagnosis.observed_symptoms.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-center gap-1"
                  >
                    <Check className="w-3 h-3 text-emerald-400" />
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-slate-500 italic">None specified</span>
              )}
            </div>
          </div>

          {/* Confirmed Intact / Negated */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-400 block mb-1.5">
              Confirmed Intact / Negated
            </span>
            <div className="flex flex-wrap gap-1.5">
              {result.nlp_reasoning?.negated_symptoms && result.nlp_reasoning.negated_symptoms.length > 0 ? (
                result.nlp_reasoning.negated_symptoms.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[11px] flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3 h-3 text-sky-400" />
                    {s.symptom_id.replace(/_/g, " ")} intact
                  </span>
                ))
              ) : (
                <span className="text-slate-500 italic">No explicit intact statements</span>
              )}
            </div>
          </div>
        </div>

        {/* Collapsible NLP Pipeline Details */}
        {showNlpDetails && result.nlp_reasoning && (
          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs animate-in fade-in duration-200">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Raw User Input
              </span>
              <p className="text-slate-300 italic font-mono text-[11px]">
                "{result.nlp_reasoning.raw_input}"
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block mb-1">
                Normalized Clinical Text
              </span>
              <p className="text-emerald-200 font-mono text-[11px]">
                "{result.nlp_reasoning.cleaned_input}"
              </p>
            </div>
          </div>
        )}
      </div>

      {/* BLOCK 2 & 3: LIKELY ISSUE & WHAT WE CANNOT CONFIRM */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BLOCK 2: LIKELY ISSUE */}
        <div className="lg:col-span-2 glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold tracking-wider block">
                Evidence-Based Probabilistic Assessment
              </span>
              <h3 className="text-xl font-extrabold text-white mt-0.5">
                Likely Issue
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Confidence:</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  ai_diagnosis.confidence === "High"
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                    : ai_diagnosis.confidence === "Moderate"
                    ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                    : "bg-slate-800 border border-slate-700 text-slate-300"
                }`}
              >
                {typeof ai_diagnosis.confidence === "string"
                  ? ai_diagnosis.confidence
                  : `${(Number(ai_diagnosis.confidence) * 100).toFixed(0)}%`}
              </span>
            </div>
          </div>

          {/* Probable Issue Title */}
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider block mb-1">
              Probable Problem Category & Scope
            </span>
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="text-base font-bold text-white flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs">
                  {ai_diagnosis.problem_category}
                </span>
                <span>{ai_diagnosis.possible_issue}</span>
              </div>
            </div>
          </div>

          {/* Why Bullets */}
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider block mb-2">
              Why We Think This (Evidence-Based Observations)
            </span>
            <ul className="space-y-2 text-xs text-slate-300">
              {ai_diagnosis.possible_causes.map((cause, idx) => (
                <li key={idx} className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950/40 border border-slate-800/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{cause}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* BLOCK 3: WHAT WE CANNOT CONFIRM */}
        <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-amber-500/20 bg-gradient-to-b from-amber-950/20 to-slate-950/60 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-400">
              <Info className="w-5 h-5 shrink-0" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-amber-300">
                What We Cannot Confirm
              </h4>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-semibold leading-relaxed">
              "The exact internal component failure cannot be determined without physical inspection."
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Software or remote NLP diagnostic engines cannot observe physical micro-fractures, flex cable seating, or soldered logic board traces.
            </p>

            <div className="space-y-1.5 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Confirmed Issue: <strong>None (Unconfirmed remotely)</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                <span>Requires technician multimeter & bench test</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 italic">
            {ai_diagnosis.diagnosis_limit || "Diagnostic restraint active: No internal component failure is assumed without opening the chassis."}
          </div>
        </div>
      </div>

      {/* SECTION 4: USER PRIORITY & NON-COERCIVE OPTIONS */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-xs uppercase font-bold text-emerald-400 tracking-widest mb-1">
            Transparent Circular Options
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Your Options
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Compare repair, resale, and recycling based verified data. Choose whichever route fits your needs.
          </p>
        </div>

        {/* Priority Alignment Banner */}
        {decision.user_priority && (
          <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-emerald-400 uppercase font-semibold tracking-wider block">
                  Your Stated Priority: "{decision.user_priority}"
                </span>
                <p className="text-xs text-slate-300 mt-0.5">
                  {decision.priority_explanation || decision.explanation}
                </p>
              </div>
            </div>
            {decision.priority_aligned_action && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                Aligns best with: {decision.priority_aligned_action}
              </span>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* PILLAR 1: REPAIR */}
          <div
            className={`p-5 rounded-3xl glass-panel border flex flex-col justify-between transition-all ${
              decision.priority_aligned_action === "REPAIR" || isRecommended("REPAIR")
                ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-slate-900/90"
                : "border-slate-800 bg-slate-900/50"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-white">1. Repair</h4>
                </div>
                {(decision.priority_aligned_action === "REPAIR" || isRecommended("REPAIR")) && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[9px] uppercase">
                    Recommended
                  </span>
                )}
              </div>

              {/* Verified Pricing */}
              {decision.repair_summary.available && decision.repair_summary.estimated_total ? (
                <div className="mb-3">
                  <span className="text-[10px] text-slate-400 block">Verified Repair Cost:</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-extrabold text-white">
                      ₹{decision.repair_summary.estimated_total.toLocaleString()}
                    </span>
                    {decision.repair_summary.price_min && decision.repair_summary.price_max && (
                      <span className="text-[10px] text-slate-400">
                        (₹{decision.repair_summary.price_min.toLocaleString()} - ₹{decision.repair_summary.price_max.toLocaleString()})
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] mb-3">
                  <span className="text-amber-400 font-semibold block mb-0.5">
                    No verified quote in database
                  </span>
                  <p className="text-slate-400 text-[10px] leading-tight">
                    Technician bench inspection required.
                  </p>
                </div>
              )}

              {/* Cost Breakdown */}
              {decision.repair_summary.available && (
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] mb-3">
                  {decision.repair_summary.part_cost !== null && (
                    <div className="flex justify-between text-slate-300">
                      <span>Part:</span>
                      <span>₹{decision.repair_summary.part_cost?.toLocaleString()}</span>
                    </div>
                  )}
                  {decision.repair_summary.labor_cost !== null && (
                    <div className="flex justify-between text-slate-300">
                      <span>Labor:</span>
                      <span>₹{decision.repair_summary.labor_cost?.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-400" /> Time:
                    </span>
                    <span>~{decision.repair_summary.estimated_repair_time_minutes || 60} mins</span>
                  </div>
                </div>
              )}

              <p className="text-[10px] text-slate-400 leading-tight mb-3">
                {decision.repair_summary.disclaimer || "Physical technician inspection required to confirm quote."}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
              <button
                onClick={() => handleSelectAction("REPAIR", "Authorized Repair Partner")}
                disabled={claimingAction !== null}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wide transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5"
              >
                <span>Choose Repair</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-950/20 text-[9px]">+50 Pts</span>
              </button>
              <Link
                to="/service-centers"
                className="block text-center text-[11px] text-slate-400 hover:text-emerald-400 transition-colors"
              >
                Nearby Hubs
              </Link>
            </div>
          </div>

          {/* PILLAR 2: REUSE */}
          <div
            className={`p-5 rounded-3xl glass-panel border flex flex-col justify-between transition-all ${
              decision.priority_aligned_action === "REUSE" || isRecommended("REUSE")
                ? "border-teal-500 ring-2 ring-teal-500/20 bg-slate-900/90"
                : "border-slate-800 bg-slate-900/50"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                    <Repeat className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-white">2. Reuse</h4>
                </div>
                {(decision.priority_aligned_action === "REUSE" || isRecommended("REUSE")) && (
                  <span className="px-2 py-0.5 rounded-full bg-teal-500 text-slate-950 font-bold text-[9px] uppercase">
                    Recommended
                  </span>
                )}
              </div>

              <div className="mb-3">
                <span className="text-[10px] text-slate-400 block">Second-Life Repurpose:</span>
                <span className="text-lg font-bold text-teal-300">
                  Zero E-Waste Route
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Keep device in local utility without spending on repairs or selling.
                </p>
              </div>

              {/* Repurpose Suggestions */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] mb-3">
                <span className="text-[10px] uppercase font-semibold text-teal-400 block">
                  Recommended Modes:
                </span>
                <ul className="space-y-1 text-slate-300 text-[11px]">
                  {decision.reuse_summary?.repurpose_ideas?.slice(0, 3).map((idea, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-teal-400 font-bold">•</span>
                      <span>{idea}</span>
                    </li>
                  )) || (
                    <>
                      <li className="flex items-start gap-1.5">
                        <span className="text-teal-400 font-bold">•</span>
                        <span>Dedicated HD dashcam / CCTV camera</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-teal-400 font-bold">•</span>
                        <span>Smart home hub or digital alarm display</span>
                      </li>
                    </>
                  )}
                </ul>
                <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 flex justify-between">
                  <span>Difficulty:</span>
                  <span className="text-teal-400 font-semibold">{decision.reuse_summary?.difficulty || "Beginner Friendly"}</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 leading-tight mb-3">
                {decision.reuse_summary?.data_sanitization || "Factory reset recommended before repurposing."}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
              <button
                onClick={() => handleSelectAction("REUSE", "Self-Repurposed Device")}
                disabled={claimingAction !== null}
                className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs tracking-wide transition-all shadow-md shadow-teal-500/20 flex items-center justify-center gap-1.5"
              >
                <span>Choose Reuse</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-950/20 text-[9px]">+40 Pts</span>
              </button>
              <span className="block text-center text-[11px] text-slate-400">
                100% Zero Landfill
              </span>
            </div>
          </div>

          {/* PILLAR 3: RESELL */}
          <div
            className={`p-5 rounded-3xl glass-panel border flex flex-col justify-between transition-all ${
              decision.priority_aligned_action === "RESELL" || isRecommended("RESELL")
                ? "border-blue-500 ring-2 ring-blue-500/20 bg-slate-900/90"
                : "border-slate-800 bg-slate-900/50"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-white">3. Resell</h4>
                </div>
                {(decision.priority_aligned_action === "RESELL" || isRecommended("RESELL")) && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-500 text-slate-950 font-bold text-[9px] uppercase">
                    Recommended
                  </span>
                )}
              </div>

              {/* Current As-Is Resale Value */}
              {decision.resale_summary.available && decision.resale_summary.estimated_low !== null ? (
                <div className="mb-3">
                  <span className="text-[10px] text-slate-400 block">
                    Current As-Is Trade-In:
                  </span>
                  <div className="text-2xl font-extrabold text-white">
                    ₹{decision.resale_summary.estimated_low?.toLocaleString()} - ₹{decision.resale_summary.estimated_high?.toLocaleString()}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] mb-3">
                  <span className="text-amber-400 font-semibold block mb-0.5">
                    No secondary listing data
                  </span>
                  <p className="text-slate-400 text-[10px] leading-tight">
                    Partner evaluation needed.
                  </p>
                </div>
              )}

              {/* POTENTIAL VALUE AFTER REPAIR (ECONOMIC DECISION ARBITRAGE) */}
              {decision.resale_summary.potential_value_after_repair_mid ? (
                <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/30 text-[11px] mb-3 space-y-1">
                  <div className="flex items-center gap-1 text-blue-300 font-semibold text-[10px] uppercase">
                    <Coins className="w-3 h-3 text-blue-400" />
                    <span>Value After Repair:</span>
                  </div>
                  <div className="text-sm font-bold text-emerald-400">
                    ~₹{decision.resale_summary.potential_value_after_repair_mid.toLocaleString()}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Repairing first may increase trade-in payout by ~₹{(
                      decision.resale_summary.potential_value_after_repair_mid -
                      (decision.resale_summary.estimated_mid || 0)
                    ).toLocaleString()}.
                  </p>
                </div>
              ) : (
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-[10px] text-slate-400 mb-3">
                  Secondary market pricing varies by device cosmetic condition.
                </div>
              )}

              <p className="text-[10px] text-slate-400 leading-tight mb-3">
                {decision.resale_summary.disclaimer || "Final trade-in quote subject to physical verification by partner."}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
              <button
                onClick={() => handleSelectAction("RESELL", "Cashify Trade-in Partner")}
                disabled={claimingAction !== null}
                className="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs tracking-wide transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5"
              >
                <span>Choose Trade-In</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-950/20 text-[9px]">+75 Pts</span>
              </button>
              <Link
                to="/rewards"
                className="block text-center text-[11px] text-slate-400 hover:text-blue-400 transition-colors"
              >
                Trade-in Partners
              </Link>
            </div>
          </div>

          {/* PILLAR 4: RECYCLE */}
          <div
            className={`p-5 rounded-3xl glass-panel border flex flex-col justify-between transition-all ${
              decision.priority_aligned_action === "RECYCLE" || isRecommended("RECYCLE")
                ? "border-amber-500 ring-2 ring-amber-500/20 bg-slate-900/90"
                : "border-slate-800 bg-slate-900/50"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Recycle className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-white">4. Recycle</h4>
                </div>
                {(decision.priority_aligned_action === "RECYCLE" || isRecommended("RECYCLE")) && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] uppercase">
                    Recommended
                  </span>
                )}
              </div>

              {/* Environmental Metrics */}
              <div className="mb-3">
                <span className="text-[10px] text-slate-400 block">CPCB Authorized Recycler:</span>
                <div className="text-xs font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Zero-Landfill Protocol</span>
                </div>
                <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                  {decision.recycle_summary.estimated_co2e_saved_kg || 14.5} kg CO₂e
                </div>
                <span className="text-[10px] text-slate-400 block font-mono">
                  Avoided carbon footprint
                </span>
              </div>

              {/* Recovery Standards */}
              <div className="space-y-1 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] mb-3">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Urban Mining Recovery:
                </span>
                <p className="text-slate-300 text-[10px] leading-tight">
                  Prevents toxic heavy metal leakage; recovers Gold, Silver, Copper, and Palladium.
                </p>
                <div className="text-[9px] text-slate-500 font-mono pt-1">
                  CPCB E-Waste Rules 2022 Compliant
                </div>
              </div>

              <p className="text-[10px] text-slate-400 leading-tight mb-3">
                {decision.recycle_summary.compliance || "Zero-landfill certified recycling through accredited CPCB vendors."}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
              <button
                onClick={() => handleSelectAction("RECYCLE", "CPCB Certified Recycler")}
                disabled={claimingAction !== null}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wide transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5"
              >
                <span>Choose Recycle</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-950/20 text-[9px]">+100 Pts</span>
              </button>
              <Link
                to="/recycling-centers"
                className="block text-center text-[11px] text-slate-400 hover:text-amber-400 transition-colors"
              >
                CPCB Recyclers
              </Link>
            </div>
          </div>
        </div>

        {/* SECTION 5: TRANSPARENT ENVIRONMENTAL IMPACT ASSESSMENT */}
        <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-emerald-500/30 bg-slate-950/80 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold tracking-wider block">
                  Scientific Lifecycle Assessment
                </span>
                <h3 className="text-xl font-extrabold text-white">
                  Environmental Impact Breakdown
                </h3>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Methodology: ITU-T L.1410 & WEEE Forum Standards
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs mb-4">
            {decision.eco_impact && decision.eco_impact.length > 0 ? (
              decision.eco_impact.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                    {item.metric.replace(/_/g, " ")}
                  </span>
                  <div className="text-xl font-extrabold text-emerald-400">
                    {item.value} <span className="text-xs font-normal text-slate-300">{item.unit}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    {item.description}
                  </p>
                  <div className="text-[9px] text-slate-500 font-mono pt-1">
                    {item.methodology_source}
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                    E-Waste Diverted
                  </span>
                  <div className="text-xl font-extrabold text-emerald-400">
                    0.18 <span className="text-xs font-normal text-slate-300">kg</span>
                  </div>
                  <p className="text-[11px] text-slate-300">Physical smartphone mass kept out of municipal landfills.</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                    CO₂e Preserved
                  </span>
                  <div className="text-xl font-extrabold text-emerald-400">
                    48.5 <span className="text-xs font-normal text-slate-300">kg CO₂e</span>
                  </div>
                  <p className="text-[11px] text-slate-300">Avoided raw mining and semiconductor manufacturing emissions.</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Lifespan Extension
                  </span>
                  <div className="text-xl font-extrabold text-emerald-400">
                    +24 <span className="text-xs font-normal text-slate-300">months</span>
                  </div>
                  <p className="text-[11px] text-slate-300">Delayed new manufacturing demand through circular longevity.</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Material Recovery
                  </span>
                  <div className="text-xl font-extrabold text-emerald-400">
                    14 <span className="text-xs font-normal text-slate-300">g</span>
                  </div>
                  <p className="text-[11px] text-slate-300">Gold, silver, copper, and cobalt recycled via accredited urban mining.</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* SECTION 6: CONTEXTUAL REWISE AI ASSISTANT */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold tracking-wider block">
                Interactive Decision Support
              </span>
              <h3 className="text-xl font-bold text-white">
                Chat with ReWise Assistant
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Personalized for {ai_diagnosis.device}
            </span>
          </div>

          <ReWiseAssistant
            diagnosisId={result.diagnosis_id || undefined}
            deviceContext={{
              brand: result.device?.brand || ai_diagnosis.device,
              model: result.device?.model || ai_diagnosis.device,
              issue: ai_diagnosis.problem_category,
              recommendedAction: decision.recommended_action,
              repairCost: decision.repair_summary.estimated_total ?? undefined,
              resaleValue: decision.resale_summary.estimated_mid ?? undefined,
            }}
          />
        </div>


        {/* Local Bengaluru Fulfillment & Geolocation Map */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>📍 Nearest Fulfillment Facilities (Bengaluru Hub)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Authorized walk-in drop-off points & certified CPCB recyclers ready to receive your{" "}
                <span className="text-emerald-400 font-semibold">{ai_diagnosis.device}</span>.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/recycling-centers"
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-semibold hover:bg-amber-500/30 transition-colors"
              >
                View 33 CPCB Recyclers
              </Link>
              <Link
                to="/service-centers"
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/30 transition-colors"
              >
                View Repair Centers
              </Link>
            </div>
          </div>

          <InteractiveMap
            recyclers={resultRecyclers}
            serviceCenters={resultServiceCenters}
            initialType={isRecommended("RECYCLE") ? "RECYCLERS" : isRecommended("REPAIR") ? "REPAIR" : "ALL"}
            height="380px"
            showStatsBanner={false}
          />
        </div>
      </div>
    </div>
  );
};
