import React, { useState } from "react";
import { Wrench, RotateCw, TrendingUp, Recycle, Sparkles, ArrowRight, ShieldCheck, Leaf } from "lucide-react";
import { Link } from "react-router-dom";

interface CircularDeviceOrbitProps {
  deviceName?: string;
  selectedAction?: "REPAIR" | "REUSE" | "RESELL" | "RECYCLE" | null;
  onSelectAction?: (action: "REPAIR" | "REUSE" | "RESELL" | "RECYCLE") => void;
  showDetailsModal?: boolean;
}

export const CircularDeviceOrbit: React.FC<CircularDeviceOrbitProps> = ({
  deviceName = "Smartphone 2020–2026",
  selectedAction = null,
  onSelectAction,
  showDetailsModal = true,
}) => {
  const [activeNode, setActiveNode] = useState<"REPAIR" | "REUSE" | "RESELL" | "RECYCLE" | null>(
    selectedAction || "REPAIR"
  );
  const [isOrbitPaused, setIsOrbitPaused] = useState(false);

  const pillars = {
    REPAIR: {
      name: "REPAIR",
      label: "Component Renewal",
      icon: Wrench,
      accent: "text-emerald-400",
      border: "border-emerald-500/40",
      glowBg: "bg-emerald-500/20",
      cost: "₹1,500 - ₹5,000",
      benefit: "+18 to 36 Months Life Extension",
      footprint: "48.5 kg CO₂e Saved",
      description: "Replace only the broken display or depleted battery with OEM parts.",
      points: "+50 Pts",
      cta: "Explore Repair Hubs",
      link: "/service-centers",
    },
    REUSE: {
      name: "REUSE",
      label: "Second Life Repurposing",
      icon: RotateCw,
      accent: "text-teal-300",
      border: "border-teal-500/40",
      glowBg: "bg-teal-500/20",
      cost: "₹0 (Zero Outlay)",
      benefit: "Dashcam, Webcam, Smart Display",
      footprint: "42.0 kg CO₂e Saved",
      description: "Convert functional hardware locally without purchasing new single-use gadgets.",
      points: "+40 Pts",
      cta: "View Repurpose Guides",
      link: "/marketplace",
    },
    RESELL: {
      name: "RESELL",
      label: "Trade-In Circulation",
      icon: TrendingUp,
      accent: "text-blue-400",
      border: "border-blue-500/40",
      glowBg: "bg-blue-500/20",
      cost: "Positive Cash Recovery",
      benefit: "Cashify & Amazon Renewed Arbitrage",
      footprint: "39.0 kg CO₂e Saved",
      description: "Unlock secondary market buyback value and extend circular circulation.",
      points: "+75 Pts",
      cta: "Check Trade-In Rates",
      link: "/marketplace",
    },
    RECYCLE: {
      name: "RECYCLE",
      label: "CPCB Urban Mining",
      icon: Recycle,
      accent: "text-amber-400",
      border: "border-amber-500/40",
      glowBg: "bg-amber-500/20",
      cost: "Free Statutory Drop-Off",
      benefit: "Gold, Silver & Copper Ore Extraction",
      footprint: "0.18 kg E-Waste Diverted",
      description: "CPCB accredited zero-landfill smelting to recover precious industrial elements.",
      points: "+100 Pts",
      cta: "Find E-Waste Center",
      link: "/recycling-centers",
    },
  };

  const handleNodeClick = (key: "REPAIR" | "REUSE" | "RESELL" | "RECYCLE") => {
    setActiveNode(key);
    if (onSelectAction) onSelectAction(key);
  };

  const currentInfo = activeNode ? pillars[activeNode] : pillars.REPAIR;
  const ActiveIcon = currentInfo.icon;

  return (
    <div
      className="relative w-full max-w-4xl mx-auto py-8 sm:py-12 flex flex-col items-center select-none"
      onMouseEnter={() => setIsOrbitPaused(true)}
      onMouseLeave={() => setIsOrbitPaused(false)}
    >
      {/* Background Floating Ecosystem Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-1/4 w-1.5 h-1.5 rounded-full bg-emerald-400/40 animate-pulse-glow" />
        <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-teal-400/30 animate-pulse-glow" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-16 left-1/3 w-1 h-1 rounded-full bg-emerald-300/50 animate-pulse-glow" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-20 right-1/3 w-2 h-2 rounded-full bg-amber-400/20 animate-pulse-glow" style={{ animationDelay: "3s" }} />
      </div>

      {/* Main Orbit Stage */}
      <div className="relative w-[340px] h-[340px] sm:w-[440px] sm:h-[440px] flex items-center justify-center">
        {/* Outer Aura Ring */}
        <div className="absolute inset-0 rounded-full border border-emerald-500/10 bg-radial from-emerald-500/5 via-transparent to-transparent pointer-events-none" />

        {/* Concentric SVG Orbit Rings with Subtle Dashed Geometry */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 440 440"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Orbit Track */}
          <circle
            cx="220"
            cy="220"
            r="170"
            stroke="rgba(16, 185, 129, 0.22)"
            strokeWidth="1.5"
            strokeDasharray="4 8"
          />
          {/* Inner Accent Ring */}
          <circle
            cx="220"
            cy="220"
            r="120"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="1"
          />
        </svg>

        {/* Orbiting Container - Spins unless hovered */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all ${
            isOrbitPaused ? "" : "animate-orbit"
          }`}
          style={{ transformOrigin: "center center" }}
        >
          {/* Orbit Node 1: REPAIR (Top: 0°) */}
          <div
            className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2"
            style={{ transform: isOrbitPaused ? undefined : "rotate(0deg)" }}
          >
            <div className={isOrbitPaused ? "" : "animate-orbit-counter"}>
              <button
                onClick={() => handleNodeClick("REPAIR")}
                className={`group relative p-3 sm:p-3.5 rounded-2xl glass-eco border transition-all duration-300 flex items-center gap-2 shadow-xl ${
                  activeNode === "REPAIR"
                    ? "bg-emerald-500/20 border-emerald-400 shadow-emerald-500/30 scale-110"
                    : "border-white/10 hover:border-emerald-500/40 hover:scale-105"
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Wrench className="w-4 h-4" />
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-[11px] font-mono font-bold text-[#f4f6f4] block">REPAIR</span>
                  <span className="text-[9px] font-mono text-emerald-400">+50 Pts</span>
                </div>
              </button>
            </div>
          </div>

          {/* Orbit Node 2: RESELL (Right: 90°) */}
          <div className="absolute right-0 translate-x-1/2 top-1/2 -translate-y-1/2">
            <div className={isOrbitPaused ? "" : "animate-orbit-counter"}>
              <button
                onClick={() => handleNodeClick("RESELL")}
                className={`group relative p-3 sm:p-3.5 rounded-2xl glass-eco border transition-all duration-300 flex items-center gap-2 shadow-xl ${
                  activeNode === "RESELL"
                    ? "bg-blue-500/20 border-blue-400 shadow-blue-500/30 scale-110"
                    : "border-white/10 hover:border-blue-500/40 hover:scale-105"
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-[11px] font-mono font-bold text-[#f4f6f4] block">RESELL</span>
                  <span className="text-[9px] font-mono text-blue-400">+75 Pts</span>
                </div>
              </button>
            </div>
          </div>

          {/* Orbit Node 3: RECYCLE (Bottom: 180°) */}
          <div className="absolute bottom-0 translate-y-1/2 left-1/2 -translate-x-1/2">
            <div className={isOrbitPaused ? "" : "animate-orbit-counter"}>
              <button
                onClick={() => handleNodeClick("RECYCLE")}
                className={`group relative p-3 sm:p-3.5 rounded-2xl glass-eco border transition-all duration-300 flex items-center gap-2 shadow-xl ${
                  activeNode === "RECYCLE"
                    ? "bg-amber-500/20 border-amber-400 shadow-amber-500/30 scale-110"
                    : "border-white/10 hover:border-amber-500/40 hover:scale-105"
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Recycle className="w-4 h-4" />
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-[11px] font-mono font-bold text-[#f4f6f4] block">RECYCLE</span>
                  <span className="text-[9px] font-mono text-amber-400">+100 Pts</span>
                </div>
              </button>
            </div>
          </div>

          {/* Orbit Node 4: REUSE (Left: 270°) */}
          <div className="absolute left-0 -translate-x-1/2 top-1/2 -translate-y-1/2">
            <div className={isOrbitPaused ? "" : "animate-orbit-counter"}>
              <button
                onClick={() => handleNodeClick("REUSE")}
                className={`group relative p-3 sm:p-3.5 rounded-2xl glass-eco border transition-all duration-300 flex items-center gap-2 shadow-xl ${
                  activeNode === "REUSE"
                    ? "bg-teal-500/20 border-teal-400 shadow-teal-500/30 scale-110"
                    : "border-white/10 hover:border-teal-500/40 hover:scale-105"
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
                  <RotateCw className="w-4 h-4" />
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-[11px] font-mono font-bold text-[#f4f6f4] block">REUSE</span>
                  <span className="text-[9px] font-mono text-teal-300">+40 Pts</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Center Floating Premium Smartphone */}
        <div className="relative z-10 animate-float flex flex-col items-center">
          {/* Smartphone Hardware Frame */}
          <div className="w-28 sm:w-36 h-52 sm:h-64 rounded-[2.2rem] bg-gradient-to-b from-slate-800 via-slate-900 to-black p-2 device-frame-shadow border border-white/20 relative overflow-hidden flex flex-col justify-between">
            {/* Top Bezel & Speaker */}
            <div className="flex items-center justify-center gap-1.5 pt-1">
              <div className="w-2 h-2 rounded-full bg-slate-950 border border-slate-700" />
              <div className="w-8 h-1 rounded-full bg-slate-800" />
            </div>

            {/* Glass Screen with ReWise Core Glow */}
            <div className="relative flex-1 rounded-[1.7rem] bg-[#070b09] border border-emerald-500/20 overflow-hidden flex flex-col items-center justify-center p-3 text-center my-1.5 shadow-inner">
              {/* Screen Sheen Reflection */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />

              {/* Glowing Brand Core */}
              <div className="relative w-12 h-12 rounded-2xl bg-slate-950/80 border border-emerald-500/40 flex items-center justify-center p-1.5 mb-2 shadow-lg shadow-emerald-500/30">
                <img src="/logo-icon.png" alt="ReWise Logo" className="w-full h-full object-contain" />
              </div>

              <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                ReWise AI
              </span>
              <span className="text-[10px] font-mono text-[#93a299] line-clamp-1 mt-0.5 max-w-[90px]">
                {activeNode || "Evaluation"}
              </span>

              {/* Live Eco Status Pill */}
              <div className="mt-2 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-mono text-emerald-300">
                Circular Ready
              </div>
            </div>

            {/* Bottom Home Indicator */}
            <div className="flex justify-center pb-1">
              <div className="w-10 h-1 rounded-full bg-slate-700/80" />
            </div>
          </div>

          {/* Under-device spatial shadow */}
          <div className="w-24 sm:w-32 h-3 rounded-full bg-emerald-500/20 blur-md mt-2" />
        </div>
      </div>

      {/* Interactive Pathway Information Card Revealed Below */}
      {showDetailsModal && currentInfo && (
        <div className="w-full max-w-xl mt-6 p-5 sm:p-6 rounded-3xl glass-eco-glow border border-emerald-500/30 text-left animate-in fade-in zoom-in-95 duration-200 shadow-2xl">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl border flex items-center justify-center ${currentInfo.glowBg} ${currentInfo.border} ${currentInfo.accent}`}
              >
                <ActiveIcon className="w-4 h-4" />
              </div>
              <div>
                <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${currentInfo.accent}`}>
                  Pillar: {currentInfo.name}
                </span>
                <h4 className="text-lg font-bold text-[#f4f6f4]">{currentInfo.label}</h4>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              {currentInfo.points}
            </span>
          </div>

          <p className="text-xs text-[#93a299] mt-1 mb-4 leading-relaxed">{currentInfo.description}</p>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-4">
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[10px] text-[#93a299] block">Economics</span>
              <span className="font-bold text-[#f4f6f4] mt-0.5 block">{currentInfo.cost}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[10px] text-[#93a299] block">Climate Impact</span>
              <span className="font-bold text-emerald-400 mt-0.5 block">{currentInfo.footprint}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <span className="text-[11px] text-[#93a299] font-mono">{currentInfo.benefit}</span>
            <Link
              to={currentInfo.link}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-emerald-500/20"
            >
              <span>{currentInfo.cta}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export const CircularOrbit = CircularDeviceOrbit;
