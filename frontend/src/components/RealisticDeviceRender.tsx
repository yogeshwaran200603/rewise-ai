import React, { useState } from "react";
import {
  Wrench,
  RotateCw,
  TrendingUp,
  Recycle,
  Sparkles,
  Wifi,
  Battery,
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Zap,
} from "lucide-react";
import type { Device } from "../types";

export interface RealisticDeviceRenderProps {
  brand?: string;
  modelName?: string;
  deviceDetail?: Device | null;
  releaseYear?: number;
  storageGb?: number | string;
  batteryCapacity?: string;
  is5G?: boolean;
  detectedDamage?: string[] | string | null;
  isAnalyzing?: boolean;
  orbitReaction?: "REPAIR" | "REUSE" | "RESELL" | "RECYCLE" | null;
  autoRotate?: boolean;
  className?: string;
}

export const RealisticDeviceRender: React.FC<RealisticDeviceRenderProps> = ({
  brand = "Motorola",
  modelName = "Moto G34 5G",
  deviceDetail,
  releaseYear = 2024,
  storageGb = "128GB",
  batteryCapacity = "5000 mAh",
  is5G = true,
  detectedDamage = null,
  isAnalyzing = false,
  orbitReaction = null,
  autoRotate = true,
  className = "",
}) => {
  const [manualFlip, setManualFlip] = useState<boolean | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Normalize damage list
  const damageList: string[] = Array.isArray(detectedDamage)
    ? detectedDamage.map((d) => d.toLowerCase())
    : typeof detectedDamage === "string"
    ? [detectedDamage.toLowerCase()]
    : [];

  const hasDisplayDamage = damageList.some(
    (d) => d.includes("display") || d.includes("screen") || d.includes("glass") || d.includes("touch")
  );
  const hasCameraDamage = damageList.some((d) => d.includes("camera") || d.includes("lens"));
  const hasBackGlassDamage = damageList.some((d) => d.includes("back") || d.includes("rear"));
  const hasBatteryIssue = damageList.some((d) => d.includes("battery") || d.includes("drain") || d.includes("health"));
  const hasChargingIssue = damageList.some((d) => d.includes("charging") || d.includes("port"));
  const hasWaterDamage = damageList.some((d) => d.includes("water") || d.includes("liquid") || d.includes("moisture"));

  // Detect brand styling
  const brandLower = (brand || "").toLowerCase();
  const modelLower = (modelName || "").toLowerCase();

  const isApple = brandLower.includes("apple") || modelLower.includes("iphone");
  const isSamsung = brandLower.includes("samsung") || modelLower.includes("galaxy");
  const isMotorola = brandLower.includes("motorola") || modelLower.includes("moto");
  const isGoogle = brandLower.includes("google") || modelLower.includes("pixel");
  const isOnePlus = brandLower.includes("oneplus");
  const isUltra = modelLower.includes("ultra");
  const isPro = modelLower.includes("pro");

  // Chassis design profiles
  const chassisCornerRadius = isUltra
    ? "rounded-[1rem]"
    : isApple
    ? "rounded-[2.5rem]"
    : isSamsung
    ? "rounded-[2.2rem]"
    : "rounded-[2.1rem]";

  const frameGradient = isApple
    ? isPro
      ? "from-[#4b4e54] via-[#7d828a] to-[#2e3136]" // Natural Titanium
      : "from-[#2f3542] via-[#57606f] to-[#1e272e]" // Space Aluminum
    : isSamsung
    ? "from-[#3a3d40] via-[#5c6066] to-[#25282a]" // Armor Aluminum
    : isMotorola
    ? "from-[#2d3a36] via-[#3f524c] to-[#1c2421]" // Matte Forest / Charcoal
    : "from-[#334155] via-[#475569] to-[#1e293b]";

  const backColor = isMotorola
    ? "bg-gradient-to-b from-[#1a2622] via-[#16201d] to-[#0f1714]" // Moto Vegan Leather / Satin
    : isApple
    ? isPro
      ? "bg-gradient-to-b from-[#26282b] via-[#2f3237] to-[#1c1d20]" // Matte Titanium
      : "bg-gradient-to-b from-[#1e262c] via-[#273138] to-[#141b1f]" // Frosted Glass
    : isSamsung
    ? "bg-gradient-to-b from-[#202428] via-[#292e33] to-[#171a1d]" // Satin Glass
    : "bg-gradient-to-b from-[#18201d] via-[#1e2925] to-[#121916]";

  // Reaction Aura
  const reactionRing =
    orbitReaction === "REPAIR"
      ? "ring-2 ring-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.35)]"
      : orbitReaction === "REUSE"
      ? "ring-2 ring-teal-400 shadow-[0_0_40px_rgba(45,212,191,0.35)]"
      : orbitReaction === "RESELL"
      ? "ring-2 ring-blue-400 shadow-[0_0_40px_rgba(96,165,250,0.35)]"
      : orbitReaction === "RECYCLE"
      ? "ring-2 ring-amber-400 shadow-[0_0_40px_rgba(251,191,36,0.35)]"
      : "shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_35px_-5px_rgba(16,185,129,0.18)]";

  // Effective specs
  const displayYear = deviceDetail?.release_year || releaseYear || 2024;
  const displayStorage =
    deviceDetail?.storage_options?.[0] ||
    (typeof storageGb === "number" ? `${storageGb}GB` : storageGb) ||
    "128GB";
  const displayBattery = deviceDetail?.battery_capacity || batteryCapacity || "5000 mAh";
  const has5G = deviceDetail?.five_g ?? is5G;

  return (
    <div
      className={`relative flex flex-col items-center select-none perspective-1200 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D Rotating Gimbal */}
      <div
        className={`relative w-36 sm:w-44 h-72 sm:h-88 preserve-3d transition-transform duration-700 ${
          autoRotate && !isHovered && manualFlip === null
            ? "animate-device-3d"
            : manualFlip === true
            ? "[transform:rotateY(180deg)]"
            : "[transform:rotateY(0deg)_rotateX(4deg)]"
        }`}
        style={{ transformOrigin: "center center" }}
      >
        {/* ========================================================
            FRONT FACE (Screen & Sensors)
            ======================================================== */}
        <div
          className={`absolute inset-0 backface-hidden ${chassisCornerRadius} p-2 bg-gradient-to-b ${frameGradient} ${reactionRing} border border-white/20 flex flex-col justify-between overflow-hidden`}
          style={{ transform: "translateZ(8px)" }}
        >
          {/* Top Bezel Frame with Mic */}
          <div className="relative w-full flex items-center justify-center pt-0.5 z-20">
            {/* Speaker Earpiece Slit */}
            <div className="w-12 h-0.5 rounded-full bg-slate-900/90 border border-slate-700/50" />
          </div>

          {/* Active OLED Display */}
          <div
            className={`relative flex-1 ${
              isUltra ? "rounded-[0.7rem]" : isApple ? "rounded-[2rem]" : "rounded-[1.6rem]"
            } bg-[#060807] overflow-hidden flex flex-col justify-between p-2.5 my-1 border border-white/10 shadow-inner`}
          >
            {/* Top Camera Cutout */}
            <div className="relative w-full flex items-center justify-center z-30 pt-0.5">
              {isApple ? (
                /* Dynamic Island */
                <div className="w-14 h-3.5 rounded-full bg-black border border-slate-800/80 flex items-center justify-between px-2 shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-700" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
                </div>
              ) : (
                /* Android Punch-Hole Camera */
                <div className="w-2.5 h-2.5 rounded-full bg-black border border-slate-700/80 flex items-center justify-center shadow-sm">
                  <div className="w-1 h-1 rounded-full bg-slate-900/90 border border-emerald-950/80" />
                </div>
              )}
            </div>

            {/* Glass Sheen Angle Reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.07] to-transparent pointer-events-none z-20" />

            {/* Ambient Wallpaper & Topographic Pattern */}
            <div className="absolute inset-0 opacity-25 pointer-events-none">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="screen-glow" cx="50%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#080b0a" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#screen-glow)" />
                <path
                  d="M-20 60 Q 60 100 180 40 T 260 180"
                  fill="none"
                  stroke="rgba(16, 185, 129, 0.25)"
                  strokeWidth="0.8"
                />
                <path
                  d="M-10 140 Q 80 180 160 120 T 240 240"
                  fill="none"
                  stroke="rgba(110, 231, 183, 0.18)"
                  strokeWidth="0.8"
                />
              </svg>
            </div>

            {/* Status Bar */}
            <div className="relative z-10 flex items-center justify-between text-[8px] font-mono text-[#93a299] px-1 pt-1">
              <span>09:41</span>
              <div className="flex items-center gap-1.5">
                {has5G && <span className="text-[7px] text-emerald-400 font-bold">5G</span>}
                <Wifi className="w-2.5 h-2.5 text-[#93a299]" />
                <div className="flex items-center gap-0.5">
                  <div className="w-3.5 h-1.5 rounded-sm border border-[#93a299] p-0.5 flex items-center">
                    <div
                      className={`h-full rounded-2xs ${
                        hasBatteryIssue ? "w-1/3 bg-amber-400" : "w-4/5 bg-emerald-400"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Center Lock Screen Content */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto py-2">
              <span className="text-xl sm:text-2xl font-light text-[#f4f6f4] tracking-tight">
                09:41
              </span>
              <span className="text-[8px] font-mono text-[#93a299] uppercase tracking-wider -mt-1">
                Tuesday, Sept 29
              </span>

              {/* Dynamic Device Identity Badge */}
              <div className="mt-3 px-2 py-1 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md max-w-[130px]">
                <span className="text-[9px] font-mono font-bold text-[#f4f6f4] truncate block">
                  {modelName}
                </span>
                <span className="text-[8px] font-mono text-emerald-400 block -mt-0.5">
                  {displayStorage} • {displayYear}
                </span>
              </div>

              {/* Moisture Alert if Water Damage */}
              {hasWaterDamage && (
                <div className="mt-2 px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-[8px] font-mono text-amber-300 flex items-center gap-1 animate-pulse">
                  <Droplets className="w-2.5 h-2.5" />
                  <span>Liquid in Port</span>
                </div>
              )}
            </div>

            {/* Bottom Screen Diagnostics / Status Indicator */}
            <div className="relative z-10 flex flex-col items-center gap-1 pb-1">
              <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[7px] font-mono text-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>ReWise Telemetry</span>
              </div>
              {/* Home Gestural Bar */}
              <div className="w-12 h-1 rounded-full bg-white/40 mt-1" />
            </div>

            {/* ====================================================
                PHYSICAL DAMAGE VISUALIZERS (FRONT)
                ==================================================== */}
            {hasDisplayDamage && (
              <div className="absolute inset-0 pointer-events-none z-30">
                {/* 1. Hairline OLED Glass Cracks (Vector Lines) */}
                <svg className="absolute inset-0 w-full h-full opacity-80" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M 120 0 L 95 45 L 110 80 L 70 120 L 40 180 M 95 45 L 60 40 M 110 80 L 140 110 M 70 120 L 90 160"
                    stroke="#ffffff"
                    strokeWidth="0.75"
                    strokeDasharray="2 0.5"
                    fill="none"
                    filter="drop-shadow(0 0 2px rgba(255,255,255,0.7))"
                  />
                </svg>

                {/* 2. Real Green OLED Scan Line Telemetry Defect */}
                <div className="absolute top-0 bottom-0 left-[38%] w-[1.5px] bg-[#10b981] animate-oled-line pointer-events-none" />
              </div>
            )}

            {/* ====================================================
                DIAGNOSTIC AI SCANNER BEAM
                ==================================================== */}
            {isAnalyzing && (
              <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
                {/* Sweeping Green Laser */}
                <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981] animate-laser" />
                {/* Holographic Diagnostic HUD Chips */}
                <div className="absolute top-4 left-2 right-2 flex flex-col gap-1 text-[7px] font-mono text-emerald-300/80 bg-black/60 p-1.5 rounded-lg border border-emerald-500/30">
                  <div className="flex items-center justify-between">
                    <span>AI TELEMETRY SCAN</span>
                    <span className="animate-pulse">● REC</span>
                  </div>
                  <div className="text-white/70">SUB: {modelName}</div>
                  <div className="text-emerald-400 font-bold">CIRCULAR: CALCULATING</div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Rim USB-C Charging Port Indicator */}
          <div className="relative w-full flex items-center justify-center pb-0.5 z-20">
            <div
              className={`w-6 h-1 rounded-sm border ${
                hasChargingIssue
                  ? "bg-amber-500/40 border-amber-400 shadow-[0_0_8px_#f59e0b]"
                  : "bg-slate-900 border-slate-700/60"
              }`}
            />
          </div>
        </div>

        {/* ========================================================
            BACK FACE (Chassis Finish, Logo & Camera Module)
            ======================================================== */}
        <div
          className={`absolute inset-0 backface-hidden ${chassisCornerRadius} p-2 bg-gradient-to-b ${frameGradient} ${reactionRing} border border-white/20 flex flex-col justify-between overflow-hidden`}
          style={{ transform: "rotateY(180deg) translateZ(8px)" }}
        >
          {/* Rear Backplate Surface */}
          <div
            className={`relative flex-1 ${
              isUltra ? "rounded-[0.7rem]" : isApple ? "rounded-[2rem]" : "rounded-[1.6rem]"
            } ${backColor} overflow-hidden flex flex-col justify-between p-3 border border-white/5 shadow-inner`}
          >
            {/* Satin Reflection Sheen */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none" />

            {/* Rear Camera Island / Module */}
            <div className="relative z-10 w-full flex justify-start items-start">
              {/* BRAND-SPECIFIC CAMERA ARRAYS */}
              {isMotorola ? (
                /* Motorola Contoured Camera Island (Moto G34 5G Style) */
                <div
                  className={`p-2 rounded-2xl bg-gradient-to-br from-[#24332d] to-[#151f1c] border ${
                    hasCameraDamage ? "border-amber-400 shadow-[0_0_15px_#f59e0b]" : "border-white/10"
                  } shadow-md flex flex-col items-center gap-1.5`}
                >
                  {/* Lens 1: 50MP Main Quad-Pixel */}
                  <div className="relative w-7 h-7 rounded-full bg-black border-2 border-slate-600/80 p-0.5 flex items-center justify-center shadow-inner">
                    <div className="w-4 h-4 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-slate-950 border border-emerald-950/80" />
                    </div>
                  </div>
                  {/* Lens 2: Macro Lens */}
                  <div className="relative w-6 h-6 rounded-full bg-black border-2 border-slate-600/80 p-0.5 flex items-center justify-center shadow-inner">
                    <div className="w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-700" />
                  </div>
                  {/* Flash & Specs */}
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-200/90 shadow-[0_0_4px_#fef08a]" />
                    <span className="text-[5px] font-mono text-[#93a299]">50MP</span>
                  </div>
                </div>
              ) : isApple ? (
                /* Apple Camera Bump (Pro Triple or Base Diagonal) */
                <div
                  className={`p-2 rounded-2xl bg-black/30 backdrop-blur-md border ${
                    hasCameraDamage ? "border-amber-400 shadow-[0_0_15px_#f59e0b]" : "border-white/15"
                  } shadow-lg`}
                >
                  {isPro ? (
                    /* iPhone Pro Triangle Triple Array */
                    <div className="w-14 h-14 relative">
                      <div className="absolute top-0 left-0 w-6 h-6 rounded-full bg-black border-2 border-slate-500 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-slate-900 border border-cyan-900" />
                      </div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 rounded-full bg-black border-2 border-slate-500 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-slate-900 border border-cyan-900" />
                      </div>
                      <div className="absolute top-4 right-0 w-6 h-6 rounded-full bg-black border-2 border-slate-500 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-slate-900 border border-cyan-900" />
                      </div>
                      <div className="absolute top-0 right-1 w-2 h-2 rounded-full bg-amber-200" />
                    </div>
                  ) : (
                    /* iPhone Base Diagonal Array */
                    <div className="w-12 h-12 relative">
                      <div className="absolute top-0 left-0 w-6 h-6 rounded-full bg-black border-2 border-slate-500 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-slate-900" />
                      </div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-black border-2 border-slate-500 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-slate-900" />
                      </div>
                      <div className="absolute top-0 right-1 w-2 h-2 rounded-full bg-amber-200" />
                    </div>
                  )}
                </div>
              ) : isSamsung ? (
                /* Samsung Floating Triple Rings (Galaxy S24 Style) */
                <div
                  className={`flex flex-col gap-2 p-1 ${
                    hasCameraDamage ? "ring-1 ring-amber-400 p-1 rounded-xl" : ""
                  }`}
                >
                  {[1, 2, 3].map((ring) => (
                    <div
                      key={ring}
                      className="w-6 h-6 rounded-full bg-black border-2 border-slate-400/80 flex items-center justify-center shadow-md"
                    >
                      <div className="w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-950 border border-emerald-950" />
                      </div>
                    </div>
                  ))}
                  {/* Beside LED Flash */}
                  <div className="w-2 h-2 rounded-full bg-amber-200/90 shadow-sm ml-7 -mt-14" />
                </div>
              ) : isGoogle ? (
                /* Google Pixel Visor Bar */
                <div
                  className={`w-full h-8 rounded-xl bg-slate-950 border ${
                    hasCameraDamage ? "border-amber-400" : "border-white/10"
                  } flex items-center px-3 gap-2 shadow-md`}
                >
                  <div className="w-10 h-5 rounded-full bg-black border border-slate-700 flex items-center px-1 gap-1">
                    <div className="w-3 h-3 rounded-full bg-slate-900" />
                    <div className="w-3 h-3 rounded-full bg-slate-900" />
                  </div>
                  <div className="w-2 h-2 rounded-full bg-amber-200 ml-auto" />
                </div>
              ) : (
                /* Generic Android Multi-Camera Island */
                <div className="p-2 rounded-2xl bg-black/40 border border-white/10 flex flex-col gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-black border-2 border-slate-500" />
                  <div className="w-6 h-6 rounded-full bg-black border-2 border-slate-500" />
                </div>
              )}
            </div>

            {/* Center Brand Emblem / Silhouette */}
            <div className="relative z-10 flex flex-col items-center justify-center my-auto opacity-70">
              {isMotorola ? (
                /* Motorola Stylized "M" Batwing Emblem */
                <div className="w-8 h-8 rounded-full border border-white/20 bg-white/5 flex items-center justify-center shadow-inner">
                  <span className="font-sans font-bold text-xs tracking-tighter text-[#f4f6f4]">
                    M
                  </span>
                </div>
              ) : isApple ? (
                /* Apple Silhouette Indicator */
                <div className="w-6 h-7 rounded-t-full rounded-b-2xl border border-white/20 bg-white/5" />
              ) : isSamsung ? (
                /* Samsung Subtle Wordmark */
                <span className="text-[8px] font-mono tracking-widest text-[#f4f6f4]/60 uppercase font-semibold">
                  SAMSUNG
                </span>
              ) : (
                <div className="w-6 h-6 rounded-full border border-white/20 bg-white/5 flex items-center justify-center">
                  <span className="text-[7px] font-mono text-[#93a299]">AI</span>
                </div>
              )}
            </div>

            {/* Back Glass Fracture if Damaged */}
            {hasBackGlassDamage && (
              <div className="absolute inset-0 pointer-events-none z-20">
                <svg className="w-full h-full opacity-70" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M 20 180 L 60 140 L 90 190 L 130 150 M 60 140 L 40 100 M 90 190 L 80 230"
                    stroke="#ffffff"
                    strokeWidth="0.8"
                    strokeDasharray="2 0.5"
                    fill="none"
                    filter="drop-shadow(0 0 2px rgba(255,255,255,0.7))"
                  />
                </svg>
              </div>
            )}

            {/* Bottom Regulatory & CE Inscription */}
            <div className="relative z-10 flex flex-col items-center text-center text-[6px] font-mono text-[#93a299]/50">
              <span>{brand} • Engineered for Circularity</span>
              <span>CPCB EPR Compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Under-Device Spatial Shadow with Ambient Glow */}
      <div
        className={`w-28 sm:w-36 h-3.5 rounded-full mt-3 blur-md transition-all duration-500 ${
          orbitReaction === "REPAIR"
            ? "bg-emerald-500/35"
            : orbitReaction === "REUSE"
            ? "bg-teal-500/35"
            : orbitReaction === "RESELL"
            ? "bg-blue-500/35"
            : orbitReaction === "RECYCLE"
            ? "bg-amber-500/35"
            : "bg-emerald-500/20"
        }`}
      />

      {/* Model Name & Specs Hero Label */}
      <div className="text-center mt-3 max-w-xs space-y-1">
        <h4 className="text-sm sm:text-base font-black text-[#f4f6f4] tracking-tight">
          {brand} {modelName}
        </h4>
        <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-[#93a299]">
          <span>{displayYear}</span>
          <span>•</span>
          <span>{displayStorage}</span>
          {has5G && (
            <>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">5G</span>
            </>
          )}
          <span>•</span>
          <span>{displayBattery}</span>
        </div>

        {/* Interactive Flip / Inspect Toggle */}
        <div className="pt-1.5 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setManualFlip((prev) => (prev === null ? true : !prev))}
            className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-mono text-[#93a299] hover:text-[#f4f6f4] transition-all flex items-center gap-1.5 shadow-sm"
          >
            <RotateCw className="w-2.5 h-2.5 text-emerald-400" />
            <span>{manualFlip === true ? "View Screen" : "View Camera & Rear"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
