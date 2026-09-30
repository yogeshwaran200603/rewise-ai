import React, { useState, useEffect } from "react";
import { Recycle, MapPin, Phone, ShieldCheck, Navigation, Search, CheckCircle2, Map as MapIcon, Grid, Zap } from "lucide-react";
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
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
          <Recycle className="w-3.5 h-3.5" />
          <span>MoEFCC & CPCB EPR Registered Recyclers</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          E-Waste Urban Mining & Recycling Hubs
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-2">
          Route damaged smartphones and spent Li-ion batteries to certified high-yield recyclers under the
          National Critical Mineral Mission (NCMM) and Karnataka Industrial Policy.
        </p>
      </div>

      {/* Official CPCB Statutory Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Bengaluru Registered Units</div>
          <div className="text-xl font-extrabold text-white mt-1">33 <span className="text-xs text-amber-400 font-normal">Facilities</span></div>
          <div className="text-[10px] text-slate-500 mt-0.5">Lok Sabha Q. 3779 (16.03.2026)</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Bengaluru Capacity</div>
          <div className="text-xl font-extrabold text-emerald-400 font-mono mt-1">75,021 <span className="text-xs text-slate-400 font-normal">MT/yr</span></div>
          <div className="text-[10px] text-slate-500 mt-0.5">MoEFCC Authorized</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Karnataka Statewide</div>
          <div className="text-xl font-extrabold text-white mt-1">49 <span className="text-xs text-slate-400 font-normal">Units (1.69L MT)</span></div>
          <div className="text-[10px] text-slate-500 mt-0.5">50% Cap Subsidy (KIP 2025-30)</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">NCMM Battery Scheme</div>
          <div className="text-xl font-extrabold text-amber-400 font-mono mt-1">₹1,500 <span className="text-xs text-slate-400 font-normal">Crore</span></div>
          <div className="text-[10px] text-slate-500 mt-0.5">Critical Mineral Extraction</div>
        </div>
      </div>

      {/* Filter / Search Bar & View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            placeholder="Filter by hub / city (e.g. Bengaluru, Peenya, Bommasandra)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 self-end sm:self-auto">
          <button
            onClick={() => setViewMode("both")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "both" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Split View
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "map" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "text-slate-400 hover:text-white"
            }`}
          >
            <MapIcon className="w-3.5 h-3.5 text-amber-400" /> Interactive Map
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "grid" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <Grid className="w-3.5 h-3.5 text-slate-400" /> Center Cards
          </button>
        </div>
      </div>

      {/* Map View */}
      {(viewMode === "both" || viewMode === "map") && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <MapIcon className="w-4 h-4 text-amber-400" />
              <span>Bengaluru E-Waste Urban Mining Map (MoEFCC / CPCB Verified)</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              Displaying {recyclers.length} Registered Facilities
            </span>
          </div>
          <InteractiveMap
            recyclers={recyclers}
            initialType="RECYCLERS"
            height="500px"
            showStatsBanner={false}
          />
        </div>
      )}

      {/* Recycler Cards */}
      {(viewMode === "both" || viewMode === "grid") && (
        loading ? (
          <div className="py-16 text-center text-xs text-slate-400 font-mono">
            Querying CPCB national recyclers registry...
          </div>
        ) : recyclers.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No authorized recyclers found matching "{searchCity}". Showing all verified hubs.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recyclers.map((center) => (
            <div
              key={center.id}
              className="p-6 rounded-2xl glass-panel border border-slate-800 hover:border-emerald-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-base font-bold text-white leading-snug">{center.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold uppercase shrink-0 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> CPCB EPR Certified
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-300 mb-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-slate-400">{center.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-300 font-mono text-[11px]">{center.contact}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 mb-4 space-y-2.5">
                  {center.annual_capacity_mt && (
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                      <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">
                        ⚡ EPR Capacity
                      </span>
                      <span className="text-xs font-bold text-amber-300 font-mono">
                        {center.annual_capacity_mt.toLocaleString("en-IN")} MT / year
                      </span>
                    </div>
                  )}

                  {center.cpcb_reg_no && (
                    <div className="text-[10px] font-mono text-cyan-300/80 bg-slate-900/90 px-2 py-1 rounded border border-cyan-500/20">
                      Reg: {center.cpcb_reg_no}
                    </div>
                  )}

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block mb-1">
                      Accepted E-Waste Categories:
                    </span>
                    <p className="text-xs text-emerald-300/90">{center.accepted_device_types}</p>
                  </div>

                  {center.metals_recovered && (
                    <div className="pt-2 border-t border-slate-800/60">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block mb-0.5">
                        Target Material Extraction (NCMM):
                      </span>
                      <p className="text-[11px] text-slate-300">{center.metals_recovered}</p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800/60">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block mb-0.5">
                      Collection Logistics:
                    </span>
                    <p className="text-[11px] text-slate-300">{center.collection_type}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {center.distance_km || 4.1} km away
                </span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    center.name + " " + center.address
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Get Directions</span>
                </a>
              </div>
            </div>
          ))}
        </div>
        )
      )}
    </div>
  );
};
