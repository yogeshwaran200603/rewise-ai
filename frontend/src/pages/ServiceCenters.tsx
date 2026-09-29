import React, { useState, useEffect } from "react";
import { MapPin, Phone, Star, ShieldCheck, Wrench, Navigation, Search, CheckCircle, Map as MapIcon, Grid, Zap } from "lucide-react";
import { api } from "../services/api";
import type { ServiceCenter } from "../types";
import { InteractiveMap } from "../components/InteractiveMap";

export const ServiceCenters: React.FC = () => {
  const [centers, setCenters] = useState<ServiceCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState("");
  const [viewMode, setViewMode] = useState<"both" | "map" | "grid">("both");

  useEffect(() => {
    setLoading(true);
    api
      .getServiceCenters(searchCity || undefined)
      .then((data) => setCenters(data))
      .catch((err) => console.error("Error loading service centers:", err))
      .finally(() => setLoading(false));
  }, [searchCity]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold uppercase">
          <Wrench className="w-3.5 h-3.5" />
          <span>Verified Indian Repair Network</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#f4f6f4] tracking-tight">
          Authorized Service Clinics
        </h1>
        <p className="text-xs sm:text-sm text-[#93a299]">
          Discover verified doorstep and walk-in service centers with OEM-grade diagnostics, clean-room screen replacements, and transparent labor pricing across India.
        </p>
      </div>

      {/* Filter / Search Bar & View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:max-w-md relative">
          <Search className="w-4 h-4 text-[#93a299] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            placeholder="Filter by city / neighborhood (e.g. Bengaluru, Indiranagar, Koramangala)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/60 border border-white/10 text-xs text-[#f4f6f4] placeholder-[#93a299] focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-1 p-1 rounded-2xl glass-eco border border-white/5 self-end sm:self-auto font-mono text-xs">
          <button
            onClick={() => setViewMode("both")}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "both" ? "bg-emerald-500 text-slate-950 font-bold" : "text-[#93a299] hover:text-[#f4f6f4]"
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> Split View
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "map" ? "bg-emerald-500 text-slate-950 font-bold" : "text-[#93a299] hover:text-[#f4f6f4]"
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" /> Map View
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "grid" ? "bg-emerald-500 text-slate-950 font-bold" : "text-[#93a299] hover:text-[#f4f6f4]"
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
              <MapIcon className="w-4 h-4 text-emerald-400" />
              <span>Pan-India Service Clinic Geolocation</span>
            </span>
            <span>Displaying {centers.length} Verified Hubs</span>
          </div>
          <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <InteractiveMap
              serviceCenters={centers}
              initialType="REPAIR"
              height="460px"
              showStatsBanner={false}
            />
          </div>
        </div>
      )}

      {/* Center Cards */}
      {(viewMode === "both" || viewMode === "grid") &&
        (loading ? (
          <div className="py-16 text-center text-xs font-mono text-emerald-400 animate-pulse">
            Loading authorized service hubs from database...
          </div>
        ) : centers.length === 0 ? (
          <div className="text-center py-12 text-[#93a299] text-xs font-mono">
            No service centers found matching "{searchCity}". Showing all verified hubs.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {centers.map((center) => (
              <div
                key={center.id}
                className="p-6 rounded-3xl glass-eco border border-white/5 hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-base font-bold text-[#f4f6f4] leading-snug">{center.name}</h3>
                    <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{center.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-medium mb-3">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{center.price_tier}</span>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#93a299] mb-4 font-mono">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span>{center.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="text-[#f4f6f4]">{center.phone}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
                    <span className="text-[10px] text-[#93a299] font-mono uppercase tracking-wider block mb-0.5">
                      Specialized Capabilities:
                    </span>
                    <p className="text-xs text-[#f4f6f4]">{center.services_offered}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> {center.distance_km || 2.4} km away
                  </span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      center.name + " " + center.address
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-white/5 border border-white/10 text-xs font-mono text-emerald-300 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Directions</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        ))}
    </div>
  );
};
