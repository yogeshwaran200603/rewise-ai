import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Wrench,
  MapPin,
  Recycle,
  TrendingUp,
  ShieldCheck,
  Award,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Leaf,
  BarChart3,
  Layers,
} from "lucide-react";

interface NavbarProps {
  userPoints?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ userPoints = 350 }) => {
  const location = useLocation();
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsExploreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsExploreOpen(false);
  }, [location.pathname]);

  const exploreLinks = [
    { to: "/service-centers", label: "Repair Hubs", desc: "AASP & OEM walk-in service clinics", icon: MapPin },
    { to: "/recycling-centers", label: "E-Waste Centers", desc: "CPCB authorized zero-landfill urban mining", icon: Recycle },
    { to: "/marketplace", label: "Circular Marketplace", desc: "Live trade-in schedules & arbitrage", icon: TrendingUp },
    { to: "/passport", label: "Device Passport", desc: "Traceable hardware lifecycle certificate", icon: ShieldCheck },
  ];

  const isExploreActive = exploreLinks.some((l) => location.pathname === l.to);

  return (
    <header className="sticky top-0 z-50 glass-eco border-b border-white/5 bg-[#080b0a]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl overflow-hidden bg-slate-950 border border-emerald-500/30 p-1 flex items-center justify-center shadow-lg shadow-emerald-500/15 group-hover:border-emerald-400 group-hover:scale-105 transition-all">
            <img src="/logo-icon.png" alt="ReWise AI Circular Emblem" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-[#f4f6f4] flex items-center gap-1.5">
              ReWise
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </span>
            <span className="hidden sm:block text-[9px] font-mono text-[#93a299] uppercase tracking-widest -mt-0.5">
              Circular Electronics
            </span>
          </div>
        </Link>

        {/* Desktop Primary Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/"
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold font-mono transition-all ${
              location.pathname === "/"
                ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                : "text-[#93a299] hover:text-[#f4f6f4] hover:bg-white/5"
            }`}
          >
            Home
          </Link>

          <Link
            to="/diagnose"
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold font-mono transition-all ${
              location.pathname === "/diagnose"
                ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                : "text-[#93a299] hover:text-[#f4f6f4] hover:bg-white/5"
            }`}
          >
            Diagnose
          </Link>

          {/* Explore Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsExploreOpen(!isExploreOpen)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold font-mono transition-all flex items-center gap-1.5 ${
                isExploreActive
                  ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                  : "text-[#93a299] hover:text-[#f4f6f4] hover:bg-white/5"
              }`}
            >
              <span>Explore</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isExploreOpen ? "rotate-180 text-emerald-400" : ""
                }`}
              />
            </button>

            {isExploreOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 p-2 rounded-2xl glass-eco-glow border border-emerald-500/30 shadow-2xl space-y-1 bg-[#090d0b] animate-in fade-in zoom-in-95 duration-150">
                {exploreLinks.map((link) => {
                  const Icon = link.icon;
                  const active = location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setIsExploreOpen(false)}
                      className={`p-3 rounded-xl flex items-start gap-3 transition-all ${
                        active
                          ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                          : "hover:bg-white/5 text-[#f4f6f4]"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 text-emerald-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold block">{link.label}</span>
                        <span className="text-[10px] text-[#93a299] font-mono leading-tight block mt-0.5">
                          {link.desc}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <Link
            to="/dashboard"
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold font-mono transition-all ${
              location.pathname === "/dashboard"
                ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                : "text-[#93a299] hover:text-[#f4f6f4] hover:bg-white/5"
            }`}
          >
            Impact
          </Link>

          <Link
            to="/rewards"
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold font-mono transition-all ${
              location.pathname === "/rewards"
                ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                : "text-[#93a299] hover:text-[#f4f6f4] hover:bg-white/5"
            }`}
          >
            Rewards
          </Link>
        </nav>

        {/* Right Action & Points */}
        <div className="flex items-center gap-3">
          <Link
            to="/rewards"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 border border-emerald-500/30 text-xs font-mono font-semibold text-emerald-400 hover:border-emerald-400 transition-colors shadow-sm"
          >
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>{userPoints} Pts</span>
          </Link>

          <Link
            to="/diagnose"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono tracking-wide transition-all shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/40"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Diagnose Device</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-[#93a299] hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#090d0b] px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-4 duration-200">
          <Link
            to="/"
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-[#f4f6f4] hover:bg-white/5"
          >
            Home
          </Link>
          <Link
            to="/diagnose"
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
          >
            Diagnose Device
          </Link>
          <Link
            to="/dashboard"
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-[#f4f6f4] hover:bg-white/5"
          >
            Impact Dashboard
          </Link>
          <Link
            to="/rewards"
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-[#f4f6f4] hover:bg-white/5"
          >
            Rewards Wallet
          </Link>

          <div className="pt-2 border-t border-white/5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#93a299] px-3 block mb-1">
              Explore Circular Pathways
            </span>
            {exploreLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono text-[#93a299] hover:text-[#f4f6f4] hover:bg-white/5"
              >
                <l.icon className="w-4 h-4 text-emerald-400" />
                <span>{l.label}</span>
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-[#93a299] px-2">
            <Link to="/admin" className="hover:text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin / Audit Portal</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
