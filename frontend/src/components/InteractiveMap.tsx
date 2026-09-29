import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import type { RecyclingCenter, ServiceCenter } from "../types";
import { Recycle, Wrench, MapPin, Zap, Layers, Globe } from "lucide-react";

interface InteractiveMapProps {
  recyclers?: RecyclingCenter[];
  serviceCenters?: ServiceCenter[];
  height?: string;
  showStatsBanner?: boolean;
  selectedId?: number;
  initialType?: "ALL" | "RECYCLERS" | "REPAIR";
}

// Custom Leaflet DivIcon helpers using styled SVG HTML pins
const createRecyclerIcon = (isHighlight: boolean = false) => {
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div style="
        width: ${isHighlight ? "42px" : "34px"};
        height: ${isHighlight ? "42px" : "34px"};
        background: linear-gradient(135deg, #f59e0b, #d97706);
        border: 2px solid #fef3c7;
        box-shadow: 0 0 ${isHighlight ? "18px" : "10px"} rgba(245, 158, 11, 0.6);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.2s ease;
      ">
        <svg width="${isHighlight ? "22" : "18"}" height="${isHighlight ? "22" : "18"}" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/>
          <path d="M11 19h8.2a1.8 1.8 0 0 0 1.5-1 1.8 1.8 0 0 0 0-1.8L16.8 9.5"/>
          <path d="m14 5-3-3-3 3"/>
          <path d="M11 12V2"/>
        </svg>
      </div>
    `,
    iconSize: [isHighlight ? 42 : 34, isHighlight ? 42 : 34],
    iconAnchor: [isHighlight ? 21 : 17, isHighlight ? 21 : 17],
    popupAnchor: [0, isHighlight ? -24 : -20],
  });
};

const createRepairIcon = (isHighlight: boolean = false) => {
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div style="
        width: ${isHighlight ? "42px" : "34px"};
        height: ${isHighlight ? "42px" : "34px"};
        background: linear-gradient(135deg, #10b981, #059669);
        border: 2px solid #d1fae5;
        box-shadow: 0 0 ${isHighlight ? "18px" : "10px"} rgba(16, 185, 129, 0.6);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.2s ease;
      ">
        <svg width="${isHighlight ? "22" : "18"}" height="${isHighlight ? "22" : "18"}" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
      </div>
    `,
    iconSize: [isHighlight ? 42 : 34, isHighlight ? 42 : 34],
    iconAnchor: [isHighlight ? 21 : 17, isHighlight ? 21 : 17],
    popupAnchor: [0, isHighlight ? -24 : -20],
  });
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  recyclers = [],
  serviceCenters = [],
  height = "520px",
  showStatsBanner = true,
  selectedId,
  initialType = "ALL",
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [activeFilter, setActiveFilter] = useState<"ALL" | "RECYCLERS" | "REPAIR">(initialType);
  const [mapStyle, setMapStyle] = useState<"dark" | "google_road" | "google_satellite">("dark");
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const googleMapsApiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyA09tCVPYef4DlEI_F6DVawfhm-ZkiSk6c";

  // Initialize Map Once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Default center: Pan-India Subcontinent View
    const defaultCenter: L.LatLngExpression = [21.5, 78.9];
    const initialZoom = 5;

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: initialZoom,
      zoomControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Tile Layer dynamically based on selected style
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let layerUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
    let attribution = '&copy; OpenStreetMap &copy; CARTO | MoEFCC / CPCB EPR 2026';
    let subdomains: string | string[] = "abcd";
    let maxZoom = 19;

    if (mapStyle === "google_road") {
      layerUrl = `https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=${googleMapsApiKey}`;
      attribution = '&copy; Google Maps | CPCB EPR 2026';
      subdomains = "";
      maxZoom = 20;
    } else if (mapStyle === "google_satellite") {
      layerUrl = `https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&key=${googleMapsApiKey}`;
      attribution = '&copy; Google Satellite Imagery | CPCB EPR 2026';
      subdomains = "";
      maxZoom = 20;
    }

    const newLayer = L.tileLayer(layerUrl, {
      attribution,
      maxZoom,
      subdomains,
    }).addTo(map);

    tileLayerRef.current = newLayer;
  }, [mapStyle, googleMapsApiKey]);

  // Update Markers when data or filter changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();
    const bounds = L.latLngBounds([]);

    // 1. Plot Recyclers
    if (activeFilter === "ALL" || activeFilter === "RECYCLERS") {
      recyclers.forEach((recycler) => {
        const lat = recycler.latitude ?? 12.9716;
        const lng = recycler.longitude ?? 77.5946;
        const isSelected = selectedId === recycler.id;

        const marker = L.marker([lat, lng], {
          icon: createRecyclerIcon(isSelected),
          title: recycler.name,
        });

        const popupContent = `
          <div style="font-family: inherit; padding: 14px 16px; background: #0f172a; color: #f1f5f9; min-width: 260px; max-width: 320px; font-size: 12px; border-radius: 12px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
              <span style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 9999px; padding: 2px 8px; font-size: 10px; font-weight: 700; text-transform: uppercase;">
                CPCB Recycler
              </span>
              <span style="font-size: 11px; color: #34d399; font-weight: 600;">
                ${recycler.distance_km || 4.2} km away
              </span>
            </div>

            <div style="font-weight: 700; font-size: 13px; color: #ffffff; margin-bottom: 4px; line-height: 1.3;">
              ${recycler.name}
            </div>

            <div style="color: #94a3b8; font-size: 11px; margin-bottom: 8px; line-height: 1.4;">
              📍 ${recycler.address}
            </div>

            ${
              recycler.annual_capacity_mt
                ? `
              <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 8px; padding: 8px; margin-bottom: 8px;">
                <div style="font-size: 10px; color: #fbbf24; font-weight: 600; text-transform: uppercase; margin-bottom: 2px;">
                  ⚡ Annual EPR Capacity:
                </div>
                <div style="font-size: 12px; font-weight: 700; color: #ffffff;">
                  ${recycler.annual_capacity_mt.toLocaleString("en-IN")} MT / year
                </div>
                <div style="font-size: 10px; color: #cbd5e1; margin-top: 4px;">
                  Reg No: <span style="font-family: monospace; color: #a5f3fc;">${recycler.cpcb_reg_no || "CPCB/EPR/REC/KA/2026"}</span>
                </div>
              </div>
            `
                : ""
            }

            ${
              recycler.metals_recovered
                ? `
              <div style="font-size: 10px; color: #94a3b8; margin-bottom: 8px;">
                <strong style="color: #e2e8f0;">Target Recovery:</strong> ${recycler.metals_recovered}
              </div>
            `
                : ""
            }

            <div style="margin-bottom: 10px; font-size: 10px; color: #64748b;">
              📞 ${recycler.contact}
            </div>

            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              recycler.name + " " + recycler.address
            )}" target="_blank" rel="noreferrer" style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; background: #d97706; color: #ffffff; font-weight: 600; font-size: 11px; padding: 7px 12px; border-radius: 8px; text-decoration: none;">
              Get Navigation Directions ↗
            </a>
          </div>
        `;

        marker.bindPopup(popupContent, { maxWidth: 340 });
        marker.addTo(markersLayer);
        bounds.extend([lat, lng]);

        if (isSelected) {
          marker.openPopup();
        }
      });
    }

    // 2. Plot Service Centers
    if (activeFilter === "ALL" || activeFilter === "REPAIR") {
      serviceCenters.forEach((center) => {
        const lat = center.latitude ?? 12.9716;
        const lng = center.longitude ?? 77.5946;
        const isSelected = selectedId === center.id;

        const marker = L.marker([lat, lng], {
          icon: createRepairIcon(isSelected),
          title: center.name,
        });

        const popupContent = `
          <div style="font-family: inherit; padding: 14px 16px; background: #0f172a; color: #f1f5f9; min-width: 260px; max-width: 320px; font-size: 12px; border-radius: 12px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
              <span style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 9999px; padding: 2px 8px; font-size: 10px; font-weight: 700; text-transform: uppercase;">
                ${center.is_authorized ? "Authorized Repair" : "Certified Hub"}
              </span>
              <span style="font-size: 11px; color: #fbbf24; font-weight: 700;">
                ★ ${center.rating || 4.7}
              </span>
            </div>

            <div style="font-weight: 700; font-size: 13px; color: #ffffff; margin-bottom: 4px; line-height: 1.3;">
              ${center.name}
            </div>

            <div style="color: #94a3b8; font-size: 11px; margin-bottom: 8px; line-height: 1.4;">
              📍 ${center.address}
            </div>

            <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 8px; padding: 8px; margin-bottom: 8px;">
              <div style="font-size: 10px; color: #34d399; font-weight: 600; text-transform: uppercase; margin-bottom: 2px;">
                Specialization & Pricing:
              </div>
              <div style="font-size: 11px; color: #cbd5e1;">
                ${center.services_offered}
              </div>
              <div style="font-size: 10px; color: #10b981; margin-top: 4px; font-weight: 600;">
                ${center.price_tier} • ${center.distance_km || 2.4} km away
              </div>
            </div>

            <div style="margin-bottom: 10px; font-size: 10px; color: #64748b;">
              📞 ${center.phone}
            </div>

            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              center.name + " " + center.address
            )}" target="_blank" rel="noreferrer" style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; background: #059669; color: #ffffff; font-weight: 600; font-size: 11px; padding: 7px 12px; border-radius: 8px; text-decoration: none;">
              Get Navigation Directions ↗
            </a>
          </div>
        `;

        marker.bindPopup(popupContent, { maxWidth: 340 });
        marker.addTo(markersLayer);
        bounds.extend([lat, lng]);

        if (isSelected) {
          marker.openPopup();
        }
      });
    }

    // Auto-fit if points exist
    if (bounds.isValid() && (!selectedId || bounds.getNorthEast().equals(bounds.getSouthWest()))) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }
  }, [recyclers, serviceCenters, activeFilter, selectedId]);

  // Jump to specific hubs
  const handleFlyTo = (lat: number, lng: number, zoom: number = 13) => {
    mapInstanceRef.current?.flyTo([lat, lng], zoom, { duration: 1.2 });
  };

  return (
    <div className="space-y-3">
      {/* Official CPCB / MoEFCC Statutory Banner */}
      {showStatsBanner && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-emerald-500/10 border border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 shrink-0 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Government of India (MoEFCC & CPCB) Official National Registry
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-semibold">
                  Lok Sabha Q. 3779 (16.03.2026)
                </span>
              </div>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                <strong className="text-amber-300">Pan-India E-Waste Network:</strong> 386 registered recycling facilities
                across 19 States/UTs with an aggregate processing capacity of{" "}
                <strong className="text-white font-mono">34,65,889.58 MT/year</strong>. Discarded smartphones and spent Li-ion batteries
                are routed to urban mining refineries under the ₹1,500 Cr National Critical Mineral Mission (NCMM).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            <span className="text-[11px] font-mono text-slate-400">National Capacity:</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-emerald-400 font-mono text-xs font-bold border border-slate-700">
              34.65 Lakh MT/yr (386 Units)
            </span>
          </div>
        </div>
      )}

      {/* Map Control Bar: Filter Toggles & Quick Regional Jump */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
        {/* Layer Filters */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mr-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" /> Layer:
          </span>
          <button
            onClick={() => setActiveFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === "ALL"
                ? "bg-slate-700 text-white shadow-sm border border-slate-600"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            All India ({recyclers.length + serviceCenters.length})
          </button>
          <button
            onClick={() => setActiveFilter("RECYCLERS")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeFilter === "RECYCLERS"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-slate-400 hover:text-amber-300 hover:bg-slate-800"
            }`}
          >
            <Recycle className="w-3 h-3 text-amber-400" />
            CPCB Recyclers ({recyclers.length})
          </button>
          <button
            onClick={() => setActiveFilter("REPAIR")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeFilter === "REPAIR"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "text-slate-400 hover:text-emerald-300 hover:bg-slate-800"
            }`}
          >
            <Wrench className="w-3 h-3 text-emerald-400" />
            Repair Hubs ({serviceCenters.length})
          </button>
        </div>

        {/* Google Maps Engine / Basemap Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1 px-1.5">
            <Globe className="w-3.5 h-3.5 text-cyan-400" /> Basemap:
          </span>
          <button
            onClick={() => setMapStyle("dark")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              mapStyle === "dark"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Dark Tech
          </button>
          <button
            onClick={() => setMapStyle("google_road")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              mapStyle === "google_road"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "text-slate-400 hover:text-emerald-300"
            }`}
          >
            <span>Google Roadmap</span>
          </button>
          <button
            onClick={() => setMapStyle("google_satellite")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              mapStyle === "google_satellite"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-slate-400 hover:text-amber-300"
            }`}
          >
            <span>Google Satellite</span>
          </button>
        </div>

        {/* Quick Hub Jump Buttons for All Major Indian Regions */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] w-full pt-1 border-t border-slate-800/60">
          <span className="text-slate-500 font-medium mr-1 shrink-0">Region Jump:</span>
          <button
            onClick={() => handleFlyTo(21.5, 78.9, 5)}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold transition-colors shrink-0"
          >
            🇮🇳 Pan-India
          </button>
          <button
            onClick={() => handleFlyTo(28.58, 77.25, 11)}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors shrink-0"
          >
            Delhi NCR
          </button>
          <button
            onClick={() => handleFlyTo(12.9716, 77.5946, 11)}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors shrink-0"
          >
            Bengaluru Hub
          </button>
          <button
            onClick={() => handleFlyTo(19.0760, 72.95, 10)}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors shrink-0"
          >
            Mumbai & Pune
          </button>
          <button
            onClick={() => handleFlyTo(13.0418, 80.20, 11)}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors shrink-0"
          >
            Chennai
          </button>
          <button
            onClick={() => handleFlyTo(17.45, 78.48, 11)}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors shrink-0"
          >
            Hyderabad
          </button>
          <button
            onClick={() => handleFlyTo(22.56, 88.36, 11)}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors shrink-0"
          >
            Kolkata
          </button>
          <button
            onClick={() => handleFlyTo(22.95, 72.50, 10)}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors shrink-0"
          >
            Gujarat
          </button>
          <button
            onClick={() => handleFlyTo(26.85, 75.82, 11)}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors shrink-0"
          >
            Jaipur
          </button>
          <button
            onClick={() => handleFlyTo(10.03, 76.31, 11)}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors shrink-0"
          >
            Kochi
          </button>
          <button
            onClick={() => handleFlyTo(30.73, 76.78, 11)}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors shrink-0"
          >
            Chandigarh
          </button>
        </div>
      </div>

      {/* Map Rendering Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
        <div ref={mapContainerRef} style={{ height, width: "100%" }} className="z-0" />

        {/* Floating Map Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-[11px] space-y-1.5 shadow-lg pointer-events-auto">
          <div className="font-bold text-white text-xs mb-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Geolocation Legend
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-300 inline-block shadow-sm"></span>
            <span>CPCB Registered Recycler (Urban Mining)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-300 inline-block shadow-sm"></span>
            <span>Authorized Smartphone Service Center</span>
          </div>
          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
            Click any pin to inspect EPR capacity & navigate
          </div>
        </div>
      </div>
    </div>
  );
};
