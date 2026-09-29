import React from "react";
import { Smartphone, Calendar, Battery, HardDrive, Cpu, ShieldCheck, Sparkles } from "lucide-react";
import type { Device } from "../types";

interface DeviceProfileProps {
  brand: string;
  model: string;
  releaseYear?: number;
  storageGb?: number;
  batteryCondition?: string;
  deviceDetail?: Device | null;
  size?: "sm" | "md" | "lg";
}

export const DeviceProfile: React.FC<DeviceProfileProps> = ({
  brand,
  model,
  releaseYear,
  storageGb,
  batteryCondition,
  deviceDetail,
  size = "md",
}) => {
  const year = releaseYear || deviceDetail?.release_year || 2023;
  const storage = storageGb || (deviceDetail?.storage_options?.[0] ? parseInt(deviceDetail.storage_options[0]) : 128);
  const battery = batteryCondition || deviceDetail?.battery_capacity || "4500 mAh";
  const repairScore = deviceDetail?.repairability_score || 7.5;

  return (
    <div className="p-5 sm:p-6 rounded-3xl glass-eco border border-white/5 relative overflow-hidden">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3.5">
          {/* Hardware Device Silhouette */}
          <div className="w-12 h-14 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-950 border border-emerald-500/30 p-1.5 flex flex-col items-center justify-between shrink-0 shadow-lg shadow-emerald-950/40">
            <div className="w-4 h-1 rounded-full bg-slate-700 mt-0.5" />
            <div className="w-full flex-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 my-1 flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="w-2.5 h-0.5 rounded-full bg-slate-700 mb-0.5" />
          </div>

          <div>
            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest block font-semibold">
              {brand}
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-[#f4f6f4] tracking-tight">{model}</h3>
            <span className="text-xs text-[#93a299] font-mono">Released {year}</span>
          </div>
        </div>

        {/* Repairability score badge if present */}
        {repairScore && (
          <div className="px-3 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-right">
            <span className="text-[10px] font-mono uppercase text-[#93a299] block">Repairability</span>
            <span className="text-sm font-extrabold text-emerald-400 font-mono">{repairScore}/10</span>
          </div>
        )}
      </div>

      {/* Specs Grid */}
      <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-white/5 text-xs font-mono">
        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex flex-col">
          <span className="text-[10px] text-[#93a299] flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            Vintage
          </span>
          <span className="font-bold text-[#f4f6f4] mt-0.5">{year}</span>
        </div>

        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex flex-col">
          <span className="text-[10px] text-[#93a299] flex items-center gap-1">
            <HardDrive className="w-3 h-3 text-slate-400" />
            Storage
          </span>
          <span className="font-bold text-[#f4f6f4] mt-0.5">{storage} GB</span>
        </div>

        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex flex-col">
          <span className="text-[10px] text-[#93a299] flex items-center gap-1">
            <Battery className="w-3 h-3 text-slate-400" />
            Battery
          </span>
          <span className="font-bold text-teal-300 mt-0.5 truncate">{battery}</span>
        </div>
      </div>
    </div>
  );
};
