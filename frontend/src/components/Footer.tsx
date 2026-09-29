import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Leaf, HeartHandshake, ArrowRight, ShieldAlert, Cpu } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/5 bg-[#070a09] py-16 px-4 sm:px-6 lg:px-8 mt-24 text-xs font-mono">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        {/* Col 1: Brand & Identity */}
        <div className="md:col-span-1 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl overflow-hidden bg-black border border-emerald-500/30 p-1 flex items-center justify-center shadow-md shadow-emerald-500/10">
              <img src="/logo-icon.png" alt="ReWise AI Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-lg font-black text-[#f4f6f4] tracking-tight block">ReWise</span>
              <span className="text-[10px] text-emerald-400 font-mono -mt-1 block">Ecology + Electronics + AI</span>
            </div>
          </div>
          <p className="text-[#93a299] text-xs leading-relaxed font-sans">
            "Don't Discard. Give It Another Life." ReWise fuses multimodal AI diagnostics with empirical pricing schedules and CPCB compliance to guide electronics into the circular loop.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" /> CPCB EPR & ITU-T L.1410 Aligned
          </div>
        </div>

        {/* Col 2: The 4 Circular Pillars */}
        <div>
          <h4 className="text-xs uppercase font-bold text-[#f4f6f4] tracking-wider mb-4">Circular Pathways</h4>
          <ul className="space-y-2.5 text-[#93a299]">
            <li className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors">
              <ArrowRight className="w-3 h-3 text-emerald-400" />
              <Link to="/service-centers">1. Repair: Lifespan Extension</Link>
            </li>
            <li className="flex items-center gap-1.5 hover:text-teal-300 transition-colors">
              <ArrowRight className="w-3 h-3 text-teal-400" />
              <Link to="/marketplace">2. Reuse: Second-Life Repurpose</Link>
            </li>
            <li className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
              <ArrowRight className="w-3 h-3 text-blue-400" />
              <Link to="/marketplace">3. Resell: Trade-In Valuation</Link>
            </li>
            <li className="flex items-center gap-1.5 hover:text-amber-400 transition-colors">
              <ArrowRight className="w-3 h-3 text-amber-400" />
              <Link to="/recycling-centers">4. Recycle: Zero-Landfill Mining</Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Ecosystem Hubs & Passport */}
        <div>
          <h4 className="text-xs uppercase font-bold text-[#f4f6f4] tracking-wider mb-4">Explore Ecosystem</h4>
          <ul className="space-y-2.5 text-[#93a299]">
            <li><Link to="/diagnose" className="hover:text-emerald-400 transition-colors">Diagnostic Intake Engine</Link></li>
            <li><Link to="/passport" className="hover:text-emerald-400 transition-colors">Digital Product Passport</Link></li>
            <li><Link to="/marketplace" className="hover:text-emerald-400 transition-colors">Circular Marketplace Intelligence</Link></li>
            <li><Link to="/service-centers" className="hover:text-emerald-400 transition-colors">Authorized Repair Clinics</Link></li>
            <li><Link to="/recycling-centers" className="hover:text-emerald-400 transition-colors">CPCB E-Waste Smelter Directory</Link></li>
            <li><Link to="/rewards" className="hover:text-emerald-400 transition-colors">ReWise Green Points Ledger</Link></li>
          </ul>
        </div>

        {/* Col 4: Scientific Governance & Admin */}
        <div>
          <h4 className="text-xs uppercase font-bold text-[#f4f6f4] tracking-wider mb-4">Governance & Audit</h4>
          <p className="text-xs text-[#93a299] leading-relaxed font-sans mb-3">
            CO₂e avoidance and urban mining yields calculated using standard Life Cycle Assessment (LCA) methods. Zero hallucination pricing.
          </p>
          <div className="p-3 rounded-2xl glass-eco border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#93a299]">Internal Platform Mode</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <Link
              to="/admin"
              className="w-full py-1.5 px-3 rounded-xl bg-black/60 hover:bg-white/5 border border-white/10 text-emerald-400 text-[11px] flex items-center justify-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin & Ledger Audit</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-[#93a299] gap-4">
        <p>© 2026 ReWise AI • Circular Economy Infrastructure for Electronics</p>
        <p className="flex items-center gap-1">
          <span>Rooted in</span> <Leaf className="w-3.5 h-3.5 text-emerald-400" /> <span>Responsible Climate Technology</span>
        </p>
      </div>
    </footer>
  );
};
