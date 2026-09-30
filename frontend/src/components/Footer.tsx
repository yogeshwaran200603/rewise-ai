import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Leaf, HeartHandshake, ArrowRight } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/90 py-12 px-4 sm:px-6 lg:px-8 mt-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Col 1 */}
        <div className="md:col-span-1 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-900 border border-emerald-500/30 p-0.5 flex items-center justify-center shadow-md shadow-emerald-500/10">
              <img src="/logo-icon.png" alt="ReWise AI Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight block">ReWise AI</span>
              <span className="text-[9px] text-emerald-400 font-mono -mt-1 block">Circular Electronics</span>
            </div>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            AI-powered circular-economy platform for damaged electronics. Guiding users through responsible
            repair, resale, and zero-landfill e-waste recycling.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" /> CPCB EPR Compliance Aligned
          </div>
        </div>

        {/* Col 2 */}
        <div>
          <h4 className="text-xs uppercase font-semibold text-slate-300 tracking-wider mb-3">Core Circular Loop</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li className="flex items-center gap-1.5"><ArrowRight className="w-3 h-3 text-emerald-400" /> 1. Repair: Lifespan Extension</li>
            <li className="flex items-center gap-1.5"><ArrowRight className="w-3 h-3 text-emerald-400" /> 2. Reuse: Secondary Refurbishment</li>
            <li className="flex items-center gap-1.5"><ArrowRight className="w-3 h-3 text-emerald-400" /> 3. Resell: Value Recovery</li>
            <li className="flex items-center gap-1.5"><ArrowRight className="w-3 h-3 text-emerald-400" /> 4. Recycle: Urban Mining</li>
          </ul>
        </div>

        {/* Col 3 */}
        <div>
          <h4 className="text-xs uppercase font-semibold text-slate-300 tracking-wider mb-3">Resources & Hubs</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li><Link to="/diagnose" className="hover:text-emerald-400 transition-colors">Smartphone Diagnostic Engine</Link></li>
            <li><Link to="/service-centers" className="hover:text-emerald-400 transition-colors">Verified Indian Repair Schedules</Link></li>
            <li><Link to="/recycling-centers" className="hover:text-emerald-400 transition-colors">State PCB Recycler Directory</Link></li>
            <li><Link to="/rewards" className="hover:text-emerald-400 transition-colors">ReWise Circular Points</Link></li>
          </ul>
        </div>

        {/* Col 4 */}
        <div>
          <h4 className="text-xs uppercase font-semibold text-slate-300 tracking-wider mb-3">Academic & Environmental Base</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Embodied carbon factors calculated using Cordella et al. (2021) lifecycle assessment and OEM product carbon footprint declarations.
          </p>
          <div className="mt-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Over 1.41M tonnes of e-waste generated annually in India. Every repair counts.</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <p>© 2026 ReWise AI Inc. Built for Circular Economy Innovation.</p>
        <p className="flex items-center gap-1 text-slate-400">
          <span>Designed with</span> <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" /> <span>for Sustainable Electronics</span>
        </p>
      </div>
    </footer>
  );
};
