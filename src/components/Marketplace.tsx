import React, { useState } from "react";
import { Product, CartItem, CustomRecipe } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart, Trash2, Plus, Minus, Check, Leaf, Star, Sparkles, Loader2, ArrowRight, ClipboardCheck, Sparkle, Heart } from "lucide-react";

interface MarketplaceProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

// Hardcoded premium organic agro-products
const PREMIUM_PRODUCTS: Product[] = [
  {
    id: "oil_coco",
    name: "Woodpressed Coconut Oil (Mara Chekku)",
    category: "Oils",
    price: 360,
    unit: "1 Litre",
    rating: 4.9,
    reviews: 148,
    description: "Sun-dried organic sulfur-free copra, cold-pressed in traditional Vagai (east Indian walnut) wood presses. Rich in lauric acid and medium-chain triglycerides.",
    benefits: ["Supports heart and thyroid health", "Boosts metabolic activity", "Perfect for traditional oil pulling"],
    imageUrl: "https://picsum.photos/seed/organic_coconut/600/400",
    stock: true,
  },
  {
    id: "oil_sesame",
    name: "Woodpressed Sesame Oil with Palm Jaggery",
    category: "Oils",
    price: 420,
    unit: "1 Litre",
    rating: 4.8,
    reviews: 96,
    description: "Pristine black sesame seeds woodpressed with traditional palm jaggery ('Karupatti') which keeps the oil stable and infuses deep minerals.",
    benefits: ["High bone-building calcium content", "Helps regulate blood pressure", "Warm nature, superb for massage & cooking"],
    imageUrl: "https://picsum.photos/seed/sesame_oil/600/400",
    stock: true,
  },
  {
    id: "rice_mapillai",
    name: "Mapillai Samba Rice (Bridegroom Rice)",
    category: "Rice",
    price: 110,
    unit: "1 Kg",
    rating: 4.9,
    reviews: 112,
    description: "Traditional red rice of Tamil Nadu. Historically eaten by bridegrooms to show physical strength. Parboiled and packed with organic fiber.",
    benefits: ["Releases slow-burning complex carbs", "High zinc and iron content", "Improves muscular endurance"],
    imageUrl: "https://picsum.photos/seed/red_rice/600/400",
    stock: true,
  },
  {
    id: "rice_kavuni",
    name: "Karuppu Kavuni (Royal Black Rice)",
    category: "Rice",
    price: 160,
    unit: "1 Kg",
    rating: 5.0,
    reviews: 215,
    description: "The imperial black rice, packed with massive anthocyanin antioxidants. Traditional grain with deep nutty aroma and soft purple cooked texture.",
    benefits: ["Extreme antioxidant properties", "Very low glycemic index, good for sugars", "Helps detoxify liver and digestion"],
    imageUrl: "https://picsum.photos/seed/black_rice/600/400",
    stock: true,
  },
  {
    id: "millet_kambu",
    name: "Organic Pearl Millet (Kambu)",
    category: "Millets",
    price: 85,
    unit: "1 Kg",
    rating: 4.7,
    reviews: 84,
    description: "Naturally drought-resistant ancient grain grown on our rain-fed fields. De-husked, unpolished, and loaded with essential nutrients.",
    benefits: ["Excellent cooling effect for the body", "Rich in iron and magnesium", "Improves bone density"],
    imageUrl: "https://picsum.photos/seed/millet/600/400",
    stock: true,
  },
  {
    id: "honey_forest",
    name: "Wild Organic Mountain Honey",
    category: "Honey & Sweets",
    price: 480,
    unit: "500 Grams",
    rating: 4.9,
    reviews: 172,
    description: "Sourced sustainably from wild hives in deep deciduous forests. Raw, unfiltered, unheated, carrying multi-floral medical nectars.",
    benefits: ["Natural cough suppressant & antibiotic", "Contains live enzymes and prebiotics", "Instant pure energy booster"],
    imageUrl: "https://picsum.photos/seed/wild_honey/600/400",
    stock: true,
  },
];

