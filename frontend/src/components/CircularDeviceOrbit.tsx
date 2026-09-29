import React, { useState, useEffect } from "react";
import {
  Wrench,
  RotateCw,
  TrendingUp,
  Recycle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Leaf,
  Smartphone,
  ChevronDown,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";
import { RealisticDeviceRender } from "./RealisticDeviceRender";
import { api } from "../services/api";
import type { Device, DeviceModelItem } from "../types";

export interface CircularDeviceOrbitProps {
  device?: Device | any | null;
  deviceName?: string;
  selectedAction?: "REPAIR" | "REUSE" | "RESELL" | "RECYCLE" | null;
  onSelectAction?: (action: "REPAIR" | "REUSE" | "RESELL" | "RECYCLE") => void;
  showDetailsModal?: boolean;
  isAnalyzing?: boolean;
  detectedDamage?: string[] | string | null;
  allowDeviceSwitcher?: boolean;
  onDeviceChange?: (device: any) => void;
}

// Preset showcase models for instant verification
const SHOWCASE_PRESETS = [
  {
    brand: "Motorola",
    model: "Moto G34 5G",
    releaseYear: 2024,
    storage: "128GB",
    battery: "5000 mAh",
    is5G: true,
  },
  {
    brand: "Apple",
    model: "iPhone 15",
    releaseYear: 2023,
    storage: "128GB",
    battery: "3349 mAh",
    is5G: true,
  },
  {
    brand: "Samsung",
    model: "Galaxy S24",
    releaseYear: 2024,
    storage: "128GB",
    battery: "4000 mAh",
    is5G: true,
  },
  {
    brand: "OnePlus",
    model: "OnePlus 12",
    releaseYear: 2024,
    storage: "256GB",
    battery: "5400 mAh",
    is5G: true,
  },
];

export const CircularDeviceOrbit: React.FC<CircularDeviceOrbitProps> = ({
  device = null,
  deviceName,
  selectedAction = null,
  onSelectAction,
  showDetailsModal = true,
  isAnalyzing = false,
  detectedDamage = null,
  allowDeviceSwitcher = true,
  onDeviceChange,
}) => {
  const [activeNode, setActiveNode] = useState<"REPAIR" | "REUSE" | "RESELL" | "RECYCLE" | null>(
    selectedAction || "REPAIR"
  );
  const [isOrbitPaused, setIsOrbitPaused] = useState(false);

  // Active showcase device state
  const [currentShowcaseIndex, setCurrentShowcaseIndex] = useState(0);
  const [customDevice, setCustomDevice] = useState<Device | null>(null);

  // Search in database modal
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DeviceModelItem[]>([]);
  const [searching, setSearching] = useState(false);

  // Handle incoming props changes
  useEffect(() => {
    if (selectedAction) {
      setActiveNode(selectedAction);
    }
  }, [selectedAction]);

  // Determine current active device specs
  const activePreset = SHOWCASE_PRESETS[currentShowcaseIndex];

  let displayBrand = activePreset.brand;
  let displayModel = activePreset.model;
  let displayYear = activePreset.releaseYear;
  let displayStorage = activePreset.storage;
  let displayBattery = activePreset.battery;
  let display5G = activePreset.is5G;
  let effectiveDeviceDetail: Device | null = null;

  if (device) {
    displayBrand = device.brand || "Apple";
    displayModel = device.model_name || device.model || "iPhone 15";
    displayYear = device.release_year || device.releaseYear || 2024;
    displayStorage = device.storage_options?.[0] || device.storageGb ? `${device.storageGb}GB` : "128GB";
    displayBattery = device.battery_capacity || device.batteryCondition || "5000 mAh";
    display5G = device.five_g ?? true;
    effectiveDeviceDetail = device;
  } else if (customDevice) {
    displayBrand = customDevice.brand;
    displayModel = customDevice.model_name || customDevice.model;
    displayYear = customDevice.release_year || 2024;
    displayStorage = customDevice.storage_options?.[0] || "128GB";
    displayBattery = customDevice.battery_capacity || "5000 mAh";
    display5G = customDevice.five_g ?? true;
    effectiveDeviceDetail = customDevice;
  } else if (deviceName) {
    displayModel = deviceName;
    if (deviceName.toLowerCase().includes("moto")) displayBrand = "Motorola";
    else if (deviceName.toLowerCase().includes("iphone")) displayBrand = "Apple";
    else if (deviceName.toLowerCase().includes("galaxy") || deviceName.toLowerCase().includes("samsung"))
      displayBrand = "Samsung";
  }

  // Search devices from backend database
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await api.searchDevices(searchQuery);
        setSearchResults(results.slice(0, 6));
      } catch (err) {
        console.warn("Failed to search devices:", err);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSearchDevice = async (item: DeviceModelItem) => {
    try {
      const full = await api.getDevice(item.id);
      setCustomDevice(full);
      setIsSearchOpen(false);
      setSearchQuery("");
      if (onDeviceChange) onDeviceChange(full);
    } catch {
      // Fallback to basic item
      setCustomDevice({
        id: item.id,
        brand: item.brand,
        model_name: item.model_name,
        release_year: item.release_year || 2024,
      } as Device);
      setIsSearchOpen(false);
    }
  };

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
      description: "Replace only the broken display, swollen battery, or failed port with genuine parts.",
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
      description: "Convert functional hardware locally into dedicated tools without purchasing new single-use gadgets.",
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
      description: "Unlock secondary market buyback value and extend circular circulation to another owner.",
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
      className="relative w-full max-w-5xl mx-auto py-4 sm:py-8 flex flex-col items-center select-none"
      onMouseEnter={() => setIsOrbitPaused(true)}
      onMouseLeave={() => setIsOrbitPaused(false)}
    >
      {/* Dynamic Device Selector Pills (Allowed on Hero / Demonstrator) */}
      {allowDeviceSwitcher && !device && (
        <div className="mb-6 sm:mb-8 flex flex-wrap items-center justify-center gap-2 relative z-30">
          <span className="text-[11px] font-mono text-[#93a299] uppercase tracking-wider mr-1 hidden sm:inline">
            Showcase Device:
          </span>
          {SHOWCASE_PRESETS.map((preset, idx) => {
            const isSelected = !customDevice && currentShowcaseIndex === idx;
            return (
              <button
                key={preset.model}
                type="button"
                onClick={() => {
                  setCustomDevice(null);
                  setCurrentShowcaseIndex(idx);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 scale-105"
                    : "glass-eco text-[#93a299] hover:text-[#f4f6f4] hover:bg-white/5 border-white/5"
                }`}
              >
                <span>{preset.model}</span>
              </button>
            );
          })}

          {/* Search Any from 342+ Models */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 ${
                customDevice
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
                  : "glass-eco text-[#93a299] hover:text-[#f4f6f4] border-white/10"
              }`}
            >
              <Search className="w-3 h-3" />
              <span>{customDevice ? customDevice.model_name : "Search 342+ Models"}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {/* Quick Search Dropdown */}
            {isSearchOpen && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-72 rounded-2xl glass-eco-glow p-3 z-50 shadow-2xl border border-emerald-500/30 text-left animate-in fade-in zoom-in-95">
                <input
                  type="text"
                  placeholder="Search brand or model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs text-[#f4f6f4] placeholder-[#93a299] focus:outline-none focus:border-emerald-500 font-mono mb-2"
                />
                {searching && <div className="text-[10px] font-mono text-[#93a299] py-2 text-center">Searching...</div>}
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {searchResults.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleSelectSearchDevice(r)}
                      className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-mono text-[#93a299] hover:text-[#f4f6f4] hover:bg-emerald-500/10 flex items-center justify-between"
                    >
                      <span className="truncate">{r.brand} {r.model_name}</span>
                      <span className="text-[9px] text-emerald-400 shrink-0">{r.release_year}</span>
                    </button>
                  ))}
                  {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
                    <div className="text-[10px] font-mono text-[#93a299] py-2 text-center">No devices found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Orbit Stage */}
      <div className="relative w-[340px] h-[340px] sm:w-[500px] sm:h-[500px] flex items-center justify-center">
        {/* Outer Aura Ring */}
        <div className="absolute inset-0 rounded-full border border-emerald-500/10 bg-radial from-emerald-500/5 via-transparent to-transparent pointer-events-none" />

        {/* Concentric SVG Orbit Rings with Subtle Dashed Geometry */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 500 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Orbit Track */}
          <circle
            cx="250"
            cy="250"
            r="195"
            stroke="rgba(16, 185, 129, 0.22)"
            strokeWidth="1.5"
            strokeDasharray="4 8"
          />
          {/* Inner Accent Ring */}
          <circle
            cx="250"
            cy="250"
            r="135"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="1"
          />
        </svg>

        {/* Orbiting Container - 4 Circular Pathways */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all ${
            isOrbitPaused ? "" : "animate-orbit"
          }`}
          style={{ transformOrigin: "center center" }}
        >
          {/* Orbit Node 1: REPAIR (Top: 0°) */}
          <div
            className="absolute top-2 -translate-y-1/2 left-1/2 -translate-x-1/2 z-20"
            style={{ transform: isOrbitPaused ? undefined : "rotate(0deg)" }}
          >
            <div className={isOrbitPaused ? "" : "animate-orbit-counter"}>
              <button
                type="button"
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
          <div className="absolute right-2 translate-x-1/2 top-1/2 -translate-y-1/2 z-20">
            <div className={isOrbitPaused ? "" : "animate-orbit-counter"}>
              <button
                type="button"
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
          <div className="absolute bottom-2 translate-y-1/2 left-1/2 -translate-x-1/2 z-20">
            <div className={isOrbitPaused ? "" : "animate-orbit-counter"}>
              <button
                type="button"
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
          <div className="absolute left-2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-20">
            <div className={isOrbitPaused ? "" : "animate-orbit-counter"}>
              <button
                type="button"
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

        {/* ========================================================
            CENTER HERO: REALISTIC 3D PRODUCT DEVICE REPRESENTATION
            ======================================================== */}
        <div className="relative z-10 animate-float flex flex-col items-center">
          <RealisticDeviceRender
            brand={displayBrand}
            modelName={displayModel}
            deviceDetail={effectiveDeviceDetail}
            releaseYear={displayYear}
            storageGb={displayStorage}
            batteryCapacity={displayBattery}
            is5G={display5G}
            detectedDamage={detectedDamage}
            isAnalyzing={isAnalyzing}
            orbitReaction={activeNode}
            autoRotate={true}
          />
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
