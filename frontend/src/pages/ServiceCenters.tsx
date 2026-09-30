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
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
          <Wrench className="w-3.5 h-3.5" />
          <span>Verified Indian Repair Network</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Authorized Smartphone Service Centers
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-2">
          Discover verified doorstep and walk-in service centers with OEM-grade diagnostics, clean-room screen
          replacements, and transparent labor pricing in Bengaluru and across India.
        </p>
      </div>

      {/* Filter / Search Bar & View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            placeholder="Filter by city / neighborhood (e.g. Bengaluru, Indiranagar, Koramangala)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 self-end sm:self-auto">
          <button
            onClick={() => setViewMode("both")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "both" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" /> Split View
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "map" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "text-slate-400 hover:text-white"
            }`}
          >
            <MapIcon className="w-3.5 h-3.5 text-emerald-400" /> Interactive Map
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
              <MapIcon className="w-4 h-4 text-emerald-400" />
              <span>Bengaluru Service & Repair Hub Map</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              Displaying {centers.length} Verified Centers
            </span>
          </div>
          <InteractiveMap
            serviceCenters={centers}
            initialType="REPAIR"
            height="480px"
            showStatsBanner={false}
          />
        </div>
      )}

      {/* Center Cards */}
      {(viewMode === "both" || viewMode === "grid") && (
        loading ? (
          <div className="py-16 text-center text-xs text-slate-400 font-mono">
            Loading authorized service hubs from database...
          </div>
        ) : centers.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No service centers found matching "{searchCity}". Showing all verified hubs.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {centers.map((center) => (
            <div
              key={center.id}
              className="p-6 rounded-2xl glass-panel border border-slate-800 hover:border-emerald-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-base font-bold text-white leading-snug">{center.name}</h3>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{center.rating}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium mb-3">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{center.price_tier}</span>
                </div>

                <div className="space-y-2 text-xs text-slate-300 mb-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-slate-400">{center.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-300 font-mono text-[11px]">{center.phone}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 mb-4">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block mb-1">
                    Specialized Services:
                  </span>
                  <p className="text-xs text-slate-300">{center.services_offered}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> {center.distance_km || 2.4} km away
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