export default function Marketplace({ cart, setCart }: MarketplaceProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Filtered list
  const filteredProducts = PREMIUM_PRODUCTS.filter((p) => {
    if (selectedCategory === "All") return true;
    return p.category === selectedCategory;
  });

  // Checkout modal and receipt state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [patronName, setPatronName] = useState("");
  const [patronPhone, setPatronPhone] = useState("");
  const [patronAddress, setPatronAddress] = useState("");
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [aiRecipeResult, setAiRecipeResult] = useState<CustomRecipe | null>(null);

  // Cart operations
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  // Checkout submit handler
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patronName.trim() || cart.length === 0 || isBookingLoading) return;

    setIsBookingLoading(true);
    setCheckoutError("");
    setAiRecipeResult(null);

    try {
      const res = await fetch("/api/order-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: patronName,
          items: cart.map((item) => ({
            name: item.name,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAiRecipeResult(data);
        // Clear cart after successful checkout simulation
        setCart([]);
      } else {
        throw new Error(data.error || "Failed to generate smart consultation receipt.");
      }
    } catch (err: any) {
      setCheckoutError(err.message || "Failed to establish checkout telemetry.");
    } finally {
      setIsBookingLoading(false);
    }
  };

  return (
    <div id="marketplace_workspace" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Product List Panel (8 cols) */}
      <div id="product_catalog_panel" className="lg:col-span-8 flex flex-col gap-6">
        {/* Categories Bar */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 border-b border-[#1B3022]/5" id="marketplace_categories">
          {["All", "Oils", "Rice", "Millets", "Honey & Sweets"].map((cat) => (
            <button
              key={cat}
              id={`btn_cat_${cat}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded text-xs font-sans font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
                selectedCategory === cat
                  ? "bg-[#1B3022] text-[#F9F6F0] border-[#1B3022] shadow-sm"
                  : "bg-white text-stone-600 border-[#1B3022]/10 hover:bg-[#1B3022]/5 hover:text-[#1B3022]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" id="products_grid">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              id={`prod_card_${p.id}`}
              className="bg-white rounded-lg border border-[#1B3022]/10 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-all group"
            >
              {/* Product Image */}
              <div className="relative h-48 overflow-hidden bg-[#F9F6F0]">
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-[#F9F6F0] px-2.5 py-1 rounded text-[8px] font-sans font-bold text-[#1B3022] uppercase tracking-[0.2em] border border-[#1B3022]/10 flex items-center gap-1 shadow-sm">
                  <Leaf className="w-3 h-3" /> {p.category}
                </span>
                <span className="absolute bottom-3 right-3 bg-[#1B3022] text-[#F9F6F0] px-3 py-1 rounded text-xs font-serif font-bold shadow-sm">
                  ₹{p.price} <span className="text-[10px] font-sans opacity-75 font-normal">/ {p.unit}</span>
                </span>
              </div>

              {/* Card Details */}
              <div className="p-5 flex flex-col gap-3 flex-1 justify-between">
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-1">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="text-xs font-sans font-bold text-stone-700">{p.rating}</span>
                    <span className="text-[10px] text-stone-400">({p.reviews} reviews)</span>
                  </div>
                  <h4 className="font-serif text-base text-[#1B3022] font-semibold tracking-tight leading-snug group-hover:text-[#C16643] transition-colors">
                    {p.name}
                  </h4>
                  <p className="text-[11.5px] text-stone-600 leading-relaxed mt-1.5 font-normal">
                    {p.description}
                  </p>

                  {/* Health Benefits checklist */}
                  <div className="mt-3 flex flex-col gap-1">
                    {p.benefits.map((b, idx) => (
                      <span key={idx} className="text-[10px] text-[#1B3022] font-medium flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-[#C16643] flex-shrink-0" /> {b}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  id={`btn_add_to_cart_${p.id}`}
                  onClick={() => addToCart(p)}
                  className="w-full py-2.5 mt-2 bg-[#C16643] hover:bg-[#b05836] text-white font-sans font-bold text-xs rounded uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <ShoppingCart className="w-4 h-4" /> Add to Organic Basket
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shopping Basket Sidebar (4 cols) */}
      <div id="shopping_basket_panel" className="lg:col-span-4 bg-white rounded-lg border border-[#1B3022]/10 shadow-sm overflow-hidden flex flex-col h-[580px]">
        <div className="bg-[#1B3022] text-[#F9F6F0] p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#C16643]" />
            <h3 className="font-serif text-sm font-semibold tracking-tight">Your Organic Basket</h3>
          </div>
          <span className="text-[9px] font-sans font-bold uppercase tracking-widest bg-[#C16643] px-2 py-0.5 rounded text-white">
            {cart.reduce((s, c) => s + c.quantity, 0)} items
          </span>
        </div>

        {/* Basket List scroll */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F9F6F0]/30" id="basket_items_list">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 p-8 text-center">
              <Leaf className="w-12 h-12 stroke-[1.2] text-[#C16643]/60 animate-bounce mb-2" />
              <p className="text-xs font-sans font-bold text-[#1B3022] uppercase tracking-wider">Your farm basket is empty</p>
              <p className="text-[10px] text-stone-500 leading-relaxed mt-1">Browse our woodpressed oils, heirloom rices, and organic forest goodies!</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {cart.map((item) => (
                <motion.div
                  key={item.id}
                  id={`cart_item_${item.id}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="bg-white border border-[#1B3022]/10 p-3.5 rounded flex items-center justify-between gap-3 shadow-sm"
                >
                  <div className="flex-1 min-w-0">
                    <h5 className="font-serif text-sm text-[#1B3022] font-semibold truncate leading-tight">{item.name}</h5>
                    <p className="text-[10px] text-stone-500 font-medium font-sans">₹{item.price} / {item.unit}</p>
                    <p className="text-xs text-[#C16643] font-bold mt-0.5">₹{item.price * item.quantity}</p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      id={`btn_qty_minus_${item.id}`}
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1 border border-[#1B3022]/10 rounded hover:bg-[#1B3022]/5 text-[#1B3022] transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-[#1B3022] w-4 text-center">{item.quantity}</span>
                    <button
                      id={`btn_qty_plus_${item.id}`}
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1 border border-[#1B3022]/10 rounded hover:bg-[#1B3022]/5 text-[#1B3022] transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      id={`btn_cart_remove_${item.id}`}
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 text-stone-400 hover:text-red-600 transition-colors ml-1"
                      title="Remove product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Basket Summary footer */}
        {cart.length > 0 && (
          <div className="p-4 bg-white border-t border-[#1B3022]/10 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-bold text-stone-700">
              <span>Subtotal:</span>
              <span className="text-base font-serif font-bold text-[#1B3022]">₹{cartTotal}</span>
            </div>
            <p className="text-[9px] text-stone-500 leading-relaxed font-normal">
              Proceed to checkout to unlock a customized traditional organic wellness prescription and nutritional recipe generated uniquely for your selected ingredients!
            </p>
            <button
              id="btn_open_checkout"
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full py-3 bg-[#C16643] hover:bg-[#b05836] text-white font-sans font-bold text-xs rounded uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-1"
            >
              Place Custom Farm Order <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Checkout Consultation Modal Overlay */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 bg-stone-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" id="checkout_modal_overlay">
            <motion.div
              id="checkout_modal_box"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#F9F6F0] max-w-2xl w-full rounded-lg overflow-hidden shadow-2xl border border-[#1B3022]/15 flex flex-col md:flex-row h-[550px] md:h-[600px]"
            >
              {/* Left Side: Order Form */}
              <div className="w-full md:w-1/2 bg-white p-5 md:p-6 flex flex-col justify-between overflow-y-auto border-r border-[#1B3022]/10">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-base text-[#1B3022] font-semibold flex items-center gap-1.5">
                      <ClipboardCheck className="w-5 h-5 text-[#C16643]" /> Farm Checkout
                    </h3>
                    <button
                      id="btn_close_checkout"
                      onClick={() => {
                        setIsCheckoutOpen(false);
                        setAiRecipeResult(null);
                        setCheckoutError("");
                      }}
                      className="text-[#1B3022]/40 hover:text-[#C16643] text-lg font-bold"
                    >
                      &times;
                    </button>
                  </div>

                  <form onSubmit={handleCheckoutSubmit} className="space-y-3" id="checkout_details_form">
                    <div>
                      <label className="block text-[9px] font-sans font-bold uppercase tracking-widest text-[#1B3022]/70 mb-1">Patron Full Name</label>
                      <input
                        type="text"
                        id="chk_patron_name"
                        required
                        value={patronName}
                        onChange={(e) => setPatronName(e.target.value)}
                        placeholder="e.g. Rohith Kumar"
                        className="w-full px-3 py-2 border border-[#1B3022]/15 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#C16643] focus:border-[#C16643]"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-sans font-bold uppercase tracking-widest text-[#1B3022]/70 mb-1">Contact Phone Number</label>
                      <input
                        type="text"
                        id="chk_patron_phone"
                        required
                        value={patronPhone}
                        onChange={(e) => setPatronPhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full px-3 py-2 border border-[#1B3022]/15 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#C16643] focus:border-[#C16643]"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-sans font-bold uppercase tracking-widest text-[#1B3022]/70 mb-1">Pristine Delivery Address</label>
                      <textarea
                        id="chk_patron_addr"
                        required
                        rows={3}
                        value={patronAddress}
                        onChange={(e) => setPatronAddress(e.target.value)}
                        placeholder="Enter full shipping address with pin code..."
                        className="w-full px-3 py-2 border border-[#1B3022]/15 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#C16643] focus:border-[#C16643]"
                      />
                    </div>

                    <div className="bg-[#F9F6F0] p-4 rounded border border-[#1B3022]/10">
                      <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-[#C16643] block mb-1">Grand Farm Total:</span>
                      <span className="text-lg font-serif font-bold text-[#1B3022]">₹{cartTotal}</span>
                    </div>

                    <button
                      type="submit"
                      id="btn_checkout_confirm"
                      disabled={isBookingLoading}
                      className="w-full py-3 bg-[#1B3022] hover:bg-[#1B3022]/90 disabled:bg-[#1B3022]/20 text-[#F9F6F0] font-sans font-bold text-xs rounded uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-1"
                    >
                      {isBookingLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Gathering Botanical Wisdom...
                        </>
                      ) : (
                        <>
                          Confirm Order & Generate Recipe
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {checkoutError && (
                  <p className="text-[10px] text-red-600 bg-red-50 border border-red-100 p-2 rounded mt-2">
                    {checkoutError}
                  </p>
                )}
              </div>

              {/* Right Side: AI Consult / Recipe Receipt (Paper-Styled) */}
              <div className="w-full md:w-1/2 bg-[#F9F6F0] p-5 md:p-6 overflow-y-auto flex flex-col justify-between relative" id="checkout_recipe_panel">
                {/* Visual paper perforations */}
                <div className="absolute top-0 left-0 right-0 h-1.5 flex justify-between overflow-hidden" style={{ backgroundImage: "radial-gradient(circle, #1B3022 6px, transparent 6px)", backgroundSize: "16px 12px" }} />

                {aiRecipeResult ? (
                  <motion.div
                    id="ai_checkout_receipt"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col gap-4 mt-2"
                  >
                    <div className="text-center border-b border-[#1B3022]/15 pb-3 flex flex-col gap-0.5">
                      <span className="text-[9px] font-mono tracking-wider text-stone-500 uppercase">NAM KUDIL DIGITAL APOTHECARY</span>
                      <h4 className="font-serif text-sm text-[#1B3022] font-semibold">Organic Wellness Prescription</h4>
                      <p className="text-[10px] text-stone-600 italic mt-0.5">"{aiRecipeResult.patronGreeting}"</p>
                    </div>

                    {/* Product traditional benefits */}
                    <div>
                      <h5 className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#1B3022] flex items-center gap-1.5 mb-2">
                        <Heart className="w-3.5 h-3.5 text-[#C16643] animate-pulse fill-current" /> Botanical Benefits of Your Basket:
                      </h5>
                      <div className="space-y-1.5">
                        {aiRecipeResult.benefitsList.map((ben, idx) => (
                          <div key={idx} className="bg-white p-3 rounded border border-[#1B3022]/5 shadow-sm">
                            <p className="text-[10px] font-serif font-bold text-[#1B3022] leading-none">{ben.itemName}</p>
                            <p className="text-[9px] text-stone-600 mt-1">{ben.benefit}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Step-by-Step Custom Recipe */}
                    <div className="bg-[#1B3022] text-[#F9F6F0] p-4 rounded border border-white/5 shadow-sm flex flex-col gap-2.5">
                      <div className="flex items-center gap-1.5">
                        <Sparkle className="w-4 h-4 text-[#C16643] animate-spin-slow" />
                        <h6 className="text-[11px] font-serif font-semibold text-white">{aiRecipeResult.recipeTitle}</h6>
                      </div>

                      <div>
                        <span className="text-[8px] uppercase tracking-wider font-extrabold text-[#C16643] block">Ingredients:</span>
                        <p className="text-[10px] text-stone-200 mt-0.5 leading-relaxed">
                          {aiRecipeResult.recipeIngredients.join(", ")}
                        </p>
                      </div>

                      <div className="border-t border-white/10 pt-2">
                        <span className="text-[8px] uppercase tracking-wider font-extrabold text-[#C16643] block mb-1">Traditional Preparation:</span>
                        <ol className="list-decimal pl-4 space-y-1 text-[10px] text-stone-200 leading-relaxed">
                          {aiRecipeResult.recipeInstructions.map((ins, idx) => (
                            <li key={idx}>{ins}</li>
                          ))}
                        </ol>
                      </div>
                    </div>

                    {/* Wellness tip */}
                    <div className="border-t border-dashed border-[#1B3022]/20 pt-3">
                      <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-[#C16643]">Daily Wellness Axiom:</span>
                      <p className="text-[10px] text-stone-700 leading-relaxed italic mt-1 font-medium bg-white p-3 rounded border border-[#1B3022]/10 shadow-sm">
                        "{aiRecipeResult.dailyWellnessTip}"
                      </p>
                    </div>

                    <div className="text-center border-t border-[#1B3022]/15 pt-3 flex flex-col items-center">
                      <span className="text-[9px] font-sans font-bold text-[#1B3022]">🌿 Thank you for choosing natural farming 🌿</span>
                      <span className="text-[7px] text-stone-400 mt-0.5 uppercase tracking-widest font-mono">Digital Signature - Nam Kudil Agrofarms</span>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-stone-400 p-8 text-center" id="checkout_idle_consult">
                    <Sparkles className="w-12 h-12 stroke-[1.2] text-[#C16643] animate-pulse mb-2" />
                    <p className="text-xs font-sans font-bold text-[#1B3022] uppercase tracking-wider">Awaiting Order Confirmation</p>
                    <p className="text-[10px] text-stone-600 leading-relaxed mt-1 font-normal">
                      Complete the farm checkout on the left. Our AI agricultural pharmacist will instantly formulate a traditional dietary recipe and organic wellness consult based on your items!
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
