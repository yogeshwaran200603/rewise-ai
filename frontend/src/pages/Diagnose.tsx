import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wrench,
  Upload,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  Eye,
  Activity,
  Layers,
  HelpCircle,
  X,
  FileImage,
} from "lucide-react";
import { api, type DiagnosePayload } from "../services/api";
import type { DiagnoseFullResponse } from "../types";
import { DeviceSelector, type SelectedDeviceState } from "../components/DeviceSelector";
import { DiagnosticProgress } from "../components/DiagnosticProgress";
import { DeviceProfile } from "../components/DeviceProfile";

export const Diagnose: React.FC = () => {
  const navigate = useNavigate();

  // Current Step: 1 = Device, 2 = Symptoms, 3 = Inspection
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Device State
  const [deviceState, setDeviceState] = useState<SelectedDeviceState>({
    deviceId: null,
    brand: "Apple",
    model: "iPhone 13",
    releaseYear: 2021,
    storageGb: 128,
    batteryCondition: "Normal (~85%)",
    deviceDetail: null,
  });

  // Symptom State
  const [problemDescription, setProblemDescription] = useState(
    "Phone fell down yesterday. Display has vertical green lines and touch sometimes lags."
  );
  const [activeSymptoms, setActiveSymptoms] = useState<string[]>(["Screen"]);
  const [userPriority, setUserPriority] = useState<string>("Keep using my current phone");

  // Image Upload State
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStepMessage, setAnalysisStepMessage] = useState("");
  const [analysisPercent, setAnalysisPercent] = useState(25);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const symptomPills = [
    { label: "Screen", hint: "Cracked glass, black bleed, green line" },
    { label: "Battery", hint: "Fast drain, sudden shutdown, bulge" },
    { label: "Charging", hint: "Loose USB-C, intermittent contact" },
    { label: "Camera", hint: "Black camera screen, blurry lens" },
    { label: "Audio", hint: "Muffled speaker, mic not working" },
    { label: "Heating", hint: "Excessive warmth while idle" },
    { label: "Water damage", hint: "Liquid splash, submerged in water" },
    { label: "Performance", hint: "Bootloop, stuck on brand logo" },
  ];

  const tanglishExamples = [
    {
      title: "Tanglish Screen Drop:",
      text: "keela vizhunthuchu, display line varuthu but touch is fine",
    },
    {
      title: "Battery Fast Drain:",
      text: "battery draining fast, phone heat aaguthu while charging",
    },
    {
      title: "Water Submersion:",
      text: "water la vizhunthuchu, tried rice, display switch on aagala",
    },
  ];

  const toggleSymptom = (label: string) => {
    setActiveSymptoms((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  };

  const handleFile = (file: File) => {
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Sample Presets for Fast Hackathon Evaluation
  const loadPreset = (type: "screen" | "battery") => {
    setImageName(type === "screen" ? "iphone_screen_crack.svg" : "battery_bulge.svg");
    const svg =
      type === "screen"
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#080b0a"/><rect x="80" y="30" width="240" height="240" rx="24" fill="#131c17" stroke="#10b981" stroke-width="2"/><path d="M100 60 L220 180 L190 260 M220 180 L300 140" stroke="#34d399" stroke-width="3" fill="none"/><circle cx="220" cy="180" r="16" fill="#000" opacity="0.85"/><text x="200" y="285" fill="#93a299" font-size="11" text-anchor="middle" font-family="monospace">Telemetry: OLED Substrate Fracture + Green Bleed</text></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#080b0a"/><rect x="80" y="30" width="240" height="240" rx="24" fill="#131c17" stroke="#f59e0b" stroke-width="2"/><ellipse cx="200" cy="150" rx="85" ry="65" fill="#2d1c10" stroke="#f59e0b" stroke-width="3"/><text x="200" y="155" fill="#fcd34d" font-size="12" text-anchor="middle" font-family="monospace">Telemetry: Swollen Li-ion Pouch Cell Bulge</text></svg>`;

    setImageBase64("data:image/svg+xml;base64," + btoa(svg));
  };

  const handleRunDiagnosis = async () => {
    setIsAnalyzing(true);
    setErrorMsg(null);
    setAnalysisPercent(20);
    setAnalysisStepMessage(`Connecting to hardware diagnostic database for ${deviceState.brand} ${deviceState.model}...`);

    try {
      // Step progression reflecting actual pipeline
      setTimeout(() => {
        setAnalysisPercent(45);
        setAnalysisStepMessage("Parsing free-text symptoms & Tanglish negation boundaries...");
      }, 500);

      setTimeout(() => {
        setAnalysisPercent(70);
        setAnalysisStepMessage("Inspecting visual telemetry via Gemini Multimodal AI...");
      }, 1000);

      setTimeout(() => {
        setAnalysisPercent(90);
        setAnalysisStepMessage("Cross-referencing verified repair schedules & Cashify trade-in metrics...");
      }, 1500);

      const payload: DiagnosePayload = {
        device_id: deviceState.deviceId || undefined,
        brand: deviceState.brand,
        model: deviceState.model,
        release_year: deviceState.releaseYear,
        age_years: Math.max(0.5, 2026 - deviceState.releaseYear),
        storage_gb: deviceState.storageGb,
        battery_condition: deviceState.batteryCondition,
        problem_description: problemDescription,
        user_priority: userPriority,
        image_base64: imageBase64 || undefined,
      };

      const response: DiagnoseFullResponse = await api.diagnose(payload);

      setAnalysisPercent(100);
      setAnalysisStepMessage("Calibrating 4 circular disposition pathways...");
      setTimeout(() => {
        navigate("/diagnosis-result", { state: { result: response } });
      }, 400);
    } catch (err: any) {
      console.error("Diagnosis error:", err);
      setErrorMsg(err.message || "Diagnostic failed. Please verify backend is running on 127.0.0.1:8000.");
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold uppercase">
          <Wrench className="w-3.5 h-3.5" />
          <span>Multimodal Diagnostic Intake</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#f4f6f4] tracking-tight">
          Guided Device Diagnosis
        </h1>
        <p className="text-xs sm:text-sm text-[#93a299]">
          Three focused steps to understand your hardware fault and calculate transparent circular outcomes.
        </p>
      </div>

      {/* 3-Step Guided Stepper Bar */}
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between relative">
          {/* Connector Line */}
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-white/10 z-0" />
          <div
            className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-500 transition-all duration-300 z-0"
            style={{ width: currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "100%" }}
          />

          {/* Step 1 Pill */}
          <button
            onClick={() => setCurrentStep(1)}
            className={`relative z-10 w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-mono text-xs font-bold transition-all ${
              currentStep === 1
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 scale-110"
                : currentStep > 1
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                : "glass-eco text-[#93a299] border border-white/5"
            }`}
          >
            {currentStep > 1 ? <CheckCircle2 className="w-5 h-5" /> : <span>01</span>}
          </button>

          {/* Step 2 Pill */}
          <button
            onClick={() => setCurrentStep(2)}
            className={`relative z-10 w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-mono text-xs font-bold transition-all ${
              currentStep === 2
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 scale-110"
                : currentStep > 2
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                : "glass-eco text-[#93a299] border border-white/5"
            }`}
          >
            {currentStep > 2 ? <CheckCircle2 className="w-5 h-5" /> : <span>02</span>}
          </button>

          {/* Step 3 Pill */}
          <button
            onClick={() => setCurrentStep(3)}
            className={`relative z-10 w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-mono text-xs font-bold transition-all ${
              currentStep === 3
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 scale-110"
                : "glass-eco text-[#93a299] border border-white/5"
            }`}
          >
            <span>03</span>
          </button>
        </div>

        <div className="flex justify-between text-[11px] font-mono text-[#93a299] mt-3 px-1">
          <span className={currentStep === 1 ? "text-emerald-400 font-bold" : ""}>1. Device</span>
          <span className={currentStep === 2 ? "text-emerald-400 font-bold" : ""}>2. Symptoms</span>
          <span className={currentStep === 3 ? "text-emerald-400 font-bold" : ""}>3. Inspection</span>
        </div>
      </div>

      {/* Main Diagnostic Stage Card */}
      <div className="glass-eco-glow p-6 sm:p-10 rounded-3xl border border-emerald-500/30 relative">
        {/* Full Cinematic Analysis Screen Overlay */}
        {isAnalyzing && (
          <div className="absolute inset-0 z-30 bg-[#080b0a]/95 backdrop-blur-xl rounded-3xl flex items-center justify-center p-6">
            <DiagnosticProgress
              device={`${deviceState.brand} ${deviceState.model}`}
              stepMessage={analysisStepMessage}
              progressPercent={analysisPercent}
              hasImage={!!imageBase64}
            />
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: What device are you diagnosing? */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 block mb-1">
                Step 1 of 3
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f4f6f4] tracking-tight">
                What device are you diagnosing?
              </h2>
              <p className="text-xs text-[#93a299] mt-1">
                Select from our authentic 342+ smartphone catalog (2020–2026).
              </p>
            </div>

            <DeviceSelector value={deviceState} onChange={setDeviceState} />

            <div className="flex justify-end pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm font-mono tracking-wide transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2"
              >
                <span>Continue to Symptoms</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: What's wrong? */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 block mb-1">
                  Step 2 of 3
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f4f6f4] tracking-tight">
                  What's wrong?
                </h2>
                <p className="text-xs text-[#93a299] mt-1">
                  Describe what happened in natural English or colloquial Tanglish.
                </p>
              </div>

              {/* Active Device Mini Chip */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{deviceState.brand} {deviceState.model}</span>
              </div>
            </div>

            {/* Quick Symptom Chips */}
            <div>
              <label className="text-xs font-mono uppercase tracking-widest text-[#93a299] block mb-2.5">
                Quick-Select Symptoms:
              </label>
              <div className="flex flex-wrap gap-2">
                {symptomPills.map((p) => {
                  const isSelected = activeSymptoms.includes(p.label);
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => toggleSymptom(p.label)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-mono transition-all ${
                        isSelected
                          ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow-sm"
                          : "glass-eco text-[#93a299] hover:text-[#f4f6f4] border border-white/5"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Large Conversational Input */}
            <div>
              <label className="text-xs font-mono uppercase tracking-widest text-[#93a299] block mb-2.5">
                Detailed Problem Description:
              </label>
              <textarea
                rows={4}
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                placeholder="e.g. Phone fell on concrete, display has green lines and black spot on top right, but touch is still working..."
                className="w-full p-4 rounded-2xl bg-black/60 border border-white/10 text-sm text-[#f4f6f4] placeholder-[#93a299]/50 focus:outline-none focus:border-emerald-500 font-mono leading-relaxed"
              />
            </div>

            {/* Tanglish Examples Box */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">
                Tanglish & Colloquial Phrasing Supported:
              </span>
              <div className="flex flex-wrap gap-2">
                {tanglishExamples.map((ex, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setProblemDescription(ex.text)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-mono text-[#93a299] hover:text-emerald-300 transition-colors text-left"
                  >
                    "{ex.text}"
                  </button>
                ))}
              </div>
            </div>

            {/* User Priority Option */}
            <div className="pt-2">
              <label className="text-xs font-mono uppercase tracking-widest text-[#93a299] block mb-2">
                Primary Goal / Preference:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: "Keep using current phone", desc: "Prioritize repair & lifespan" },
                  { label: "Trade in for secondary resale", desc: "Maximize cash recovery" },
                  { label: "Zero-landfill e-waste disposal", desc: "Eco urban mining route" },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setUserPriority(opt.label)}
                    className={`p-3 rounded-xl border text-left font-mono text-xs transition-all ${
                      userPriority === opt.label
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold"
                        : "glass-eco text-[#93a299] hover:text-[#f4f6f4] border-white/5"
                    }`}
                  >
                    <span className="block text-[#f4f6f4] font-semibold">{opt.label}</span>
                    <span className="text-[10px] text-[#93a299] block mt-0.5">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-3 rounded-2xl glass-eco hover:bg-white/5 border border-white/10 text-xs font-mono text-[#93a299] hover:text-[#f4f6f4] flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm font-mono tracking-wide transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2"
              >
                <span>Continue to Visual Inspection</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Show us the damage. */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 block mb-1">
                  Step 3 of 3
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f4f6f4] tracking-tight">
                  Show us the damage.
                </h2>
                <p className="text-xs text-[#93a299] mt-1">
                  Upload a photo of your screen or chassis. Gemini Vision cross-references visible damage.
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{deviceState.brand} {deviceState.model}</span>
              </div>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
              }}
              className={`p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center relative cursor-pointer ${
                isDragOver
                  ? "border-emerald-400 bg-emerald-500/10"
                  : imageBase64
                  ? "border-emerald-500/40 bg-black/40"
                  : "border-white/10 hover:border-emerald-500/30 bg-black/20"
              }`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />

              {imageBase64 ? (
                <div className="space-y-3">
                  <div className="w-32 h-32 mx-auto rounded-2xl overflow-hidden border border-emerald-500/40 shadow-xl bg-black flex items-center justify-center relative">
                    <img src={imageBase64} alt="Damage Telemetry" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageBase64(null);
                        setImageName(null);
                      }}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/80 text-[#93a299] hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-bold block">{imageName}</span>
                  <span className="text-[11px] text-[#93a299] font-mono block">Click or drop to replace photo</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-[#f4f6f4] block">
                      Drop photo here or click to browse
                    </span>
                    <span className="text-xs text-[#93a299] font-mono mt-1 block">
                      Supports JPG, PNG, WEBP up to 10MB
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Test Presets */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl glass-eco border border-white/5">
              <span className="text-xs font-mono text-[#93a299]">Need a sample damage photo for testing?</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => loadPreset("screen")}
                  className="px-3 py-1.5 rounded-xl bg-black/60 hover:bg-white/5 border border-white/10 text-xs font-mono text-emerald-300 transition-colors"
                >
                  Load Cracked OLED Sample
                </button>
                <button
                  type="button"
                  onClick={() => loadPreset("battery")}
                  className="px-3 py-1.5 rounded-xl bg-black/60 hover:bg-white/5 border border-white/10 text-xs font-mono text-amber-300 transition-colors"
                >
                  Load Swollen Battery Sample
                </button>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-3 rounded-2xl glass-eco hover:bg-white/5 border border-white/10 text-xs font-mono text-[#93a299] hover:text-[#f4f6f4] flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleRunDiagnosis}
                className="px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm font-mono tracking-wide transition-all shadow-xl shadow-emerald-500/30 flex items-center gap-2 scale-100 hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Run ReWise AI Diagnosis</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
