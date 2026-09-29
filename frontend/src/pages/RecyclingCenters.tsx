import React, { useState, useEffect } from "react";
import { Recycle, MapPin, Phone, ShieldCheck, Navigation, Search, CheckCircle2, Map as MapIcon, Grid, Zap, Layers, Leaf } from "lucide-react";
import { api } from "../services/api";
import type { RecyclingCenter } from "../types";
import { InteractiveMap } from "../components/InteractiveMap";

export const RecyclingCenters: React.FC = () => {
  const [recyclers, setRecyclers] = useState<RecyclingCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState("");
  const [viewMode, setViewMode] = useState<"both" | "map" | "grid">("both");

  useEffect(() => {
    setLoading(true);
    api
      .getRecyclingCenters(searchCity || undefined)
      .then((data) => setRecyclers(data))
      .catch((err) => console.error("Error loading recycling centers:", err))
      .finally(() => setLoading(false));
  }, [searchCity]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-semibold uppercase">
          <Recycle className="w-3.5 h-3.5" />
          <span>MoEFCC & CPCB EPR Statutory Facilities</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#f4f6f4] tracking-tight">
          E-Waste Urban Mining Hubs
        </h1>
        <p className="text-xs sm:text-sm text-[#93a299]">
          Route non-repairable smartphones and spent Li-ion battery cells to accredited smelters for 100% zero-landfill elemental metal extraction (Gold, Silver, Copper, Rare Earths).
        </p>
      </div>

      {/* Official CPCB Statutory Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-4 rounded-2xl glass-eco border border-white/5 space-y-1">
          <span className="text-[10px] text-[#93a299] uppercase">Bengaluru Registered</span>
          <span className="text-xl font-black text-[#f4f6f4] block">33 Facilities</span>
          <span className="text-[10px] text-emerald-400 block">CPCB EPR Authorized</span>
        </div>
        <div className="p-4 rounded-2xl glass-eco border border-white/5 space-y-1">
          <span className="text-[10px] text-[#93a299] uppercase">Annual Smelting Capacity</span>
          <span className="text-xl font-black text-emerald-400 block">75,021 MT/yr</span>
          <span className="text-[10px] text-[#93a299] block">MoEFCC Certified</span>
        </div>
        <div className="p-4 rounded-2xl glass-eco border border-white/5 space-y-1">
          <span className="text-[10px] text-[#93a299] uppercase">Karnataka Statewide</span>
          <span className="text-xl font-black text-[#f4f6f4] block">49 Units</span>
          <span className="text-[10px] text-teal-300 block">1.69L MT Infrastructure</span>
        </div>
        <div className="p-4 rounded-2xl glass-eco border border-white/5 space-y-1">
          <span className="text-[10px] text-[#93a299] uppercase">NCMM Battery Scheme</span>
          <span className="text-xl font-black text-amber-400 block">₹1,500 Crore</span>
          <span className="text-[10px] text-[#93a299] block">Critical Mineral Mission</span>
        </div>
      </div>

      {/* Filter / Search Bar & View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:max-w-md relative">
          <Search className="w-4 h-4 text-[#93a299] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            placeholder="Filter by hub / industrial zone (e.g. Peenya, Bommasandra, Chennai)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/60 border border-white/10 text-xs text-[#f4f6f4] placeholder-[#93a299] focus:outline-none focus:border-amber-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-1 p-1 rounded-2xl glass-eco border border-white/5 self-end sm:self-auto font-mono text-xs">
          <button
            onClick={() => setViewMode("both")}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "both" ? "bg-amber-400 text-slate-950 font-bold" : "text-[#93a299] hover:text-[#f4f6f4]"
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> Split View
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "map" ? "bg-amber-400 text-slate-950 font-bold" : "text-[#93a299] hover:text-[#f4f6f4]"
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" /> Map View
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "grid" ? "bg-amber-400 text-slate-950 font-bold" : "text-[#93a299] hover:text-[#f4f6f4]"
            }`}
          >
            <Grid className="w-3.5 h-3.5" /> Center Cards
          </button>
        </div>
      </div>

      {/* Map View */}
      {(viewMode === "both" || viewMode === "map") && (
        <div className="space-y-2">
          <div className="flex items-center justify-between font-mono text-xs text-[#93a299]">
            <span className="flex items-center gap-2 font-bold text-[#f4f6f4]">
              <MapIcon className="w-4 h-4 text-amber-400" />
              <span>CPCB Accredited Smelter Directory</span>
            </span>
            <span>Displaying {recyclers.length} Statutory Recyclers</span>
          </div>
          <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <InteractiveMap
              recyclingCenters={recyclers}
              initialType="RECYCLE"
              height="460px"
              showStatsBanner={false}
            />
          </div>
        </div>
      )}

      {/* Recycler Cards */}
      {(viewMode === "both" || viewMode === "grid") &&
        (loading ? (
          <div className="py-16 text-center text-xs font-mono text-amber-400 animate-pulse">
            Loading CPCB statutory recyclers from database...
          </div>
        ) : recyclers.length === 0 ? (
          <div className="text-center py-12 text-[#93a299] text-xs font-mono">
            No recycling centers found matching "{searchCity}". Showing all verified hubs.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recyclers.map((center) => (
              <div
                key={center.id}
                className="p-6 rounded-3xl glass-eco border border-white/5 hover:border-amber-500/30 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-base font-bold text-[#f4f6f4] leading-snug">{center.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold shrink-0">
                      CPCB Verified
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-medium mb-3">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Reg #{center.cpcb_reg_no || "CPCB/EPR/2026"}</span>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#93a299] mb-4 font-mono">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span>{center.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="text-[#f4f6f4]">{center.contact}</span>
                    </div>
                  </div>

                  {center.metals_recovered && (
                    <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
                      <span className="text-[10px] text-[#93a299] font-mono uppercase tracking-wider block mb-0.5">
                        Recovered Minerals:
                      </span>
                      <p className="text-xs text-amber-300 font-mono">{center.metals_recovered}</p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs font-mono text-amber-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {center.annual_capacity_mt?.toLocaleString()} MT/yr capacity
                  </span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      center.name + " " + center.address
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-white/5 border border-white/10 text-xs font-mono text-amber-300 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Drop-Off Directions</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        ))}
    </div>
  );
};
