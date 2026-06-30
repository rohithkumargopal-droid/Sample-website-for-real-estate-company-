import React, { useState } from "react";
import { ChatMessage, SoilDiagnosis } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Send, Sprout, ShieldAlert, CheckCircle2, Loader2, Sparkles, AlertTriangle, RefreshCw, Compass } from "lucide-react";

export default function AgroAdvisor() {
  // Chat state
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      text: "Vanakkam! I am Kudil Ayya, your humble guide from the Nam Kudil Agrofarms family. Ask me anything about sustainable farming, organic pest control, traditional health benefits of cold-pressed oils, or permaculture. How may I bless your fields today?",
      timestamp: new Date(),
    },
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Diagnosis state
  const [cropName, setCropName] = useState("");
  const [soilType, setSoilType] = useState("clay-loam");
  const [symptoms, setSymptoms] = useState("");
  const [organicGoals, setOrganicGoals] = useState("100% natural, enrich microbial biology");
  const [diagnosisResult, setDiagnosisResult] = useState<SoilDiagnosis | null>(null);
  const [isDiagLoading, setIsDiagLoading] = useState(false);
  const [diagError, setDiagError] = useState("");

  // Handle Chat message submit
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: "u_" + Date.now(),
      role: "user",
      text: chatInput,
      timestamp: new Date(),
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      // Map history to server schema
      const historyPayload = chatHistory.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch("/api/agro-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMsg.text,
          chatHistory: historyPayload,
        }),
      });

      const data = await res.json();
      if (res.ok && data.text) {
        setChatHistory((prev) => [
          ...prev,
          {
            id: "m_" + Date.now(),
            role: "model",
            text: data.text,
            timestamp: new Date(),
          },
        ]);
      } else {
        throw new Error(data.error || "Failed to fetch AI recommendation");
      }
    } catch (err: any) {
      setChatHistory((prev) => [
        ...prev,
        {
          id: "err_" + Date.now(),
          role: "model",
          text: `Forgive me, my connection to the server is interrupted: ${err.message || "Please check your GEMINI_API_KEY."}. Let me try again later.`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Handle Crop Diagnosis submit
  const handleDiagnosisSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropName.trim() || isDiagLoading) return;

    setIsDiagLoading(true);
    setDiagError("");
    setDiagnosisResult(null);

    try {
      const res = await fetch("/api/crop-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cropName,
          soilType,
          symptoms,
          organicGoals,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setDiagnosisResult(data);
      } else {
        throw new Error(data.error || "Failed to complete crop diagnosis.");
      }
    } catch (err: any) {
      setDiagError(err.message || "Something went wrong in the crop analyzer laboratory.");
    } finally {
      setIsDiagLoading(false);
    }
  };

  return (
    <div id="agro_advisor_workspace" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* LEFT: Kudil Ayya AI Chatbot (7 cols) */}
      <div id="advisor_chat_panel" className="lg:col-span-7 bg-white rounded-lg border border-[#1B3022]/10 shadow-sm overflow-hidden flex flex-col h-[600px]">
        {/* Chat header */}
        <div className="bg-[#1B3022] text-[#F9F6F0] p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center font-bold text-lg relative">
              🌾
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#C16643] border border-[#1B3022] rounded-full" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-semibold tracking-tight">Kudil Ayya</h3>
              <p className="text-[9px] text-[#C16643] uppercase tracking-widest font-bold font-sans flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Chief Traditional Consultant
              </p>
            </div>
          </div>
          <button
            id="btn_reset_chat"
            onClick={() => {
              setChatHistory([
                {
                  id: "welcome",
                  role: "model",
                  text: "Vanakkam! Let us restart our conversation. Ask me about crop rotation, natural pest sprays, or soil micro-biology.",
                  timestamp: new Date(),
                },
              ]);
            }}
            className="text-xs bg-white/10 hover:bg-[#C16643] text-white px-3 py-1.5 rounded border border-white/10 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Chat
          </button>
        </div>

        {/* Chat scroll workspace */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F9F6F0]/30" id="chat_scroll_area">
          <AnimatePresence initial={false}>
            {chatHistory.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded p-4 shadow-sm text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#C16643] text-[#F9F6F0]"
                      : "bg-white border border-[#1B3022]/10 text-stone-800"
                  }`}
                >
                  <p className="font-sans font-bold text-[8px] uppercase tracking-widest mb-1 opacity-70">
                    {msg.role === "user" ? "You" : "Kudil Ayya"}
                  </p>
                  <div className="whitespace-pre-line prose max-w-none text-xs leading-relaxed">
                    {msg.text}
                  </div>
                  <span className="block text-[8px] mt-1 text-right opacity-60 font-mono">
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isChatLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-[#1B3022]/10 rounded p-4 flex items-center gap-2 text-stone-500 shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-[#C16643]" />
                <span className="text-xs font-sans">Ayya is reading the palm leaves...</span>
              </div>
            </div>
          )}
        </div>

        {/* Chat input form */}
        <form onSubmit={handleChatSubmit} className="p-4 bg-white border-t border-[#1B3022]/10 flex gap-2" id="chat_input_form">
          <input
            type="text"
            id="inp_chat_query"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask Kudil Ayya about organic farming or cold pressed oils..."
            className="flex-1 px-4 py-3 border border-[#1B3022]/15 rounded focus:outline-none focus:ring-1 focus:ring-[#C16643] focus:border-[#C16643] text-xs text-[#1B3022] placeholder-stone-400 bg-stone-50/50"
          />
          <button
            type="submit"
            id="btn_chat_send"
            disabled={!chatInput.trim() || isChatLoading}
            className="px-5 bg-[#1B3022] hover:bg-[#1B3022]/90 disabled:bg-stone-300 text-white rounded transition-all flex items-center justify-center gap-1 shadow-sm font-sans font-bold text-xs uppercase tracking-wider"
          >
            <Send className="w-4 h-4" /> Send
          </button>
        </form>
      </div>

      {/* RIGHT: Crop Health Diagnosis Lab (5 cols) */}
      <div id="crop_lab_panel" className="lg:col-span-5 flex flex-col gap-6">
        <div className="bg-white rounded-lg border border-[#1B3022]/10 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3 border-b border-[#1B3022]/5 pb-3">
            <div className="p-2 bg-[#1B3022]/5 text-[#C16643] rounded-full">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base text-[#1B3022] font-semibold">Crop Health Diagnosis</h3>
              <p className="text-[10px] text-stone-500 font-medium">Get a traditional organic prescription from our Agronomists</p>
            </div>
          </div>

          <form onSubmit={handleDiagnosisSubmit} className="space-y-4" id="crop_analysis_form">
            <div>
              <label className="block text-[9px] font-sans font-bold uppercase tracking-widest text-[#1B3022]/70 mb-1">Crop / Plant Name</label>
              <input
                type="text"
                id="diag_crop_name"
                required
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                placeholder="e.g. Traditional Red Paddy, Ladies Finger, Coconut"
                className="w-full px-3 py-2 border border-[#1B3022]/15 rounded text-xs text-[#1B3022] focus:outline-none focus:ring-1 focus:ring-[#C16643] focus:border-[#C16643]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-sans font-bold uppercase tracking-widest text-[#1B3022]/70 mb-1">Soil Composition</label>
                <select
                  id="diag_soil_type"
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="w-full px-3 py-2 border border-[#1B3022]/15 rounded text-xs text-[#1B3022] focus:outline-none focus:ring-1 focus:ring-[#C16643] focus:border-[#C16643]"
                >
                  <option value="clay-loam">Clay Loam (Traditional)</option>
                  <option value="red-soil">Red Soil (High Iron)</option>
                  <option value="black-cotton">Black Cotton Soil</option>
                  <option value="sandy-coastal">Sandy/Coastal Soil</option>
                  <option value="alluvial">Alluvial River Basin</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-sans font-bold uppercase tracking-widest text-[#1B3022]/70 mb-1">Organic Goal</label>
                <select
                  id="diag_organic_goal"
                  value={organicGoals}
                  onChange={(e) => setOrganicGoals(e.target.value)}
                  className="w-full px-3 py-2 border border-[#1B3022]/15 rounded text-xs text-[#1B3022] focus:outline-none focus:ring-1 focus:ring-[#C16643] focus:border-[#C16643]"
                >
                  <option value="100% pesticide-free">Pesticide Free</option>
                  <option value="boost-yield">Boost Yield (Natural)</option>
                  <option value="microbe-regeneration">Microbe Regeneration</option>
                  <option value="water-retention">Water Retention</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-sans font-bold uppercase tracking-widest text-[#1B3022]/70 mb-1">Visible Symptoms & Issues</label>
              <textarea
                id="diag_symptoms"
                required
                rows={3}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe leaf yellowing, black spots, slow growth, white flies, or soil cracking..."
                className="w-full px-3 py-2 border border-[#1B3022]/15 rounded text-xs text-[#1B3022] focus:outline-none focus:ring-1 focus:ring-[#C16643] focus:border-[#C16643]"
              />
            </div>

            <button
              type="submit"
              id="btn_run_diag"
              disabled={isDiagLoading || !cropName.trim()}
              className="w-full py-3 bg-[#C16643] hover:bg-[#b05836] disabled:bg-stone-300 text-white font-sans font-bold text-xs rounded uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              {isDiagLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Biological Metrics...
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4" /> Run Bio-Organic Diagnosis
                </>
              )}
            </button>
          </form>

          {diagError && (
            <div className="p-3 bg-red-50 text-red-800 border border-red-100 rounded text-xs flex gap-1.5 items-center">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-600 animate-pulse" />
              <span>{diagError}</span>
            </div>
          )}
        </div>

        {/* Diagnosis Results Display */}
        <AnimatePresence>
          {diagnosisResult && (
            <motion.div
              id="diagnosis_results_panel"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1B3022] text-[#F9F6F0] rounded-lg border border-white/15 shadow-xl p-6 flex flex-col gap-4"
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#C16643]">Lab Analysis Report</span>
                <span
                  className={`px-3 py-1 rounded text-[8px] font-sans font-bold uppercase tracking-widest ${
                    diagnosisResult.urgency === "High"
                      ? "bg-red-600 text-white animate-pulse"
                      : "bg-[#C16643] text-white"
                  }`}
                >
                  Urgency: {diagnosisResult.urgency}
                </span>
              </div>

              <div>
                <h4 className="text-[9px] font-sans font-bold uppercase tracking-widest text-[#C16643]">Identified Condition:</h4>
                <p className="text-base font-serif font-bold mt-0.5 text-white">{diagnosisResult.diagnosis}</p>
              </div>

              <div>
                <h4 className="text-[9px] font-sans font-bold uppercase tracking-widest text-[#C16643] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C16643]" /> Bio-Organic Prescription Steps:
                </h4>
                <ul className="list-disc pl-4 mt-1 space-y-1.5 text-xs text-[#F9F6F0]/90 leading-relaxed font-normal">
                  {diagnosisResult.remedySteps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-3">
                <div>
                  <h4 className="text-[9px] font-sans font-bold uppercase tracking-widest text-[#C16643]">Recovery Window:</h4>
                  <p className="text-xs font-semibold text-white mt-0.5">{diagnosisResult.estimatedRecovery}</p>
                </div>
                <div>
                  <h4 className="text-[9px] font-sans font-bold uppercase tracking-widest text-[#C16643]">Soil Amendment Advice:</h4>
                  <p className="text-xs font-normal text-[#F9F6F0]/90 mt-0.5 leading-relaxed">{diagnosisResult.soilAdvice}</p>
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded border border-white/10 mt-1">
                <h4 className="text-[9px] font-sans font-bold uppercase tracking-widest text-[#C16643] flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#C16643]" /> Agro-Botanical Science Context:
                </h4>
                <p className="text-[11px] text-white/90 leading-relaxed font-normal mt-1 italic">
                  "{diagnosisResult.scientificContext}"
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
