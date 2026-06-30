import React, { useState } from "react";
import { StayBooking as StayBookingType } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Users, MapPin, CheckCircle, Star, Sparkles, Loader2, Compass, Sun, Sunset, Moon, Activity } from "lucide-react";

interface CottageDetail {
  id: "clay" | "bamboo" | "brick";
  name: string;
  tagline: string;
  description: string;
  pricePerNight: number;
  rating: number;
  reviews: number;
  capacity: string;
  amenities: string[];
  imageUrl: string;
}

const COTTAGES: CottageDetail[] = [
  {
    id: "clay",
    name: "Traditional Clay Kudil",
    tagline: "100% natural, bio-insulated clay-thatch cottage stay",
    description: "Our signature heritage eco-cottage built with raw river clay, unbaked brick, and thatched coconut leaves. Cooled purely by natural airflow and traditional architecture. Floor washed in fresh organic herbal extracts.",
    pricePerNight: 2800,
    rating: 4.95,
    reviews: 142,
    capacity: "2-3 Adults",
    amenities: ["Natural cooling", "Earthy open-to-sky shower", "Traditional hammock", "Heritage copper water vessel"],
    imageUrl: "https://picsum.photos/seed/clay_cottage/600/400",
  },
  {
    id: "bamboo",
    name: "Bamboo Palm Canopy (Treehouse)",
    tagline: "Eco-canopy cottage high up in the coconut palms",
    description: "Perched 12 feet above ground in our robust coconut trees. Built entirely with sustainable golden bamboo, traditional hemp ropes, and high palm-leaf thatch. Experience unmatched starry nights and soft winds.",
    pricePerNight: 3500,
    rating: 4.9,
    reviews: 86,
    capacity: "2 Adults (Ideal for couples)",
    amenities: ["Panoramic farm view deck", "Stars skylight roof", "Organic cotton linens", "Herbal tea kettle"],
    imageUrl: "https://picsum.photos/seed/bamboo_treehouse/600/400",
  },
  {
    id: "brick",
    name: "Baked Clay Heritage Suite",
    tagline: "Premium baked terracotta brick masonry with garden courtyard",
    description: "An elegant, spacious farm suite featuring traditional Athangudi tile flooring, red baked-brick pillars, and a private enclosed courtyard garden. Perfectly balances luxury and farm life simplicity.",
    pricePerNight: 4200,
    rating: 4.88,
    reviews: 110,
    capacity: "Up to 4 Adults (Perfect for families)",
    amenities: ["Private organic garden porch", "Traditional stone mortar workspace", "Copper bathing tub", "Handcrafted swing"],
    imageUrl: "https://picsum.photos/seed/heritage_brick/600/400",
  },
];

const FARM_ACTIVITIES = [
  { id: "safari", name: "Traditional Bullock Cart Safari", price: 350, icon: "🐄", desc: "Ride across scenic village borders and natural organic canals" },
  { id: "harvest", name: "Early Morning Paddy Harvest", price: 0, icon: "🌾", desc: "Learn traditional sickle harvesting and bund construction first-hand" },
  { id: "pottery", name: "Clay Pottery Wheel Workshop", price: 400, icon: "🏺", desc: "Craft your own clay vessels with our village master potter" },
  { id: "gazing", name: "Star Gazing on the Kudil Porch", price: 150, icon: "🌌", desc: "Telescope cosmic observations under dark zero-pollution farm skies" },
  { id: "cooking", name: "Traditional Firewood Cooking Class", price: 500, icon: "🔥", desc: "Learn clay-pot firewood cooking with millet & woodpressed oils" },
];

