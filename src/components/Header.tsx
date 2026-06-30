import React, { useEffect, useState } from "react";
import { Leaf, Navigation2, ShoppingCart, Sprout, Home, Calendar, Bot } from "lucide-react";
import { CartItem } from "../types";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cart: CartItem[];
}

export default function Header({ activeTab, setActiveTab, cart }: HeaderProps) {
  const [utcTime, setUtcTime] = useState("");

  // Keep a clean UTC clock running in header
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace("GMT", "UTC"));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header id="main_header" className="bg-[#F9F6F0] text-[#1B3022] border-b border-[#1B3022]/10 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Identity */}
        <div className="flex items-center gap-3" id="brand_identity">
          <div className="w-10 h-10 rounded-full border border-[#1B3022] flex items-center justify-center bg-transparent transform rotate-3 hover:rotate-12 transition-transform duration-300">
            <Leaf className="w-5 h-5 text-[#C16643] fill-[#C16643]/10" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tighter uppercase italic text-[#1B3022]">Nam Kudil</h1>
              <span className="text-[8px] uppercase tracking-[0.2em] font-bold bg-[#C16643] text-white px-2 py-0.5 rounded leading-none">AGROFARMS</span>
            </div>
            <p className="text-[10px] text-[#1B3022]/70 font-sans uppercase tracking-[0.15em] leading-none mt-1">Traditional Permaculture &bull; India</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex flex-wrap items-center justify-center gap-1 bg-white/40 p-1 rounded-xl border border-[#1B3022]/10" id="main_navigation">
          {[
            { id: "3d_farm", label: "3D Farm Explorer", icon: Navigation2 },
            { id: "marketplace", label: "Organic Marketplace", icon: ShoppingCart, badge: totalCartItems > 0 ? totalCartItems : undefined },
            { id: "stay_booking", label: "Eco-Stay Booking", icon: Calendar },
            { id: "ai_lab", label: "AI Agro Advisor Lab", icon: Bot },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav_tab_${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-lg text-[10px] font-sans font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                  isActive
                    ? "bg-[#1B3022] text-white shadow-md"
                    : "text-[#1B3022]/80 hover:bg-[#1B3022]/5 hover:text-[#1B3022]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="bg-[#C16643] text-white font-black text-[9px] px-1.5 py-0.2 rounded-full leading-none animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Live Metrics Overlay (Anti-AI Slop: Literal & Clean) */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-mono text-[#1B3022]" id="header_metrics">
          <div className="flex items-center gap-1.5 border-r border-[#1B3022]/10 pr-4">
            <Sprout className="w-4 h-4 text-[#C16643] animate-pulse" />
            <span className="text-[10px] font-sans uppercase tracking-[0.1em] font-semibold text-[#1B3022]/80">100% Organic</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[8px] font-sans font-bold text-[#C16643] uppercase tracking-[0.2em]">Global Clock</span>
            <span className="text-[10px] font-mono text-[#1B3022] font-semibold leading-none mt-0.5">{utcTime}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
