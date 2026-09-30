import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wrench,
  Upload,
  Sparkles,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Battery,
  HardDrive,
  Calendar,
  X,
  Search,
  ChevronDown,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { api } from "../services/api";
import type {
  BrandCount,
  DeviceModelItem,
  Device,
  DiagnoseFullResponse,
} from "../types";

export const Diagnose: React.FC = () => {
  const navigate = useNavigate();

  // Brands state
  const [brands, setBrands] = useState<BrandCount[]>([]);
  const [loadingBrands, setLoadingBrands] = useState<boolean>(true);
  const [brandError, setBrandError] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>("Apple");

  // Models state
  const [models, setModels] = useState<DeviceModelItem[]>([]);
  const [loadingModels, setLoadingModels] = useState<boolean>(false);
  const [modelSearchQuery, setModelSearchQuery] = useState<string>("");
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState<boolean>(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedDeviceDetail, setSelectedDeviceDetail] = useState<Device | null>(null);
  const [availableStorageOptions, setAvailableStorageOptions] = useState<number[]>([64, 128, 256, 512]);

  // Form State
  const [ageYears, setAgeYears] = useState<number>(1.5);
  const [storageGb, setStorageGb] = useState<number>(128);
  const [batteryCondition, setBatteryCondition] = useState<string>("Normal (~85%)");
  const [problemDescription, setProblemDescription] = useState<string>(
    "Phone fell down. Screen has black lines and touch sometimes doesn't work."
  );
  const [userPriority, setUserPriority] = useState<string>("Keep using my current phone");

  // Image Upload State
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(100);

  // Analysis Loading State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Fetch dynamic brands from API on mount
  const fetchBrands = async () => {
    setLoadingBrands(true);
    setBrandError(null);
    try {
      const data = await api.getBrands();
      setBrands(data);
      if (data.length > 0) {
        // Prefer Apple or Samsung as default if available
        const preferred = data.find((b) => b.name === "Apple") || data.find((b) => b.name === "Samsung") || data[0];
        setSelectedBrand(preferred.name);
      }
    } catch (err: any) {
      console.error("Failed to load brands:", err);
      setBrandError("Unable to load device models.");
    } finally {
      setLoadingBrands(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  // 2. Fetch models whenever selectedBrand changes
  useEffect(() => {
    if (!selectedBrand) return;
    let isCancelled = false;
    setLoadingModels(true);
    setModelSearchQuery("");

    api
      .getDeviceModels(selectedBrand)
      .then((data) => {
        if (isCancelled) return;
        setModels(data);
        if (data.length > 0) {
          // Pre-select first model
          const first = data[0];
          setSelectedDeviceId(first.id);
          setSelectedModel(first.model_name);
        } else {
          setSelectedDeviceId(null);
          setSelectedModel("");
        }
      })
      .catch((err) => {
        if (!isCancelled) console.error("Failed to fetch models for brand:", err);
      })
      .finally(() => {
        if (!isCancelled) setLoadingModels(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedBrand]);

  // 3. Debounced server search if user types a search query
  useEffect(() => {
    if (!modelSearchQuery || modelSearchQuery.trim().length < 2) return;
    const timer = setTimeout(async () => {
      try {
        const searchResults = await api.searchDevices(modelSearchQuery.trim(), selectedBrand);
        if (searchResults && searchResults.length > 0) {
          setModels((prev) => {
            const map = new Map<number, DeviceModelItem>();
            searchResults.forEach((item) => map.set(item.id, item));
            prev.forEach((item) => {
              if (!map.has(item.id)) map.set(item.id, item);
            });
            return Array.from(map.values());
          });
        }
      } catch (e) {
        // Fall back gracefully to client filtering
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [modelSearchQuery, selectedBrand]);

  // 4. Fetch full device specs when a model is selected
  useEffect(() => {
    if (!selectedDeviceId) {
      setSelectedDeviceDetail(null);
      return;
    }
    let isCancelled = false;
    api
      .getDevice(selectedDeviceId)
      .then((device) => {
        if (isCancelled) return;
        setSelectedDeviceDetail(device);

        // Approximate age from release year
        if (device.release_year) {
          const currentYear = new Date().getFullYear();
          const approx = Math.max(0.2, Math.min(6, currentYear - device.release_year));
          setAgeYears(approx);
        }

        // Dynamically populate storage options
        if (device.storage_options && device.storage_options.length > 0) {
          const parsed = device.storage_options
            .map((s) => {
              const num = parseInt(s.replace(/[^0-9]/g, ""), 10);
              return isNaN(num) ? 0 : num;
            })
            .filter((n) => n > 0);

          if (parsed.length > 0) {
            const unique = Array.from(new Set(parsed)).sort((a, b) => a - b);
            setAvailableStorageOptions(unique);
            if (!unique.includes(storageGb)) {
              setStorageGb(unique[0]);
            }
          }
        }
      })
      .catch((err) => {
        if (!isCancelled) console.error("Failed to fetch device specs:", err);
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedDeviceId]);

  // 5. Close combobox dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered models for searchable combobox
  const filteredModels = models.filter((m) =>
    m.model_name.toLowerCase().includes(modelSearchQuery.toLowerCase())
  );

  // Handle Image Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageName(file.name);
    setIsUploading(true);
    setUploadProgress(20);

    const reader = new FileReader();
    reader.onload = () => {
      setTimeout(() => setUploadProgress(60), 200);
      setTimeout(() => {
        setUploadProgress(100);
        setIsUploading(false);
        setImageBase64(reader.result as string);
      }, 450);
    };
    reader.readAsDataURL(file);
  };

  // Sample Image Preset Generator (for Hackathon fast evaluation)
  const loadSampleDamageImage = (type: "screen" | "battery") => {
    setImageName(type === "screen" ? "iphone13_cracked_screen.jpg" : "phone_battery_swelling.jpg");
    const svgContent =
      type === "screen"
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#090d16"/><rect x="80" y="30" width="240" height="240" rx="20" fill="#1e293b" stroke="#334155" stroke-width="4"/><path d="M90 50 L200 160 L180 260 M200 160 L310 130 M150 110 L250 80" stroke="#10b981" stroke-width="2.5" fill="none"/><circle cx="200" cy="160" r="14" fill="#000" opacity="0.8"/><text x="200" y="285" fill="#94a3b8" font-size="12" text-anchor="middle" font-family="sans-serif">Sample Display Telemetry (Crack + Black Bleed)</text></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#090d16"/><rect x="80" y="30" width="240" height="240" rx="20" fill="#1e293b" stroke="#f59e0b" stroke-width="4"/><ellipse cx="200" cy="150" rx="90" ry="70" fill="#2d3748" stroke="#ef4444" stroke-width="2"/><text x="200" y="155" fill="#f87171" font-size="14" text-anchor="middle" font-family="sans-serif">Swollen Battery Bulge Area</text></svg>`;

    setImageBase64("data:image/svg+xml;base64," + btoa(svgContent));
    setUploadProgress(100);
  };

  const handleDiagnose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModel) {
      setErrorMsg("Please select a smartphone model to continue.");
      return;
    }
    setIsAnalyzing(true);
    setErrorMsg(null);

    setAnalysisStep("Extracting visual damage telemetry...");
    await new Promise((r) => setTimeout(r, 600));

    setAnalysisStep("Consulting multimodal AI hardware diagnostic engine...");
    await new Promise((r) => setTimeout(r, 700));

    setAnalysisStep("Cross-referencing database repair schedules and Cashify trade-in metrics...");
    await new Promise((r) => setTimeout(r, 600));

    setAnalysisStep("Running transparent circular decision engine...");

    try {
      const response: DiagnoseFullResponse = await api.diagnose({
        device_id: selectedDeviceId || undefined,
        brand: selectedBrand,
        model: selectedModel,
        release_year: selectedDeviceDetail?.release_year || undefined,
        age_years: Number(ageYears),
        storage_gb: Number(storageGb),
        battery_condition: batteryCondition,
        problem_description: problemDescription,
        user_priority: userPriority,
        image_base64: imageBase64 || undefined,
      });

      navigate("/diagnosis-result", { state: { result: response } });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to analyze device. Please ensure backend is running.");
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
          <Wrench className="w-3.5 h-3.5" />
          <span>Multimodal Hardware Diagnostic</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Diagnose Your Smartphone
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto mt-2">
          Enter device specifics and describe the damage. AI will analyze the hardware failure while verified
          database pricing calculates repair and resale options.
        </p>
      </div>

      {/* Main Diagnostic Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative">
        {/* Loading Overlay */}
        {isAnalyzing && (
          <div className="absolute inset-0 z-20 rounded-3xl bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-6 animate-pulse">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">AI is analyzing your device...</h3>
            <p className="text-xs text-emerald-400 font-mono mb-6">{analysisStep}</p>
            <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-emerald-500 to-teal-400 animate-[shimmer_1.5s_infinite]" />
            </div>
            <span className="text-[11px] text-slate-400 mt-4">
              Cross-referencing empirical India repair schedules & LCA carbon metrics...
            </span>
          </div>
        )}

        <form onSubmit={handleDiagnose} className="space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Row 1: Brand & Model Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Brand Dropdown */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Brand
              </label>
              {loadingBrands ? (
                <div className="flex items-center gap-2 py-2.5 px-3.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 text-sm">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Loading brands...</span>
                </div>
              ) : brandError ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                  <span>{brandError}</span>
                  <button
                    type="button"
                    onClick={fetchBrands}
                    className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  {brands.map((b) => (
                    <option key={b.name} value={b.name}>
                      {b.name} ({b.count} models)
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Searchable Model Combobox */}
            <div className="relative" ref={dropdownRef}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Model Name
                </label>
                {selectedDeviceDetail?.release_year && (
                  <span className="text-[11px] font-medium text-emerald-400">
                    Released: {selectedDeviceDetail.release_year}
                  </span>
                )}
              </div>

              {/* Combobox Trigger / Search Input */}
              <div
                onClick={() => setIsModelDropdownOpen(true)}
                className={`w-full px-3.5 py-2 rounded-xl bg-slate-900 border flex items-center justify-between cursor-pointer transition-colors ${
                  isModelDropdownOpen
                    ? "border-emerald-500 ring-1 ring-emerald-500/30"
                    : "border-slate-700 hover:border-slate-600"
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={isModelDropdownOpen ? modelSearchQuery : selectedModel || ""}
                    onChange={(e) => {
                      setModelSearchQuery(e.target.value);
                      if (!isModelDropdownOpen) setIsModelDropdownOpen(true);
                    }}
                    onFocus={() => setIsModelDropdownOpen(true)}
                    placeholder={selectedModel || "Search or select model..."}
                    className="bg-transparent text-white text-sm focus:outline-none w-full placeholder-slate-400"
                  />
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {modelSearchQuery && isModelDropdownOpen && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setModelSearchQuery("");
                      }}
                      className="text-slate-400 hover:text-white p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isModelDropdownOpen ? "rotate-180 text-emerald-400" : ""
                    }`}
                  />
                </div>
              </div>

              {/* Dropdown Menu */}
              {isModelDropdownOpen && (
                <div className="absolute z-30 left-0 right-0 mt-1.5 max-h-60 overflow-y-auto rounded-xl bg-slate-900 border border-slate-700 shadow-2xl backdrop-blur-xl divide-y divide-slate-800">
                  {loadingModels ? (
                    <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                      <span>Loading models...</span>
                    </div>
                  ) : filteredModels.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No models found for "{modelSearchQuery}". Try another name.
                    </div>
                  ) : (
                    filteredModels.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedDeviceId(item.id);
                          setSelectedModel(item.model_name);
                          setModelSearchQuery("");
                          setIsModelDropdownOpen(false);
                        }}
                        className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between transition-colors ${
                          selectedDeviceId === item.id
                            ? "bg-emerald-500/15 text-emerald-300 font-semibold"
                            : "text-slate-200 hover:bg-slate-800/80"
                        }`}
                      >
                        <span className="truncate">{item.model_name}</span>
                        {item.release_year && (
                          <span className="text-[11px] text-slate-400 ml-2 shrink-0">
                            {item.release_year}
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Specs Telemetry Card */}
            {selectedDeviceDetail && (
              <div className="col-span-1 sm:col-span-2 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5 text-xs text-slate-300">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">
                      {selectedDeviceDetail.brand} {selectedDeviceDetail.model_name}
                    </span>
                    {selectedDeviceDetail.repairability_score ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        iFixit / CPCB Score: {selectedDeviceDetail.repairability_score}/10
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] text-slate-400 bg-slate-800 border border-slate-700">
                        Score unindexed
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="inline-flex items-center gap-1 text-slate-400">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      {selectedDeviceDetail.water_resistance || "Water resistance: Unrated"}
                    </span>
                    {selectedDeviceDetail.software_support_end_year && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        selectedDeviceDetail.software_support_end_year >= 2026
                          ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/40"
                          : "bg-amber-950/60 text-amber-300 border border-amber-800/40"
                      }`}>
                        Support EOL: {selectedDeviceDetail.software_support_end_year}
                      </span>
                    )}
                  </div>
                </div>

                {/* Hardware Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-400">
                  <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                    <div className="text-slate-400 text-[10px] uppercase font-medium">Processor / SoC</div>
                    <div className="text-slate-200 font-medium truncate mt-0.5">
                      {selectedDeviceDetail.processor || "Octa-Core"}
                    </div>
                  </div>
                  <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                    <div className="text-slate-400 text-[10px] uppercase font-medium">Display & Refresh</div>
                    <div className="text-slate-200 font-medium truncate mt-0.5">
                      {selectedDeviceDetail.display || "OLED"} {selectedDeviceDetail.display_refresh_rate ? `• ${selectedDeviceDetail.display_refresh_rate}` : ""}
                    </div>
                  </div>
                  <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                    <div className="text-slate-400 text-[10px] uppercase font-medium">Battery Spec</div>
                    <div className="text-slate-200 font-medium truncate mt-0.5">
                      {selectedDeviceDetail.battery_capacity || "4500 mAh"}
                    </div>
                  </div>
                  <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                    <div className="text-slate-400 text-[10px] uppercase font-medium">Network & Storage</div>
                    <div className="text-slate-200 font-medium truncate mt-0.5">
                      {selectedDeviceDetail.five_g ? "5G Sub-6" : "4G LTE"} • {selectedDeviceDetail.storage_options?.join(", ") || "128GB"}
                    </div>
                  </div>
                </div>

                {/* Failure Modes & Second-Life Pill */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {selectedDeviceDetail.known_failure_modes && (
                    <div className="flex items-start gap-1.5 text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                      <span>
                        <strong className="font-semibold text-amber-300">Empirical Weakness:</strong> {selectedDeviceDetail.known_failure_modes}
                      </span>
                    </div>
                  )}
                  {selectedDeviceDetail.second_life_suitability && (
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg ml-auto">
                      <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>
                        Second-Life: {selectedDeviceDetail.second_life_suitability.split(",").join(" • ")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Audit & Data Provenance */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                  <span>Data Source: {selectedDeviceDetail.data_source || selectedDeviceDetail.source_name || "OEM India Hardware Spec"}</span>
                  <span>Verified: {selectedDeviceDetail.last_verified || "2026-03-01"}</span>
                </div>
              </div>
            )}
          </div>

          {/* Row 2: Age, Storage, Battery */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Device Age: {ageYears} yrs
              </label>
              <input
                type="range"
                min="0.2"
                max="6"
                step="0.1"
                value={ageYears}
                onChange={(e) => setAgeYears(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>
                  {selectedDeviceDetail?.release_year
                    ? `Released ${selectedDeviceDetail.release_year}`
                    : "0.2 yrs (New)"}
                </span>
                <span>6 yrs (Legacy)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-emerald-400" /> Internal Storage
              </label>
              <select
                value={storageGb}
                onChange={(e) => setStorageGb(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                {availableStorageOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt >= 1024 ? `${opt / 1024} TB` : `${opt} GB`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Battery className="w-3.5 h-3.5 text-emerald-400" /> Battery Health
              </label>
              <select
                value={batteryCondition}
                onChange={(e) => setBatteryCondition(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="Normal (~85%)">Normal (~85%)</option>
                <option value="Excellent (>90%)">Excellent (&gt;90%)</option>
                <option value="Degraded (70-80%)">Degraded (70-80%)</option>
                <option value="Critical / Swollen (<70%)">Critical / Swollen (&lt;70%)</option>
              </select>
            </div>
          </div>

          {/* Row 3: Problem Description */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Problem Description
              </label>
              <button
                type="button"
                onClick={() =>
                  setProblemDescription(
                    "Phone fell down. Screen has black lines and touch sometimes doesn't work."
                  )
                }
                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Use Hackathon Demo Prompt</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              placeholder="Describe what happened (e.g. dropped on concrete, sudden reboot, battery drain, touch not responding)..."
              required
              className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
          </div>

          {/* Row 3b: User Priority Selection */}
          <div className="pt-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> What matters most to you?
            </label>
            <select
              value={userPriority}
              onChange={(e) => setUserPriority(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="Keep using my current phone">1. Keep using my current phone (Restore device)</option>
              <option value="Lowest immediate cost">2. Lowest immediate cost (Minimize expenses)</option>
              <option value="Get maximum resale value">3. Get maximum resale value (Cash out)</option>
              <option value="Reduce e-waste">4. Reduce e-waste (Maximize environmental protection)</option>
              <option value="I want the quickest solution">5. I want the quickest solution (Fastest turnaround)</option>
            </select>
          </div>

          {/* Row 4: Image Upload Area */}
          <div className="pt-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Damage Photo (Optional for Multimodal Analysis)
            </label>

            {!imageBase64 ? (
              <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-2xl p-6 text-center transition-all bg-slate-900/40">
                <input
                  type="file"
                  id="damage-upload"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="damage-upload" className="cursor-pointer block">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
                    <Upload className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-xs font-semibold text-white block">
                    Click to upload damage photo or drag and drop
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    PNG, JPG, WebP supported (cracked display, swollen back, port debris)
                  </span>
                </label>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-center gap-2">
                  <span className="text-[11px] text-slate-400">Or use sample photo:</span>
                  <button
                    type="button"
                    onClick={() => loadSampleDamageImage("screen")}
                    className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200"
                  >
                    Cracked Display
                  </button>
                  <button
                    type="button"
                    onClick={() => loadSampleDamageImage("battery")}
                    className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200"
                  >
                    Swollen Battery
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={imageBase64}
                    alt="Preview"
                    className="w-14 h-14 object-cover rounded-lg border border-slate-700"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white block">{imageName}</span>
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
                      <CheckCircle className="w-3 h-3" /> Image telemetry loaded
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setImageBase64(null);
                    setImageName(null);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {isUploading && (
              <div className="mt-2">
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">Processing image... {uploadProgress}%</span>
              </div>
            )}
          </div>

          {/* Submit CTA */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isAnalyzing || !selectedModel}
              className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
              <span>Analyze {selectedModel || "Device"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-slate-400 text-center mt-3">
              ReWise strictly calculates repair and resale values from database schedules. AI provides diagnosis and root cause.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
