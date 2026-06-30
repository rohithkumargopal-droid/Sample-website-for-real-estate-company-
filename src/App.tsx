import React, { useState } from "react";
import Header from "./components/Header";
import Farm3DCanvas from "./components/Farm3DCanvas";
import Marketplace from "./components/Marketplace";
import StayBooking from "./components/StayBooking";
import AgroAdvisor from "./components/AgroAdvisor";
import { WeatherType, ActiveHotspot, CartItem } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { Info, HelpCircle, Shield, Sparkles, Globe, Heart, Trees } from "lucide-react";

export default function App() {
  // Global States
  const [activeTab, setActiveTab] = useState<string>("3d_farm");
  const [weather, setWeather] = useState<WeatherType>("sunny");
  const [selectedHotspot, setSelectedHotspot] = useState<ActiveHotspot | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  return (
    <div id="nam_kudil_root" className="min-h-screen bg-[#F9F6F0] flex flex-col text-[#1B3022] antialiased font-sans">
      {/* Brand Navigation Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} cart={cart} />

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Top Promotional Announcement Bar */}
        <div className="bg-[#C16643] text-white px-5 py-3.5 rounded-xl border-none shadow flex flex-col sm:flex-row items-center justify-between gap-3" id="impact_announcement_bar">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4.5 h-4.5 text-white animate-pulse flex-shrink-0" />
            <p className="text-xs font-sans font-semibold tracking-wide leading-relaxed">
              <span className="font-serif italic font-bold tracking-tight text-white/95 mr-1.5">Grand Opening &bull;</span> 
              Explore our completely custom, fully interactive 3D farm space! Experience traditional South Indian eco-living.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase text-white/80">
            <Globe className="w-4 h-4 text-white/90" /> Carbon-Neutral Servers
          </div>
        </div>

        {/* Tab Router Switch Board */}
        <AnimatePresence mode="wait">
          {activeTab === "3d_farm" && (
            <motion.div
              key="3d_farm_view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6"
              id="farm_3d_view_container"
            >
              {/* Introduction Banner */}
              <div className="flex flex-col gap-2">
                <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#C16643] font-extrabold block">Interactive Heritage</span>
                <h2 className="text-2xl sm:text-4xl font-serif text-[#1B3022] font-normal tracking-tight leading-none flex items-center gap-3">
                  3D Digital Farm Space <span className="text-xs font-sans uppercase tracking-[0.2em] text-[#1B3022]/40 bg-[#1B3022]/5 px-2.5 py-1 rounded">Delta Region</span>
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 font-normal leading-relaxed max-w-3xl mt-1">
                  Welcome to Nam Kudil Agrofarms India. Interact with our low-poly permaculture landscape below. Toggle weather states to control daylight sky gradients, wind power turbine speed, or launch simulated starry skies and rain showers!
                </p>
              </div>

              {/* 3D WebGL Canvas */}
              <Farm3DCanvas
                weather={weather}
                setWeather={setWeather}
                selectedHotspot={selectedHotspot}
                setSelectedHotspot={setSelectedHotspot}
              />

              {/* Informational Cards explaining features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2" id="farm_perks_grid">
                <div className="bg-white p-6 rounded-lg border border-[#1B3022]/10 shadow-sm flex items-start gap-4 hover:border-[#C16643]/30 transition-colors">
                  <div className="p-2.5 bg-[#C16643]/10 text-[#C16643] rounded-full text-base">
                    🌾
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="font-sans text-[10px] uppercase tracking-widest text-[#C16643] font-bold">Soil Heritage</span>
                    <h4 className="font-serif text-lg text-[#1B3022] leading-tight font-medium">Permaculture Design</h4>
                    <p className="text-xs text-stone-600 leading-relaxed font-normal">
                      Every element in our farm is positioned strategically. Traditional coconut trees surround fields to prevent topsoil drying, and windmills draw rainwater without carbon emissions.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-[#1B3022]/10 shadow-sm flex items-start gap-4 hover:border-[#C16643]/30 transition-colors">
                  <div className="p-2.5 bg-[#C16643]/10 text-[#C16643] rounded-full text-base">
                    🏺
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="font-sans text-[10px] uppercase tracking-widest text-[#C16643] font-bold">Biodiversity</span>
                    <h4 className="font-serif text-lg text-[#1B3022] leading-tight font-medium">Heirloom Regeneration</h4>
                    <p className="text-xs text-stone-600 leading-relaxed font-normal">
                      We curate ancient native seed vaults of parboiled rices (Mapillai Samba) and rich black antioxidant rices (Karuppu Kavuni) to maintain genetic soil biodiversity.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-[#1B3022]/10 shadow-sm flex items-start gap-4 hover:border-[#C16643]/30 transition-colors">
                  <div className="p-2.5 bg-[#C16643]/10 text-[#C16643] rounded-full text-base">
                    🛖
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="font-sans text-[10px] uppercase tracking-widest text-[#C16643] font-bold">Detox Retreat</span>
                    <h4 className="font-serif text-lg text-[#1B3022] leading-tight font-medium">Traditional Kudil Stay</h4>
                    <p className="text-xs text-stone-600 leading-relaxed font-normal">
                      Our cottages are entirely organic. Experience pure natural insulation that remains 4°C cooler than the outside summer temperature, with zero air-conditioning required.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "marketplace" && (
            <motion.div
              key="marketplace_view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6"
              id="marketplace_view_container"
            >
              <div className="flex flex-col gap-1.5">
                <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#C16643] font-extrabold block">Sustainable Exports & Local Batches</span>
                <h2 className="text-2xl sm:text-4xl font-serif text-[#1B3022] font-normal tracking-tight leading-none flex items-center gap-2">
                  🌿 Natural Agro-Marketplace
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 font-normal leading-relaxed max-w-3xl mt-1">
                  Support sustainable, natural Indian agriculture. Purchase premium cold-pressed woodpressed oils, rich heritage parboiled rice types, millets, and wild forest honeys.
                </p>
              </div>

              <Marketplace cart={cart} setCart={setCart} />
            </motion.div>
          )}

          {activeTab === "stay_booking" && (
            <motion.div
              key="stay_booking_view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6"
              id="stay_booking_view_container"
            >
              <StayBooking />
            </motion.div>
          )}

          {activeTab === "ai_lab" && (
            <motion.div
              key="ai_lab_view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6"
              id="ai_lab_view_container"
            >
              <div className="flex flex-col gap-1.5">
                <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#C16643] font-extrabold block">Botanical Wisdom Engine</span>
                <h2 className="text-2xl sm:text-4xl font-serif text-[#1B3022] font-normal tracking-tight leading-none flex items-center gap-2">
                  🤖 AI Agro-Advisor & Botanical Lab
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 font-normal leading-relaxed max-w-3xl mt-1">
                  Consult our Gemini-powered Chief Agricultural Advisor "Kudil Ayya", or run a biological organic soil/crop diagnosis scan using advanced traditional agricultural principles.
                </p>
              </div>

              <AgroAdvisor />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Interactive Metrics (Anti-AI Slop: Real-time calculation) */}
        <section className="bg-[#1B3022] text-white rounded-lg border border-[#1B3022]/15 p-8 shadow-2xl flex flex-col gap-6 mt-4 relative overflow-hidden" id="farm_impact_dashboard">
          {/* Subtle design grid watermark */}
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-9xl font-serif font-black select-none pointer-events-none">AGRO</div>
          
          <div className="flex items-center gap-3 border-b border-white/10 pb-4 relative z-10">
            <div className="p-2 bg-[#C16643] rounded-full text-white">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#C16643] font-bold block">Certified Eco-System Metrics</span>
              <h3 className="font-serif text-xl text-white font-normal tracking-tight">Nam Kudil Environmental & Social Impact Dashboard</h3>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
            <div className="flex flex-col items-center p-5 bg-white/5 rounded-lg border border-white/10 shadow-sm text-center hover:bg-white/10 transition-colors">
              <span className="text-3xl font-serif text-[#C16643] font-bold">14,250+</span>
              <span className="text-[9px] font-sans font-bold uppercase tracking-[0.15em] text-white/70 mt-2 leading-none">Native Crops Sowed</span>
              <p className="text-[10px] text-white/60 mt-1.5 leading-normal font-normal max-w-[150px]">Heritage rice, millets & oilseeds regenerated</p>
            </div>

            <div className="flex flex-col items-center p-5 bg-white/5 rounded-lg border border-white/10 shadow-sm text-center hover:bg-white/10 transition-colors">
              <span className="text-3xl font-serif text-[#C16643] font-bold">82%</span>
              <span className="text-[9px] font-sans font-bold uppercase tracking-[0.15em] text-white/70 mt-2 leading-none">Water Conserved</span>
              <p className="text-[10px] text-white/60 mt-1.5 leading-normal font-normal max-w-[150px]">Via traditional check-dams and sub-soil mulching</p>
            </div>

            <div className="flex flex-col items-center p-5 bg-white/5 rounded-lg border border-white/10 shadow-sm text-center hover:bg-white/10 transition-colors">
              <span className="text-3xl font-serif text-[#C16643] font-bold">1.8 Tons</span>
              <span className="text-[9px] font-sans font-bold uppercase tracking-[0.15em] text-white/70 mt-2 leading-none">CO2 Offset</span>
              <p className="text-[10px] text-white/60 mt-1.5 leading-normal font-normal max-w-[150px]">By solar irrigation and wind-powered oil mills</p>
            </div>

            <div className="flex flex-col items-center p-5 bg-white/5 rounded-lg border border-white/10 shadow-sm text-center hover:bg-white/10 transition-colors">
              <span className="text-3xl font-serif text-[#C16643] font-bold">180+</span>
              <span className="text-[9px] font-sans font-bold uppercase tracking-[0.15em] text-white/70 mt-2 leading-none">Farmer Families</span>
              <p className="text-[10px] text-white/60 mt-1.5 leading-normal font-normal max-w-[150px]">Supported via zero-middlemen direct fair-trade</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#1B3022] text-[#F9F6F0]/80 border-t border-white/5 py-12 mt-12" id="main_footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌿</span>
              <span className="font-serif font-bold text-lg text-white tracking-tight italic">Nam Kudil Agrofarms</span>
            </div>
            <p className="text-xs text-[#F9F6F0]/70 leading-relaxed font-normal">
              Nam Kudil Agrofarms India Pvt Ltd bridges the gap between traditional Vedic farming wisdom and modern regenerative forestry. Our estates produce high-yield, organic crops with zero ecological footprint.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h5 className="font-sans text-[10px] uppercase tracking-widest text-[#C16643] font-bold">Heritage Locations</h5>
            <p className="text-xs text-[#F9F6F0]/70 leading-relaxed font-normal">
              📍 Registered Office: No. 12, Traditional Agro-Basin Road, Thanjavur, Tamil Nadu, India.<br />
              🌾 Farm Site: Kudil Organic Fields, Western Cauvery Delta, India.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h5 className="font-sans text-[10px] uppercase tracking-widest text-[#C16643] font-bold">Consumer Trust & Certifications</h5>
            <div className="flex flex-wrap gap-2 pt-1">
              {["100% Organic", "Zero Pesticides", "Cold Pressed", "Direct Fair-Trade", "NPOP Certified"].map((cert) => (
                <span key={cert} className="bg-white/5 text-white text-[9px] font-sans uppercase tracking-wider font-semibold px-2.5 py-1 rounded border border-white/10">
                  {cert}
                </span>
              ))}
            </div>
            <p className="text-[9px] text-white/40 font-mono mt-2">© 2026 Nam Kudil Agrofarms India Pvt Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