export default function StayBooking() {
  const [booking, setBooking] = useState<StayBookingType>({
    checkIn: "2026-07-10",
    checkOut: "2026-07-12",
    cottageType: "clay",
    guests: 2,
    activities: ["harvest"],
  });

  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCottage = COTTAGES.find((c) => c.id === booking.cottageType) || COTTAGES[0];

  // Price calculations
  const checkInDate = new Date(booking.checkIn);
  const checkOutDate = new Date(booking.checkOut);
  const nights = Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));

  const baseStayPrice = selectedCottage.pricePerNight * nights;
  const activitiesPrice = booking.activities.reduce((sum, actId) => {
    const act = FARM_ACTIVITIES.find((a) => a.id === actId);
    return sum + (act ? act.price : 0);
  }, 0) * booking.guests;

  const totalStayPrice = baseStayPrice + activitiesPrice;

  const handleActivityToggle = (actId: string) => {
    setBooking((prev) => {
      const exists = prev.activities.includes(actId);
      if (exists) {
        return { ...prev, activities: prev.activities.filter((a) => a !== actId) };
      }
      return { ...prev, activities: [...prev.activities, actId] };
    });
  };

  const handleBookStay = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setBookingConfirmed(true);
    }, 1500);
  };

  return (
    <div id="stay_booking_workspace" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* LEFT: Cottage Showcase (7 cols) */}
      <div id="cottage_catalog" className="lg:col-span-7 flex flex-col gap-8">
        <div className="flex flex-col gap-1.5">
          <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#C16643] font-extrabold block">Rejuvenating Stays</span>
          <h3 className="font-serif text-2xl sm:text-3xl text-[#1B3022] font-normal tracking-tight flex items-center gap-2">
            <Compass className="w-6 h-6 text-[#C16643] animate-spin-slow" /> Nam Kudil Heritage Eco-Tourism
          </h3>
          <p className="text-xs text-stone-600 font-normal leading-relaxed max-w-2xl mt-1">
            Unplug from concrete cages and toxic pollutants. Inhabit our 100% natural heritage clay cottages. Breathe pure farm air, consume organic food harvests, and heal your body & mind.
          </p>
        </div>

        {/* Cottage List cards */}
        <div className="flex flex-col gap-6">
          {COTTAGES.map((cot) => (
            <div
              key={cot.id}
              id={`cottage_card_${cot.id}`}
              className={`bg-white rounded-lg border overflow-hidden flex flex-col md:flex-row shadow-sm transition-all ${
                booking.cottageType === cot.id
                  ? "ring-1 ring-[#1B3022] border-transparent scale-[1.01] shadow-md"
                  : "border-[#1B3022]/10 hover:border-[#1B3022]/30"
              }`}
            >
              {/* Image panel */}
              <div className="w-full md:w-5/12 h-48 md:h-auto bg-[#F9F6F0] relative">
                <img
                  src={cot.imageUrl}
                  alt={cot.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-3 left-3 bg-[#1B3022] text-[#F9F6F0] px-3 py-1 rounded text-xs font-serif font-bold shadow-sm">
                  ₹{cot.pricePerNight} <span className="text-[9px] font-sans opacity-75 font-normal">/ night</span>
                </span>
              </div>

              {/* Text details panel */}
              <div className="w-full md:w-7/12 p-5 flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="text-xs font-sans font-bold text-stone-700">{cot.rating}</span>
                    <span className="text-[10px] text-stone-400">({cot.reviews} stays)</span>
                  </div>
                  <h4 className="font-serif text-lg text-[#1B3022] font-semibold leading-tight">{cot.name}</h4>
                  <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#C16643]">{cot.tagline}</p>
                  <p className="text-[11.5px] text-stone-600 leading-relaxed mt-1 font-normal">{cot.description}</p>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {cot.amenities.map((amen, idx) => (
                      <span key={idx} className="bg-[#1B3022]/5 text-[#1B3022] text-[9px] font-sans uppercase tracking-wider font-semibold px-2 py-0.5 rounded border border-[#1B3022]/10">
                        {amen}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-[#1B3022]/5 pt-3">
                  <span className="text-[9px] text-[#C16643] font-sans font-bold uppercase tracking-widest">Capacity: {cot.capacity}</span>
                  <button
                    id={`btn_select_cot_${cot.id}`}
                    onClick={() => setBooking((prev) => ({ ...prev, cottageType: cot.id }))}
                    className={`px-4 py-2 rounded text-xs font-sans font-bold transition-all ${
                      booking.cottageType === cot.id
                        ? "bg-[#1B3022] text-[#F9F6F0] shadow-sm cursor-default"
                        : "bg-white text-stone-700 border border-stone-200 hover:bg-[#1B3022] hover:text-white"
                    }`}
                  >
                    {booking.cottageType === cot.id ? "Selected Kudil" : "Choose Cottage"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Stay Planner & Booking Form (5 cols) */}
      <div id="booking_form_panel" className="lg:col-span-5 flex flex-col gap-6">
        <div className="bg-white rounded-lg border border-[#1B3022]/10 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3 border-b border-[#1B3022]/5 pb-3">
            <div className="p-2 bg-[#1B3022]/5 text-[#C16643] rounded-full">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-[#1B3022] font-semibold">Kudil Stay Planner</h3>
              <p className="text-[10px] text-stone-500 font-medium">Design your traditional agricultural holiday</p>
            </div>
          </div>

          <div className="space-y-4" id="stay_booking_form">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-sans font-bold uppercase tracking-widest text-[#1B3022]/70 mb-1">Check-In Date</label>
                <input
                  type="date"
                  id="bk_checkin"
                  value={booking.checkIn}
                  onChange={(e) => setBooking((prev) => ({ ...prev, checkIn: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#1B3022]/15 rounded text-xs text-[#1B3022] focus:outline-none focus:ring-1 focus:ring-[#C16643] focus:border-[#C16643]"
                />
              </div>
              <div>
                <label className="block text-[9px] font-sans font-bold uppercase tracking-widest text-[#1B3022]/70 mb-1">Check-Out Date</label>
                <input
                  type="date"
                  id="bk_checkout"
                  value={booking.checkOut}
                  onChange={(e) => setBooking((prev) => ({ ...prev, checkOut: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#1B3022]/15 rounded text-xs text-[#1B3022] focus:outline-none focus:ring-1 focus:ring-[#C16643] focus:border-[#C16643]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-sans font-bold uppercase tracking-widest text-[#1B3022]/70 mb-1 flex justify-between items-center">
                <span>Number of Guests</span>
                <span className="text-[9px] text-[#C16643] font-bold">{booking.guests} patrons</span>
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    id={`btn_guests_${n}`}
                    onClick={() => setBooking((prev) => ({ ...prev, guests: n }))}
                    className={`flex-1 py-2 text-xs font-sans font-bold rounded border transition-all ${
                      booking.guests === n
                        ? "bg-[#1B3022] text-[#F9F6F0] border-[#1B3022] shadow-sm"
                        : "bg-white text-stone-700 border-[#1B3022]/10 hover:bg-stone-50"
                    }`}
                  >
                    {n} Guest{n > 1 ? "s" : ""}
                  </button>
                ))}
              </div>
            </div>

            {/* Activities Checkbox List */}
            <div>
              <label className="block text-[9px] font-sans font-bold uppercase tracking-widest text-[#1B3022]/70 mb-2">Heritage Village Activities (Optional)</label>
              <div className="space-y-2">
                {FARM_ACTIVITIES.map((act) => {
                  const isChecked = booking.activities.includes(act.id);
                  return (
                    <button
                      key={act.id}
                      id={`chk_act_${act.id}`}
                      onClick={() => handleActivityToggle(act.id)}
                      className={`w-full p-3 rounded border text-left transition-all flex items-start gap-3 ${
                        isChecked
                          ? "bg-[#1B3022]/5 border-[#1B3022]/20 shadow-sm"
                          : "bg-white border-[#1B3022]/10 hover:bg-stone-50/50"
                      }`}
                    >
                      <span className="text-xl leading-none">{act.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-serif font-bold text-[#1B3022] leading-none">{act.name}</span>
                          <span className="text-[10px] text-[#C16643] font-bold leading-none">
                            {act.price > 0 ? `+₹${act.price}/person` : "Complimentary"}
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-500 mt-1 leading-normal font-normal">{act.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Total Pricing calculation Breakdown */}
            <div className="bg-[#F9F6F0] border border-[#1B3022]/10 p-4 rounded space-y-2.5">
              <span className="text-[9px] uppercase tracking-widest font-sans font-bold text-[#C16643] block">Stay Price Summary:</span>
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-600 font-normal">{selectedCottage.name} ({nights} Night{nights > 1 ? "s" : ""})</span>
                <span className="font-semibold text-stone-800">₹{baseStayPrice}</span>
              </div>
              {booking.activities.length > 0 && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-600 font-normal">Selected Activities ({booking.guests} Guests)</span>
                  <span className="font-semibold text-stone-800">₹{activitiesPrice}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-xs border-t border-[#1B3022]/10 pt-2.5 font-bold">
                <span className="text-stone-800">Grand Total:</span>
                <span className="text-sm font-serif font-bold text-[#1B3022]">₹{totalStayPrice}</span>
              </div>
            </div>

            <button
              id="btn_book_stay_confirm"
              onClick={handleBookStay}
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#C16643] hover:bg-[#b05836] disabled:bg-stone-300 text-white font-sans font-extrabold text-xs rounded uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Reserving cottage...
                </>
              ) : (
                <>
                  Book My Traditional Stay
                </>
              )}
            </button>
          </div>
        </div>

        {/* Chronological booking receipt and itinerary */}
        <AnimatePresence>
          {bookingConfirmed && (
            <motion.div
              id="itinerary_receipt"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="bg-[#1B3022] text-[#F9F6F0] rounded-lg border border-white/15 shadow-xl p-6 flex flex-col gap-4 relative overflow-hidden"
            >
              {/* Leaf watermarks */}
              <div className="absolute top-2 right-2 opacity-5 animate-pulse text-8xl">🌱</div>

              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-[#C16643]" />
                  <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-[#C16643]">Stay Confirmed!</span>
                </div>
                <span className="text-[10px] font-mono text-white/70 font-bold uppercase">Booking Ref: NK-{Math.floor(1000 + Math.random() * 9000)}</span>
              </div>

              <div>
                <h4 className="text-[9px] uppercase font-sans font-bold text-white/50 tracking-wider">Your Cottage Stay:</h4>
                <p className="text-base font-serif font-bold mt-0.5">{selectedCottage.name}</p>
                <p className="text-[11px] text-white/80 leading-relaxed font-normal mt-1">
                  Dates: {booking.checkIn} to {booking.checkOut} ({nights} Nights) for {booking.guests} Patrons.
                </p>
              </div>

              {/* Day-by-Day chronological itinerary schedule */}
              <div className="border-t border-white/10 pt-3 flex flex-col gap-3">
                <h4 className="text-[10px] uppercase font-sans font-bold text-white/50 tracking-widest flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#C16643]" /> Your Curated Farm Itinerary:
                </h4>

                <div className="space-y-4 relative pl-3 border-l-2 border-white/10">
                  <div className="relative">
                    <span className="absolute left-[-17px] top-1 w-2.5 h-2.5 bg-[#C16643] border border-[#1B3022] rounded-full" />
                    <span className="text-[10px] uppercase font-sans font-bold text-[#C16643] flex items-center gap-1">
                      <Sunset className="w-3.5 h-3.5" /> Day 1 - Arrival & Earth Sync
                    </span>
                    <ul className="list-disc pl-4 mt-1 text-[11px] text-white/70 space-y-1 font-normal">
                      <li>12:00 PM: Traditional cardamom ginger syrup welcome</li>
                      <li>12:30 PM: Walk-through check-in at your insulated Clay Kudil</li>
                      <li>01:30 PM: Authentic firewood organic banana-leaf lunch</li>
                      <li>{booking.activities.includes("safari") ? "04:30 PM: Traditional Bullock Cart Safari across village border paths" : "05:00 PM: Sunset farm walk & coconut grove hammock relaxation"}</li>
                    </ul>
                  </div>

                  <div className="relative">
                    <span className="absolute left-[-17px] top-1 w-2.5 h-2.5 bg-[#C16643] border border-[#1B3022] rounded-full" />
                    <span className="text-[10px] uppercase font-sans font-bold text-[#C16643] flex items-center gap-1">
                      <Sun className="w-3.5 h-3.5" /> Day 2 - Deep Farm Experience
                    </span>
                    <ul className="list-disc pl-4 mt-1 text-[11px] text-white/70 space-y-1 font-normal">
                      <li>06:00 AM: Sunrise dynamic herbal tea infusion</li>
                      <li>{booking.activities.includes("harvest") ? "06:30 AM: Join the team for Early Morning Paddy Harvest workshop" : "07:30 AM: Bird watching & garden watering session"}</li>
                      <li>08:30 AM: Steamed ragi millets & country sugar traditional breakfast</li>
                      <li>{booking.activities.includes("pottery") ? "10:30 AM: Clay Pottery Wheel creation workshop with our village artisans" : "11:00 AM: Open farm wells tour and gravity water channel inspection"}</li>
                      <li>03:30 PM: Organic compost and Panchagavya preparation masterclass</li>
                      <li>{booking.activities.includes("gazing") ? "07:30 PM: Porch Star Gazing session under dark zero-pollution farm skies" : "07:00 PM: Community campfire & traditional village folklore storytelling"}</li>
                    </ul>
                  </div>

                  <div className="relative">
                    <span className="absolute left-[-17px] top-1 w-2.5 h-2.5 bg-[#C16643] border border-[#1B3022] rounded-full" />
                    <span className="text-[10px] uppercase font-sans font-bold text-[#C16643] flex items-center gap-1">
                      <Moon className="w-3.5 h-3.5" /> Day 3 - Harvesting Wisdom
                    </span>
                    <ul className="list-disc pl-4 mt-1 text-[11px] text-white/70 space-y-1 font-normal">
                      <li>07:30 AM: Cold-pressed sesame oil pulling & herbal rinse</li>
                      <li>{booking.activities.includes("cooking") ? "10:00 AM: Firewood Cooking masterclass - preparing heritage rice delicacies" : "09:30 AM: Agro-forestry and medicinal herbal nursery exploration"}</li>
                      <li>11:30 AM: Handing over your sowed crop souvenirs and blessing</li>
                      <li>12:00 PM: checkout with complete body & mind detoxification</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-3 text-center">
                <p className="text-[11px] text-[#F9F6F0]/90 leading-relaxed font-medium italic">
                  "Let your stay at Nam Kudil heal your soil and nourish your soul."
                </p>
                <span className="block text-[8px] uppercase tracking-widest text-white/50 font-mono mt-1">Nam Kudil Agrofarms India Pvt Ltd</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
