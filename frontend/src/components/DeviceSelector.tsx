import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Smartphone,
  ChevronDown,
  Calendar,
  Battery,
  HardDrive,
  Cpu,
  ShieldCheck,
  Check,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { api } from "../services/api";
import type { BrandCount, DeviceModelItem, Device } from "../types";

export interface SelectedDeviceState {
  deviceId: number | null;
  brand: string;
  model: string;
  releaseYear: number;
  storageGb: number;
  batteryCondition: string;
  deviceDetail: Device | null;
}

interface DeviceSelectorProps {
  value: SelectedDeviceState;
  onChange: (updated: SelectedDeviceState) => void;
  onContinue?: () => void;
}

export const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  value,
  onChange,
  onContinue,
}) => {
  const [brands, setBrands] = useState<BrandCount[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [models, setModels] = useState<DeviceModelItem[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Brands
  useEffect(() => {
    let isMounted = true;
    api
      .getBrands()
      .then((data) => {
        if (!isMounted) return;
        setBrands(data);
        if (data.length > 0 && !value.brand) {
          const defaultBrand = data.find((b) => b.name === "Apple") || data.find((b) => b.name === "Samsung") || data[0];
          onChange({
            ...value,
            brand: defaultBrand.name,
          });
        }
      })
      .catch((err) => console.error("Error loading brands:", err))
      .finally(() => {
        if (isMounted) setLoadingBrands(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch Models for Brand
  useEffect(() => {
    if (!value.brand) return;
    let isMounted = true;
    setLoadingModels(true);

    api
      .getDeviceModels(value.brand)
      .then((modelList) => {
        if (!isMounted) return;
        setModels(modelList);
        // Pre-select first if not yet selected or if brand changed
        if (modelList.length > 0 && (!value.model || !modelList.some((m) => m.model_name === value.model))) {
          const first = modelList[0];
          fetchFullDevice(first.id, first.model_name, first.release_year || 2022);
        }
      })
      .catch((err) => console.error("Error loading models:", err))
      .finally(() => {
        if (isMounted) setLoadingModels(false);
      });

    return () => {
      isMounted = false;
    };
  }, [value.brand]);

  // 3. Search models debounced
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) return;
    const timer = setTimeout(async () => {
      try {
        const results = await api.searchDevices(searchQuery.trim(), value.brand);
        if (results && results.length > 0) {
          setModels((prev) => {
            const map = new Map<number, DeviceModelItem>();
            results.forEach((item) => map.set(item.id, item));
            prev.forEach((item) => {
              if (!map.has(item.id)) map.set(item.id, item);
            });
            return Array.from(map.values());
          });
        }
      } catch (err) {
        console.error("Search error:", err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, value.brand]);

  // 4. Fetch Full Device Details for specs
  const fetchFullDevice = async (id: number, modelName: string, year: number) => {
    try {
      const detail = await api.getDevice(id);
      const parsedStorage =
        detail.storage_options && detail.storage_options.length > 0
          ? parseInt(detail.storage_options[0]) || 128
          : 128;

      onChange({
        ...value,
        deviceId: id,
        model: modelName,
        releaseYear: detail.release_year || year,
        storageGb: parsedStorage,
        deviceDetail: detail,
      });
    } catch {
      onChange({
        ...value,
        deviceId: id,
        model: modelName,
        releaseYear: year,
        deviceDetail: null,
      });
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const filteredModels = models.filter((m) =>
    m.model_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Brand Selection Bar */}
      <div>
        <label className="text-xs font-mono uppercase tracking-widest text-[#93a299] block mb-3">
          1. Select Manufacturer
        </label>

        {loadingBrands ? (
          <div className="flex gap-2 overflow-x-auto py-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-10 w-24 rounded-2xl bg-slate-900 animate-pulse shrink-0" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {brands.slice(0, 10).map((b) => {
              const isSelected = value.brand.toLowerCase() === b.name.toLowerCase();
              return (
                <button
                  key={b.name}
                  type="button"
                  onClick={() => onChange({ ...value, brand: b.name, model: "", deviceId: null })}
                  className={`px-4 py-2 rounded-2xl text-xs font-semibold font-mono transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/25 scale-[1.02]"
                      : "bg-black/40 hover:bg-white/5 border border-white/5 text-[#93a299] hover:text-[#f4f6f4]"
                  }`}
                >
                  <span>{b.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? "bg-slate-950/20 text-slate-950" : "bg-white/5 text-[#93a299]"
                    }`}
                  >
                    {b.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Model Searchable Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <label className="text-xs font-mono uppercase tracking-widest text-[#93a299] block mb-3">
          2. Select Smartphone Model
        </label>

        <div
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full p-4 rounded-2xl glass-eco border border-white/10 hover:border-emerald-500/40 cursor-pointer flex items-center justify-between transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">
                {value.brand} Model
              </span>
              <span className="text-base sm:text-lg font-bold text-[#f4f6f4]">
                {value.model || (loadingModels ? "Loading models..." : "Select model...")}
              </span>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-[#93a299] transition-transform duration-200 ${
              isDropdownOpen ? "rotate-180 text-emerald-400" : ""
            }`}
          />
        </div>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 z-30 rounded-2xl glass-eco border border-emerald-500/30 shadow-2xl overflow-hidden p-3 space-y-3 bg-[#0a0f0d]">
            {/* Search Input inside Dropdown */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#93a299] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search among ${models.length} ${value.brand} models...`}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-[#f4f6f4] placeholder-[#93a299] focus:outline-none focus:border-emerald-500"
                autoFocus
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
              {filteredModels.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#93a299] font-mono">
                  No matching models found.
                </div>
              ) : (
                filteredModels.map((m) => {
                  const isCur = value.deviceId === m.id || value.model === m.model_name;
                  return (
                    <div
                      key={m.id}
                      onClick={() => {
                        fetchFullDevice(m.id, m.model_name, m.release_year || 2022);
                        setIsDropdownOpen(false);
                      }}
                      className={`p-3 rounded-xl cursor-pointer flex items-center justify-between text-xs transition-all ${
                        isCur
                          ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold"
                          : "hover:bg-white/5 text-[#f4f6f4]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Smartphone className="w-4 h-4 text-[#93a299]" />
                        <span>{m.model_name}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[11px] text-[#93a299]">
                        {m.release_year && <span>({m.release_year})</span>}
                        {isCur && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hardware Specifications Panel (Auto-populated from DB) */}
      {value.model && (
        <div className="p-5 sm:p-6 rounded-3xl glass-eco border border-white/5 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-[#93a299] flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Verified Hardware Specifications
            </span>
            <span className="text-[11px] font-mono text-emerald-400">
              {value.deviceDetail?.repairability_score ? `Repairability: ${value.deviceDetail.repairability_score}/10` : "Database Verified"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-[10px] text-[#93a299] block">Release Vintage</span>
              <span className="font-bold text-[#f4f6f4] text-sm mt-0.5 block">{value.releaseYear}</span>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-[10px] text-[#93a299] block">Storage Config</span>
              <select
                value={value.storageGb}
                onChange={(e) => onChange({ ...value, storageGb: Number(e.target.value) })}
                className="w-full bg-transparent font-bold text-[#f4f6f4] text-sm mt-0.5 focus:outline-none cursor-pointer"
              >
                {[64, 128, 256, 512, 1024].map((cap) => (
                  <option key={cap} value={cap} className="bg-[#0a0f0d] text-white">
                    {cap} GB
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-[10px] text-[#93a299] block">Battery Health</span>
              <select
                value={value.batteryCondition}
                onChange={(e) => onChange({ ...value, batteryCondition: e.target.value })}
                className="w-full bg-transparent font-bold text-teal-300 text-sm mt-0.5 focus:outline-none cursor-pointer"
              >
                <option value="Normal (~85%)" className="bg-[#0a0f0d] text-white">Normal (~85%)</option>
                <option value="Degraded (<80%)" className="bg-[#0a0f0d] text-white">Degraded (&lt;80%)</option>
                <option value="Swollen / Bulging" className="bg-[#0a0f0d] text-rose-400 font-bold">Swollen / Bulging</option>
                <option value="Does Not Charge" className="bg-[#0a0f0d] text-amber-400">Does Not Charge</option>
              </select>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-[10px] text-[#93a299] block">Display Substrate</span>
              <span className="font-bold text-[#f4f6f4] text-xs mt-0.5 block truncate">
                {value.deviceDetail?.display_type || "OLED / AMOLED"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
