import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Wrench,
  TrendingUp,
  Recycle,
  Sparkles,
  CheckCircle2,
  Leaf,
  ArrowRight,
  Globe2,
  ShieldAlert,
  Repeat,
} from "lucide-react";

export const Home: React.FC = () => {
  const [selectedDemoTab, setSelectedDemoTab] = useState<"screen" | "battery" | "water">("screen");

  const demoScenarios = {
    screen: {
      input: "Phone fell down yesterday. Display has vertical green lines but touch is working fine.",
      nlp: {
        event: "drop",
        active: ["vertical_lines"],
        intact: ["touch_operational", "back_glass_intact"],
      },
      diagnosis: "OLED Display Panel Substrate Damage",
      certainty: "Likely (Remote Diagnostic Limit: Flex cable vs OLED substrate requires bench test)",
      recommendation: "REPAIR (Economical lifespan extension)",
      co2e: "48.5 kg CO₂e saved",
    },
    battery: {
      input: "Phone dies within 2 hours of charging and the back cover looks slightly pushed outward.",
      nlp: {
        event: "chronic_degradation",
        active: ["rapid_drain", "back_cover_swelling"],
        intact: ["display_operational"],
      },
      diagnosis: "Lithium-Ion Battery Degradation / Cell Expansion",
      certainty: "High probability safety risk (Do not pierce or charge overnight)",
      recommendation: "REPAIR / IMMEDIATE BATTERY SWAP",
      co2e: "48.5 kg CO₂e saved",
    },
    water: {
      input: "Fell in bathtub. Tried putting in rice. Won't turn on or vibrate when plugged in.",
      nlp: {
        event: "liquid_submersion",
        active: ["no_power", "no_haptic_feedback"],
        intact: ["physical_chassis_intact"],
      },
      diagnosis: "Motherboard Short-Circuit / Liquid Corrosion",
      certainty: "Possible logic board trace failure (Unconfirmed without opening chassis)",
      recommendation: "RECYCLE / CPCB ACCREDITED URBAN MINING",
      co2e: "14.5 kg CO₂e saved",
    },
  };

  const currentDemo = demoScenarios[selectedDemoTab];

  return (
    <div className="space-y-24 py-6">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        {/* Logo Emblem in Hero */}
        <div className="flex justify-center mb-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition duration-500" />
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl p-2 bg-slate-950/80 border border-emerald-500/40 shadow-2xl flex items-center justify-center backdrop-blur-xl">
              <img
                src="/logo-icon.png"
                alt="ReWise AI Circular Emblem"
                className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(16,185,129,0.35)]"
              />
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI-Powered Circular Electronics Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.12] mb-6">
          DON'T DISCARD. <br />
          <span className="text-gradient-emerald">REWISE.</span> <br />
          <span className="text-3xl sm:text-5xl text-slate-300 font-bold block mt-2">
            Repair. Reuse. Resell. Recycle.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Every damaged device has a second chapter. ReWise combines multimodal clinical reasoning with verified secondary market pricing and CPCB compliance to guide you to the optimal circular pathway.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/diagnose"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 flex items-center justify-center gap-2.5"
          >
            <Wrench className="w-4 h-4 stroke-[2.5]" />
            <span>Diagnose My Smartphone</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-6 py-4 rounded-xl glass-panel hover:bg-slate-800/60 text-slate-200 font-semibold text-sm transition-all flex items-center justify-center gap-2"
          >
            <Globe2 className="w-4 h-4 text-emerald-400" />
            <span>View Circular Ledger</span>
          </Link>
        </div>

        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-800/60">
          <div className="p-3.5 rounded-xl glass-panel text-left">
            <span className="text-xl font-bold text-white block">100% Empirical</span>
            <span className="text-xs text-slate-400">Zero price fabrication</span>
          </div>
          <div className="p-3.5 rounded-xl glass-panel text-left">
            <span className="text-xl font-bold text-emerald-400 block">~48.5 kg CO₂e</span>
            <span className="text-xs text-slate-400">Avoided per smartphone repair</span>
          </div>
          <div className="p-3.5 rounded-xl glass-panel text-left">
            <span className="text-xl font-bold text-white block">CPCB Accredited</span>
            <span className="text-xs text-slate-400">EPR compliant recyclers</span>
          </div>
          <div className="p-3.5 rounded-xl glass-panel text-left">
            <span className="text-xl font-bold text-emerald-400 block">Up to 200 Pts</span>
            <span className="text-xs text-slate-400">Verified circular rewards</span>
          </div>
        </div>
      </section>

      {/* 2. THE E-WASTE CRISIS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs text-rose-400 font-semibold tracking-wider uppercase mb-2">
            <ShieldAlert className="w-4 h-4" /> The Growing Crisis
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            The World is Drowning in Disposable Electronics
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Electronics are the fastest-growing solid waste stream on Earth, driven by planned obsolescence and consumer discard culture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl glass-panel border border-rose-500/20 bg-gradient-to-b from-rose-950/20 to-slate-950/60">
            <span className="text-4xl font-extrabold text-rose-400 block mb-2">62 Million</span>
            <span className="text-sm font-bold text-white block mb-2">Metric Tonnes Annually</span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Global e-waste reached 62M tonnes in 2024 (UN Global E-Waste Monitor). Over 82% is discarded, burned, or dumped into unlined landfills.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-panel border border-amber-500/20 bg-gradient-to-b from-amber-950/20 to-slate-950/60">
            <span className="text-4xl font-extrabold text-amber-400 block mb-2">Toxic Leaching</span>
            <span className="text-sm font-bold text-white block mb-2">Heavy Metals in Groundwater</span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Disposed lithium-ion cells, solder, and circuit boards leach Lead, Mercury, Cadmium, and Brominated flame retardants directly into soil and drinking water.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-panel border border-emerald-500/20 bg-gradient-to-b from-emerald-950/20 to-slate-950/60">
            <span className="text-4xl font-extrabold text-emerald-400 block mb-2">Critical Loss</span>
            <span className="text-sm font-bold text-white block mb-2">Irreplaceable Mineral Depletion</span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Billions in high-purity Gold, Copper, Palladium, and Cobalt are buried forever rather than recovered through circular urban mining loops.
            </p>
          </div>
        </div>
      </section>

      {/* 3. NOT EVERY DAMAGED DEVICE IS WASTE */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl glass-panel-glow border border-emerald-500/30 bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs uppercase font-semibold block w-fit mb-3">
                Reframing Damaged Hardware
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-4">
                70% of Discarded Phones Only Need a New Screen or Battery
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                When a smartphone screen cracks or its battery degrades after 2 years, the core logic board, silicon processor, camera sensor, and memory modules remain 100% operational. Discarding the entire device is an ecological disaster.
              </p>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>80% of Emissions Preserved:</strong> Avoiding a new phone saves up to ~70kg CO₂e.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Economic Arbitrage:</strong> Replacing a ₹2,500 battery adds 24 months of full smartphone utility.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Secondary Life Utility:</strong> Unrepaired phones can still serve as dedicated smart home dash cams.</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-3xl font-extrabold text-emerald-400 block mb-1">~80%</span>
                <span className="text-xs text-slate-300 font-semibold block mb-1">Embedded Carbon</span>
                <span className="text-[11px] text-slate-500">Occurs during silicon chip wafer fabrication</span>
              </div>
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-3xl font-extrabold text-white block mb-1">+24 Mo</span>
                <span className="text-xs text-slate-300 font-semibold block mb-1">Lifespan Boost</span>
                <span className="text-[11px] text-slate-500">Average extension after timely battery repair</span>
              </div>
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-3xl font-extrabold text-teal-400 block mb-1">14g</span>
                <span className="text-xs text-slate-300 font-semibold block mb-1">Urban Metals</span>
                <span className="text-[11px] text-slate-500">Gold & copper preserved per circuit board</span>
              </div>
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-3xl font-extrabold text-blue-400 block mb-1">3x ROI</span>
                <span className="text-xs text-slate-300 font-semibold block mb-1">Trade-In Arbitrage</span>
                <span className="text-[11px] text-slate-500">Repairing before selling boosts payout</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW REWISE WORKS (5-STEP WORKFLOW) */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs uppercase font-bold text-emerald-400 tracking-widest mb-2">The Architecture</h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">How ReWise Works</h3>
          <p className="text-slate-400 text-sm mt-2">
            Five synchronized stages taking you from symptom input to verified circular action.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 rounded-2xl glass-panel relative group hover:border-emerald-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs mb-3">
                01
              </div>
              <h4 className="text-sm font-bold text-white mb-1.5">Diagnose</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Multimodal NLP + visual photo analysis decodes symptoms without assuming internal faults.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800/80 mt-4 text-[10px] text-emerald-400 font-mono">
              +10 ReWise Pts
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-panel relative group hover:border-emerald-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs mb-3">
                02
              </div>
              <h4 className="text-sm font-bold text-white mb-1.5">Repair</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Itemized parts and labor schedules from verified market benchmarks for your exact model.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800/80 mt-4 text-[10px] text-emerald-400 font-mono">
              +50 ReWise Pts
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-panel relative group hover:border-teal-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-mono font-bold text-xs mb-3">
                03
              </div>
              <h4 className="text-sm font-bold text-white mb-1.5">Reuse</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Turn functional older phones into dedicated webcams, dashcams, or smart home monitors.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800/80 mt-4 text-[10px] text-teal-400 font-mono">
              +40 ReWise Pts
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-panel relative group hover:border-blue-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-mono font-bold text-xs mb-3">
                04
              </div>
              <h4 className="text-sm font-bold text-white mb-1.5">Resell</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Trade in on secondary markets. See potential value gain if you repair before selling.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800/80 mt-4 text-[10px] text-blue-400 font-mono">
              +75 ReWise Pts
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-panel relative group hover:border-amber-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono font-bold text-xs mb-3">
                05
              </div>
              <h4 className="text-sm font-bold text-white mb-1.5">Recycle</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Route zero-value hardware to accredited CPCB recyclers for zero-landfill urban mining.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800/80 mt-4 text-[10px] text-amber-400 font-mono">
              +100 ReWise Pts
            </div>
          </div>
        </div>
      </section>

      {/* 5. AI DIAGNOSIS SHOWCASE */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs uppercase font-bold text-emerald-400 tracking-widest mb-2">Live Demonstration</h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">AI Diagnosis Showcase</h3>
          <p className="text-slate-400 text-sm mt-2">
            See how ReWise extracts clinical symptoms, enforces strict negation handling, and avoids false overconfidence.
          </p>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/60">
          {/* Tabs */}
          <div className="flex gap-2 pb-6 border-b border-slate-800">
            <button
              onClick={() => setSelectedDemoTab("screen")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedDemoTab === "screen"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "bg-slate-950 text-slate-400 hover:text-white"
              }`}
            >
              Scenario A: Drop with Green Lines
            </button>
            <button
              onClick={() => setSelectedDemoTab("battery")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedDemoTab === "battery"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "bg-slate-950 text-slate-400 hover:text-white"
              }`}
            >
              Scenario B: Battery Swelling Risk
            </button>
            <button
              onClick={() => setSelectedDemoTab("water")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedDemoTab === "water"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "bg-slate-950 text-slate-400 hover:text-white"
              }`}
            >
              Scenario C: Liquid Damage
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input & NLP */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  User Free-Text Input
                </span>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 italic">
                  "{currentDemo.input}"
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-400 block mb-1">
                  Extracted Clinical Entities (No Overconfidence)
                </span>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Trigger Event:</span>
                    <span className="font-bold text-amber-400">{currentDemo.nlp.event}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Active Symptoms:</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {currentDemo.nlp.active.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-[11px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Confirmed Intact / Negated:</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {currentDemo.nlp.intact.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 text-[11px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnostic Output */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-teal-400 block mb-1">
                  ReWise Probabilistic Assessment
                </span>
                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2.5">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Probable Issue:</span>
                    <h4 className="text-sm font-bold text-white">{currentDemo.diagnosis}</h4>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-400 uppercase font-semibold">Diagnostic Certainty:</span>
                    <p className="text-xs text-slate-300 leading-snug">{currentDemo.certainty}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Path Recommendation:</span>
                    <span className="font-bold text-emerald-400">{currentDemo.recommendation}</span>
                  </div>
                  <div className="text-[11px] text-teal-300 font-mono">
                    Impact: {currentDemo.co2e}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <Link
                  to="/diagnose"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  <span>Test with your own device</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CIRCULAR COMPARISON MATRIX */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs uppercase font-bold text-emerald-400 tracking-widest mb-2">Decision Framework</h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Circular Comparison Matrix</h3>
          <p className="text-slate-400 text-sm mt-2">
            Compare all four circular pathways across key economic and sustainability factors.
          </p>
        </div>

        <div className="overflow-x-auto glass-panel rounded-3xl border border-slate-800 bg-slate-900/60 p-1">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[10px] uppercase font-mono text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Pathway</th>
                <th className="p-4">Financial Cost</th>
                <th className="p-4">Lifespan Extension</th>
                <th className="p-4">CO₂e Avoided</th>
                <th className="p-4">Convenience</th>
                <th className="p-4">ReWise Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr className="hover:bg-slate-850/40">
                <td className="p-4 font-bold text-emerald-400 flex items-center gap-2">
                  <Wrench className="w-4 h-4" /> REPAIR
                </td>
                <td className="p-4">Low to Moderate (₹1,500 - ₹5,000)</td>
                <td className="p-4 text-emerald-400 font-semibold">+18 to 36 Months</td>
                <td className="p-4 font-bold text-emerald-400">~48.5 kg CO₂e</td>
                <td className="p-4">1-2 hours at authorized hub</td>
                <td className="p-4 font-mono font-bold text-amber-400">+50 Pts</td>
              </tr>
              <tr className="hover:bg-slate-850/40">
                <td className="p-4 font-bold text-teal-400 flex items-center gap-2">
                  <Repeat className="w-4 h-4" /> REUSE
                </td>
                <td className="p-4">₹0 (Zero financial outlay)</td>
                <td className="p-4 text-teal-400 font-semibold">+24+ Months (Second life)</td>
                <td className="p-4 font-bold text-teal-400">~42.0 kg CO₂e</td>
                <td className="p-4">Immediate home setup</td>
                <td className="p-4 font-mono font-bold text-amber-400">+40 Pts</td>
              </tr>
              <tr className="hover:bg-slate-850/40">
                <td className="p-4 font-bold text-blue-400 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> RESELL
                </td>
                <td className="p-4 text-emerald-400 font-semibold">Positive Cash Inflow</td>
                <td className="p-4 text-blue-400 font-semibold">Recirculated in secondary market</td>
                <td className="p-4 font-bold text-blue-400">~39.0 kg CO₂e</td>
                <td className="p-4">Doorstep trade-in inspection</td>
                <td className="p-4 font-mono font-bold text-amber-400">+75 Pts</td>
              </tr>
              <tr className="hover:bg-slate-850/40">
                <td className="p-4 font-bold text-amber-400 flex items-center gap-2">
                  <Recycle className="w-4 h-4" /> RECYCLE
                </td>
                <td className="p-4">₹0 (Free CPCB drop-off)</td>
                <td className="p-4 text-slate-400">End of hardware lifecycle</td>
                <td className="p-4 font-bold text-amber-400">~14.5 kg CO₂e</td>
                <td className="p-4">CPCB authorized bin or hub</td>
                <td className="p-4 font-mono font-bold text-amber-400">+100 Pts</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 7. CIRCULAR ECONOMY VISUALIZATION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl glass-panel border border-slate-800 bg-slate-900/40 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xs uppercase font-bold text-emerald-400 tracking-widest mb-2">Systems Thinking</h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              The Circular Economy Loops
            </h3>
            <p className="text-slate-400 text-sm mt-2">
              Linear "take-make-waste" destroys resource value. Circular loops keep high-entropy materials intact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-3">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono uppercase font-bold">
                Inner Loop • Most Efficient
              </span>
              <h4 className="text-base font-bold text-white">Repair & Maintenance</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Keeps the complete product in active service with minimum added energy. Replaces only the worn display or battery cell.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/80 border border-blue-500/30 space-y-3">
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-mono uppercase font-bold">
                Middle Loop • Redistribution
              </span>
              <h4 className="text-base font-bold text-white">Reuse & Resell</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Circulates devices to second owners or repurposes them locally into dedicated smart accessories. Avoids manufacturing a new unit.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-3">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-mono uppercase font-bold">
                Outer Loop • Urban Mining
              </span>
              <h4 className="text-base font-bold text-white">Smelting & Recycling</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Chemical and pyrometallurgical recovery of high-purity elemental metals (Au, Ag, Cu, Co) to re-enter industrial supply chains.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. ENVIRONMENTAL IMPACT METHODOLOGY */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl glass-panel-glow border border-emerald-500/30 bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
                <Leaf className="w-4 h-4" /> Scientific Provenance
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-4">
                How We Compute Environmental Impact
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                We reject greenwashing and made-up carbon offsets. Every carbon calculation in ReWise follows standard life-cycle assessment (LCA) equations:
              </p>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 mb-4">
                CO₂e_saved = LCA_new_phone (65kg) - LCA_replacement_part (6.5kg)
              </div>
              <p className="text-xs text-slate-400">
                Data sources: ITU-T Recommendation L.1410 (ICT LCA methodology), WEEE Forum Benchmark 2023, and CPCB E-Waste Annual Assessment.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="font-bold text-white block mb-1">E-Waste Avoidance (0.18 kg)</span>
                <span className="text-slate-400">
                  Calculated from average smartphone curb weight across 93 smartphone models in our benchmark database.
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="font-bold text-white block mb-1">Lifespan Extension (+24 Months)</span>
                <span className="text-slate-400">
                  Empirical longevity data indicating refurbished and battery-replaced devices remain functional for 2 additional years.
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="font-bold text-white block mb-1">Urban Mining Recovery (~14g)</span>
                <span className="text-slate-400">
                  Recovered pure elemental mass including Copper (~12g), Gold (~0.03g), Silver (~0.3g), and rare earth magnets.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. REWARDS SYSTEM */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs uppercase font-bold text-emerald-400 tracking-widest mb-2">Incentive Architecture</h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Earn ReWise Green Points
          </h3>
          <p className="text-slate-400 text-sm mt-2">
            Every positive circular action is credited to your ledger with automated 30-minute anti-farming protection.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="p-5 rounded-2xl glass-panel text-center">
            <span className="text-2xl font-extrabold text-amber-400 block mb-1">+10</span>
            <span className="text-xs font-semibold text-white block mb-1">Diagnosis</span>
            <span className="text-[10px] text-slate-400">Evaluating device</span>
          </div>
          <div className="p-5 rounded-2xl glass-panel text-center">
            <span className="text-2xl font-extrabold text-emerald-400 block mb-1">+50</span>
            <span className="text-xs font-semibold text-white block mb-1">Repair</span>
            <span className="text-[10px] text-slate-400">Hardware fix logged</span>
          </div>
          <div className="p-5 rounded-2xl glass-panel text-center">
            <span className="text-2xl font-extrabold text-teal-400 block mb-1">+40</span>
            <span className="text-xs font-semibold text-white block mb-1">Reuse</span>
            <span className="text-[10px] text-slate-400">Second-life setup</span>
          </div>
          <div className="p-5 rounded-2xl glass-panel text-center">
            <span className="text-2xl font-extrabold text-blue-400 block mb-1">+75</span>
            <span className="text-xs font-semibold text-white block mb-1">Resell</span>
            <span className="text-[10px] text-slate-400">Trade-in verified</span>
          </div>
          <div className="p-5 rounded-2xl glass-panel text-center col-span-2 sm:col-span-1">
            <span className="text-2xl font-extrabold text-amber-400 block mb-1">+100</span>
            <span className="text-xs font-semibold text-white block mb-1">Recycle</span>
            <span className="text-[10px] text-slate-400">CPCB drop-off</span>
          </div>
        </div>
      </section>

      {/* 10. FINAL CTA */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        <div className="p-10 rounded-3xl glass-panel-glow border border-emerald-500/30">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Ready to Extend Your Device's Life?
          </h3>
          <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto mb-6">
            Get an instant AI diagnosis, view real part and labor costs, and choose between repair, reuse, resale, or safe e-waste recycling in less than two minutes.
          </p>
          <Link
            to="/diagnose"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/30"
          >
            <Wrench className="w-4 h-4" /> Start Device Diagnosis
          </Link>
        </div>
      </section>
    </div>
  );
};
