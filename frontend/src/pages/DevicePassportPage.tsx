import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Search, QrCode, Cpu, Leaf, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { CircularPassport } from "../components/CircularPassport";

export const DevicePassportPage: React.FC = () => {
  const [deviceQuery, setDeviceQuery] = useState("Apple iPhone 13");
  const [activeDevice, setActiveDevice] = useState({
    device: "Apple iPhone 13 (128GB)",
    brand: "Apple",
    year: 2021,
    action: "DIAGNOSED",
    co2: 48.5,
  });

  const popularPassports = [
    { label: "iPhone 13", brand: "Apple", year: 2021, full: "Apple iPhone 13 (128GB)", action: "REPAIRED", co2: 48.5 },
    { label: "Galaxy S22", brand: "Samsung", year: 2022, full: "Samsung Galaxy S22 5G", action: "DIAGNOSED", co2: 46.0 },
    { label: "OnePlus 9", brand: "OnePlus", year: 2021, full: "OnePlus 9 5G", action: "RECYCLED", co2: 14.5 },
    { label: "Redmi Note 12", brand: "Xiaomi", year: 2023, full: "Xiaomi Redmi Note 12 Pro", action: "REUSED", co2: 42.0 },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>EU ESPR & India CPCB Standard</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#f4f6f4] tracking-tight">
          Digital Product Passport
        </h1>
        <p className="text-xs sm:text-sm text-[#93a299]">
          Traceable circular lifecycle registry verifying hardware origin, clinical AI diagnostic telemetry, authorized component repairs, and closed-loop urban mining recovery.
        </p>
      </div>

      {/* Preset Quick Switcher */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs font-mono text-[#93a299] mr-2">Sample Passports:</span>
        {popularPassports.map((p) => (
          <button
            key={p.label}
            onClick={() => {
              setDeviceQuery(p.full);
              setActiveDevice({
                device: p.full,
                brand: p.brand,
                year: p.year,
                action: p.action,
                co2: p.co2,
              });
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all ${
              activeDevice.device === p.full
                ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/25"
                : "glass-eco text-[#93a299] hover:text-[#f4f6f4] border border-white/5"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Render Circular Passport */}
      <div className="pt-2">
        <CircularPassport
          device={activeDevice.device}
          brand={activeDevice.brand}
          releaseYear={activeDevice.year}
          currentAction={activeDevice.action}
          co2SavedKg={activeDevice.co2}
        />
      </div>

      {/* Passport Benefits Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
        <div className="p-5 rounded-2xl glass-eco border border-white/5 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-[#f4f6f4]">Verified Second-Life Resale</h4>
          <p className="text-xs text-[#93a299] leading-relaxed">
            Secondary buyers can scan the QR code to verify clean motherboard health, genuine replacement parts, and battery cycles.
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-eco border border-white/5 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300 flex items-center justify-center">
            <Leaf className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-[#f4f6f4]">Certified Scope-3 Carbon Ledger</h4>
          <p className="text-xs text-[#93a299] leading-relaxed">
            Corporate IT teams and individuals can claim verified GHG emissions avoidance backed by ITU-T L.1410 methodologies.
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-eco border border-white/5 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <QrCode className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-[#f4f6f4]">CPCB E-Waste Traceability</h4>
          <p className="text-xs text-[#93a299] leading-relaxed">
            When hardware reaches end-of-life, the passport provides statutory EPR certificate of destruction and urban mining recovery yield.
          </p>
        </div>
      </div>
    </div>
  );
};
