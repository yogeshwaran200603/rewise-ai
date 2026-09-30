import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Cpu, Award, MapPin, Recycle, LayoutDashboard, Wrench, ShieldCheck } from "lucide-react";

interface NavbarProps {
  userPoints?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ userPoints = 350 }) => {
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Home", icon: Cpu },
    { to: "/diagnose", label: "Diagnose", icon: Wrench },
    { to: "/service-centers", label: "Repair Hubs", icon: MapPin },
    { to: "/recycling-centers", label: "E-Waste Centers", icon: Recycle },
    { to: "/rewards", label: "Rewards", icon: Award },
    { to: "/dashboard", label: "Impact Dashboard", icon: LayoutDashboard },
    { to: "/admin", label: "Admin", icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-emerald-500/30 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:border-emerald-400 group-hover:scale-105 transition-all">
            <img src="/logo-icon.png" alt="ReWise AI Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              ReWise <span className="text-emerald-400 font-mono text-xs px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">AI</span>
            </span>
            <span className="hidden sm:block text-[9px] text-slate-400 uppercase tracking-widest -mt-0.5 font-medium">
              Reduce • Reuse • Resell • Recycle
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User Points & Action Button */}
        <div className="flex items-center gap-3">
          <Link
            to="/rewards"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-emerald-500/30 text-xs font-semibold text-emerald-400 shadow-sm hover:border-emerald-400 transition-colors"
          >
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>{userPoints} ReWise Pts</span>
          </Link>

          <Link
            to="/diagnose"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs tracking-wide transition-all shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30"
          >
            Diagnose Device
          </Link>
        </div>
      </div>
    </header>
  );
};
