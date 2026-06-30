import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client on the server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// AI Crop Advisor API
app.post("/api/agro-advisor", async (req, res) => {
  try {
    const { prompt, chatHistory } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY environment variable is not configured. Please set it in Settings > Secrets.",
      });
    }

    const systemInstruction = `You are "Kudil Ayya", the expert chief agro-consultant, traditional farming veteran, and organic agricultural scientist at Nam Kudil Agrofarms India Pvt Ltd.
Your mission is to guide farmers, home gardeners, and consumers on natural farming, organic remedies, soil health, crop protection, traditional health benefits of cold-pressed oils, traditional heritage rices (like Mapillai Samba, Karuppu Kavuni), millets, and sustainable living.

Core guidelines:
1. Speak with wisdom, passion for nature, and extensive practical knowledge of Indian organic farming methods (such as Panchagavya, Jeevamrutham, Neem Astras, crop rotation, and multi-cropping).
2. Keep your answers practical, step-by-step, and easy to understand for both seasoned farmers and urban home-gardeners.
3. Suggest local organic ingredients (like neem oil, ginger-garlic extracts, cow dung/urine, compost) for pest control and soil enrichment.
4. Promote natural farming philosophy and explain how Nam Kudil Agrofarms supports this mission.
5. Be warm, polite, and encouraging. Use short, formatted sections with markdown headers or bullets.`;

    // Construct the contents with chat history if provided
    const contents: any[] = [];
    if (chatHistory && Array.isArray(chatHistory)) {
      chatHistory.forEach((msg: any) => {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        });
      });
    }
    contents.push({ role: "user", parts: [{ text: prompt }] });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error in agro-advisor:", error);
    res.status(500).json({ error: error.message || "Failed to generate guidance." });
  }
});

// Crop Health Analyzer / Soil Diagnosis API
app.post("/api/crop-analyzer", async (req, res) => {
  try {
    const { cropName, soilType, symptoms, organicGoals } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured in Settings > Secrets.",
      });
    }

    const prompt = `Perform a full agricultural diagnosis and organic treatment plan for:
Crop/Plant: ${cropName || "General Crop"}
Soil Type: ${soilType || "Unknown Clay/Sandy Soil"}
Symptoms / Issues: ${symptoms || "Poor growth, yellowish leaves, or general pest issues"}
Organic Farming Goals: ${organicGoals || "100% pesticide-free, maximize natural nutrients"}`;

    const systemInstruction = `You are a professional Agronomist specializing in Indian Traditional Organic Agriculture and Permaculture at Nam Kudil Agrofarms.
Analyze the user's input and provide a highly detailed organic healing plan.

Format your response in a clean, JSON structure containing:
1. "diagnosis": A quick description of the likely cause (nutrient deficiency, pest attack, fungal disease, or overwatering).
2. "urgency": "Low", "Medium", or "High".
3. "remedySteps": An array of actionable steps to cure the crop using traditional organic preparations (e.g. neem cake, sour buttermilk spray, wood ash, Panchagavya).
4. "soilAdvice": Customized organic soil amendments to prevent future occurrences (e.g. green manure, vermicompost, mulching).
5. "estimatedRecovery": Estimated timeframe for recovery (e.g., "7-14 days").
6. "scientificContext": A brief explanation of the biology behind this issue and its natural solution.

Ensure the output is STRICTLY valid JSON as defined by the response schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diagnosis: { type: Type.STRING },
            urgency: { type: Type.STRING },
            remedySteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            soilAdvice: { type: Type.STRING },
            estimatedRecovery: { type: Type.STRING },
            scientificContext: { type: Type.STRING },
          },
          required: ["diagnosis", "urgency", "remedySteps", "soilAdvice", "estimatedRecovery", "scientificContext"],
        },
      },
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText.trim()));
  } catch (error: any) {
    console.error("Error in crop-analyzer:", error);
    res.status(500).json({ error: error.message || "Failed to analyze crop health." });
  }
});

// Smart Checkout - Custom Recipe / Nutrition Guide API
app.post("/api/order-checkout", async (req, res) => {
  try {
    const { items, userName } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured.",
      });
    }

    const itemNames = items.map((item: any) => `${item.name} (Qty: ${item.quantity})`).join(", ");
    const prompt = `Create a custom traditional health consultation and traditional recipe suggestion for ${userName || "Valued Patron"}.
The customer bought these organic products from Nam Kudil Agrofarms:
${itemNames}

Deliver a highly customized wellness guide that explains:
1. The traditional health/nutritional benefits of each purchased item (e.g., cold-pressed oils for bone/heart health, traditional rices for low-glycemic energy).
2. A step-by-step traditional South Indian recipe combining one or more of these items (e.g., Karuppu Kavuni Sweet Pongal, millet idlis, or a healthy herbal decoction).
3. Daily consumption tips for ultimate organic wellness.
4. A warm personal thank-you message from the Nam Kudil Agrofarms Family.

Respond with valid JSON conforming to the schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            patronGreeting: { type: Type.STRING },
            benefitsList: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  itemName: { type: Type.STRING },
                  benefit: { type: Type.STRING },
                },
                required: ["itemName", "benefit"],
              },
            },
            recipeTitle: { type: Type.STRING },
            recipeIngredients: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            recipeInstructions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            dailyWellnessTip: { type: Type.STRING },
          },
          required: ["patronGreeting", "benefitsList", "recipeTitle", "recipeIngredients", "recipeInstructions", "dailyWellnessTip"],
        },
      },
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText.trim()));
  } catch (error: any) {
    console.error("Error in order-checkout:", error);
    res.status(500).json({ error: error.message || "Failed to generate smart checkout guide." });
  }
});

// Serve frontend
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
