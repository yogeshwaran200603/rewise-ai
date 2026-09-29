import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Wrench,
  RotateCw,
  TrendingUp,
  Recycle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Leaf,
  Layers,
  Activity,
  CheckCircle2,
  HelpCircle,
  Cpu,
  BarChart3,
  QrCode,
  Globe2,
} from "lucide-react";
import { CircularDeviceOrbit } from "../components/CircularDeviceOrbit";
import { EcoMetric } from "../components/EcoMetric";

export const Home: React.FC = () => {
  const [selectedDemoTab, setSelectedDemoTab] = useState<"screen" | "battery" | "water">("screen");

  const demoScenarios = {
    screen: {
      title: "Display Substrate & Digitizer Impact",
      input: "Phone fell down yesterday. Display has vertical green lines but touch is working fine.",
      nlp: {
        event: "Drop Impact",
        active: ["Vertical Green Lines", "OLED Substrate Fracture"],
        intact: ["Touch Digitizer Operational", "Rear Glass Intact"],
      },
      diagnosis: "OLED Display Substrate Compression Damage",
      certainty: "Likely",
      cannotConfirm: "Flex ribbon cable micro-tear vs panel OLED substrate requires physical bench test.",
      recommendation: "REPAIR (Lifespan +24 Months)",
      co2e: "48.5 kg CO₂e Saved",
      cost: "₹3,800 - ₹5,400",
    },
    battery: {
      title: "Chemical Degradation & Pouch Cell Bulge",
      input: "Phone dies within 2 hours of charging and the back cover looks slightly pushed outward.",
      nlp: {
        event: "Chronic Chemical Degradation",
        active: ["Rapid Capacity Drain", "Back Cover Bulge (Swelling)"],
        intact: ["Display Panel Intact", "Charging IC Operational"],
      },
      diagnosis: "Lithium-Ion Pouch Cell Gassing / Swelling Risk",
      certainty: "High Probability Safety Warning",
      cannotConfirm: "Remaining internal milliamp-hour retention capacity requires digital multimeter bench test.",
      recommendation: "REPAIR / IMMEDIATE BATTERY SWAP",
      co2e: "48.5 kg CO₂e Saved",
      cost: "₹1,800 - ₹2,600",
    },
    water: {
      title: "Liquid Ingress & Short-Circuit",
      input: "Fell in bathtub. Tried putting in rice. Won't turn on or vibrate when plugged in.",
      nlp: {
        event: "Liquid Submersion",
        active: ["No Power Intake", "No Haptic Feedback", "Trace Corrosion"],
        intact: ["External Chassis Intact"],
      },
      diagnosis: "Logic Board Short-Circuit / Hydro Corrosion",
      certainty: "Possible Subsystem Failure",
      cannotConfirm: "Whether power management IC or NAND flash memory is salvageable requires ultrasonic PCB cleaning.",
      recommendation: "RECYCLE / CPCB ACCREDITED URBAN MINING",
      co2e: "14.5 kg CO₂e Saved",
      cost: "₹0 (Free CPCB Drop-off)",
    },
  };

  const currentDemo = demoScenarios[selectedDemoTab];

  return (
    <div className="space-y-24 sm:space-y-32 py-6 overflow-hidden">
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative pt-10 sm:pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Brand Tag Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-eco border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ecology + Electronics + AI</span>
        </div>

        {/* Cinematic Headlines */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#f4f6f4] max-w-4xl mx-auto leading-[1.08] mb-4">
          DON'T DISCARD. <br />
          <span className="text-gradient-emerald">GIVE IT ANOTHER LIFE.</span>
        </h1>

        <p className="text-base sm:text-lg text-[#93a299] max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          ReWise uses AI to understand damaged electronics and discover their next circular pathway.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 relative z-10">
          <Link
            to="/diagnose"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 flex items-center justify-center gap-2.5 scale-100 hover:scale-[1.02]"
          >
            <Wrench className="w-4 h-4 stroke-[2.5]" />
            <span>Diagnose Your Device</span>
          </Link>

          <a
            href="#orbit-experience"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-eco hover:bg-white/5 border border-white/10 text-[#f4f6f4] font-semibold text-sm tracking-wide transition-all flex items-center justify-center gap-2"
          >
            <span>Explore ReWise</span>
            <ArrowRight className="w-4 h-4 text-[#93a299]" />
          </a>
        </div>

        {/* Signature Circular Device Orbit */}
        <div id="orbit-experience" className="pt-4">
          <CircularDeviceOrbit />
        </div>
      </section>

      {/* 2. THE 4 CIRCULAR DISPOSITION PILLARS */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
            The Circular Matrix
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[#f4f6f4] tracking-tight">
            Four Paths. Zero Landfill.
          </h2>
          <p className="text-xs sm:text-sm text-[#93a299]">
            Damage is not a death sentence for hardware. Every smartphone contains precious metals, reusable silicon, and repairable subsystems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1: Repair */}
          <div className="p-7 rounded-3xl glass-eco border border-emerald-500/20 glass-eco-hover space-y-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
                01. Primary Lifespan
              </span>
              <h3 className="text-xl font-bold text-[#f4f6f4] mt-0.5">Repair</h3>
            </div>
            <p className="text-xs text-[#93a299] leading-relaxed">
              Replace only the failed screen, battery, or charging port with verified OEM schedules. Avoid buying new.
            </p>
            <div className="pt-3 border-t border-white/5 space-y-1 font-mono text-xs">
              <div className="flex justify-between text-[#93a299]">
                <span>Life Extension:</span>
                <span className="text-[#f4f6f4] font-bold">+18–36 Months</span>
              </div>
              <div className="flex justify-between text-[#93a299]">
                <span>CO₂e Avoided:</span>
                <span className="text-emerald-400 font-bold">~48.5 kg CO₂e</span>
              </div>
            </div>
          </div>

          {/* Pillar 2: Reuse */}
          <div className="p-7 rounded-3xl glass-eco border border-teal-500/20 glass-eco-hover space-y-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-300 flex items-center justify-center">
              <RotateCw className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-teal-300 font-bold uppercase tracking-wider block">
                02. Second Life
              </span>
              <h3 className="text-xl font-bold text-[#f4f6f4] mt-0.5">Reuse</h3>
            </div>
            <p className="text-xs text-[#93a299] leading-relaxed">
              Repurpose functional older processors into dedicated 1080p webcams, dashcams, or smart home security monitors.
            </p>
            <div className="pt-3 border-t border-white/5 space-y-1 font-mono text-xs">
              <div className="flex justify-between text-[#93a299]">
                <span>Financial Outlay:</span>
                <span className="text-[#f4f6f4] font-bold">₹0 (Zero Cost)</span>
              </div>
              <div className="flex justify-between text-[#93a299]">
                <span>CO₂e Avoided:</span>
                <span className="text-teal-300 font-bold">~42.0 kg CO₂e</span>
              </div>
            </div>
          </div>

          {/* Pillar 3: Resell */}
          <div className="p-7 rounded-3xl glass-eco border border-blue-500/20 glass-eco-hover space-y-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wider block">
                03. Trade-In Arbitrage
              </span>
              <h3 className="text-xl font-bold text-[#f4f6f4] mt-0.5">Resell</h3>
            </div>
            <p className="text-xs text-[#93a299] leading-relaxed">
              Transparent buyback valuations across Cashify, Amazon, and Flipkart. Compute value-after-repair arbitrage.
            </p>
            <div className="pt-3 border-t border-white/5 space-y-1 font-mono text-xs">
              <div className="flex justify-between text-[#93a299]">
                <span>Cash Recovery:</span>
                <span className="text-[#f4f6f4] font-bold">Positive Arbitrage</span>
              </div>
              <div className="flex justify-between text-[#93a299]">
                <span>CO₂e Avoided:</span>
                <span className="text-blue-400 font-bold">~39.0 kg CO₂e</span>
              </div>
            </div>
          </div>

          {/* Pillar 4: Recycle */}
          <div className="p-7 rounded-3xl glass-eco border border-amber-500/20 glass-eco-hover space-y-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Recycle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider block">
                04. Urban Mining
              </span>
              <h3 className="text-xl font-bold text-[#f4f6f4] mt-0.5">Recycle</h3>
            </div>
            <p className="text-xs text-[#93a299] leading-relaxed">
              Route dead electronics to 33 CPCB-certified facilities in Karnataka & pan-India for pure elemental metal extraction.
            </p>
            <div className="pt-3 border-t border-white/5 space-y-1 font-mono text-xs">
              <div className="flex justify-between text-[#93a299]">
                <span>Metals Yield:</span>
                <span className="text-[#f4f6f4] font-bold">Gold, Silver, Copper</span>
              </div>
              <div className="flex justify-between text-[#93a299]">
                <span>Civic Reward:</span>
                <span className="text-amber-400 font-bold">+100 ReWise Pts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MULTIMODAL AI & CLINICAL REASONING DEMO */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
            Clinical AI Reasoning Engine
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#f4f6f4] tracking-tight">
            Rigorous Hardware Diagnosis
          </h2>
          <p className="text-xs sm:text-sm text-[#93a299]">
            ReWise separates Confirmed physical facts from Likely internal subsystem faults, preventing AI diagnostic overconfidence.
          </p>
        </div>

        {/* Scenario Switcher Tabs */}
        <div className="flex justify-center gap-2 p-1.5 rounded-2xl glass-eco max-w-md mx-auto border border-white/5">
          <button
            onClick={() => setSelectedDemoTab("screen")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
              selectedDemoTab === "screen"
                ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                : "text-[#93a299] hover:text-[#f4f6f4]"
            }`}
          >
            Display Impact
          </button>
          <button
            onClick={() => setSelectedDemoTab("battery")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
              selectedDemoTab === "battery"
                ? "bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                : "text-[#93a299] hover:text-[#f4f6f4]"
            }`}
          >
            Battery Swelling
          </button>
          <button
            onClick={() => setSelectedDemoTab("water")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
              selectedDemoTab === "water"
                ? "bg-teal-400 text-slate-950 font-bold shadow-md shadow-teal-500/20"
                : "text-[#93a299] hover:text-[#f4f6f4]"
            }`}
          >
            Water Damage
          </button>
        </div>

        {/* Diagnostic Telemetry Board */}
        <div className="p-6 sm:p-8 rounded-3xl glass-eco-glow border border-emerald-500/30 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block">
                User Telemetry Input (English / Tanglish)
              </span>
              <p className="text-sm sm:text-base font-medium text-[#f4f6f4] italic mt-1">
                "{currentDemo.input}"
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shrink-0">
              {currentDemo.certainty}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-[#93a299] block uppercase">Diagnosed Fault</span>
              <span className="text-sm font-bold text-[#f4f6f4] block">{currentDemo.diagnosis}</span>
              <span className="text-[11px] text-emerald-400 font-mono block mt-1">{currentDemo.recommendation}</span>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-[#93a299] block uppercase">Empirical Benchmark</span>
              <span className="text-sm font-bold text-[#f4f6f4] block">{currentDemo.cost}</span>
              <span className="text-[11px] text-[#93a299] font-mono block mt-1">Authorized labor + parts</span>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-[#93a299] block uppercase">Displaced Footprint</span>
              <span className="text-sm font-bold text-teal-300 block">{currentDemo.co2e}</span>
              <span className="text-[11px] text-[#93a299] font-mono block mt-1">ITU-T L.1410 LCA standard</span>
            </div>
          </div>

          {/* Responsible AI Boundary Disclaimer */}
          <div className="p-4 rounded-2xl bg-black/60 border border-white/5 flex items-start gap-3 text-xs text-[#93a299]">
            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-mono font-bold text-amber-400 block mb-0.5">
                Responsible AI Diagnostic Limit:
              </span>
              <p>{currentDemo.cannotConfirm}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ECOSYSTEM METRICS & LCA SCIENTIFIC RIGOR */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <EcoMetric
            icon={Cpu}
            label="Verified Smartphone Models"
            value="342"
            unit="Devices"
            subtext="Authentic OEM specifications (2020–2026)"
            confidence="Catalog Verified"
          />
          <EcoMetric
            icon={Wrench}
            label="Repair Service Networks"
            value="21"
            unit="Clinics"
            subtext="Clean-room screen & battery replacement"
            confidence="Pan-India Authorized"
          />
          <EcoMetric
            icon={Recycle}
            label="CPCB E-Waste Recyclers"
            value="33"
            unit="Centers"
            subtext="Karnataka & Pan-India EPR accredited"
            confidence="MoEFCC Registered"
          />
          <EcoMetric
            icon={Leaf}
            label="Life-Cycle CO₂e Avoided"
            value="48.5"
            unit="kg / unit"
            subtext="By extending smartphone lifespan 2 years"
            methodology="ITU-T L.1410 & Cordella et al. (2021)"
            confidence="LCA Verified"
          />
        </div>
      </section>

      {/* 5. CALL TO ACTION BANNER */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl glass-eco-glow border border-emerald-500/40 text-center space-y-6 relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
            <Leaf className="w-8 h-8" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#f4f6f4] tracking-tight">
              Your device isn't waste yet.
            </h2>
            <p className="text-sm text-[#93a299]">
              It may still have another life. Take 60 seconds to run our guided multimodal diagnostic and discover its true value.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/diagnose"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-xl shadow-emerald-500/30 hover:scale-105"
            >
              <Wrench className="w-4 h-4" />
              <span>Begin Guided Diagnosis</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
