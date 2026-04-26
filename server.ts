import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";

// Load local developer secrets first, then fall back to .env if present.
dotenv.config({ path: [".env.local", ".env"] });

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Validation check for environment variables
const REQUIRED_ENV_VARS = ["GROQ_API_KEY", "SERPER_API_KEY", "ELEVENLABS_API_KEY"];
const missingVars = REQUIRED_ENV_VARS.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.warn(`WARNING: Missing environment variables: ${missingVars.join(", ")}`);
  console.warn("Please ensure these are set in the Secrets panel in AI Studio.");
} else {
  console.log("SUCCESS: All required environment variables are configured.");
}

async function startServer() {
  // API Routes
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, systemPrompt } = req.body;

      const defaultPrompt = "You are Nexus AI, a sophisticated AI assistant developed by Safiullah. Keep responses short, smart, and natural. Use a professional yet slightly futuristic tone. If asked who created you, always mention Safiullah.";
      const promptText = systemPrompt || defaultPrompt;

      // Try Groq First
      if (process.env.GROQ_API_KEY) {
        try {
          const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
              model: "llama-3.3-70b-versatile",
              messages: [
                { role: "system", content: promptText },
                ...messages
              ],
              max_tokens: 500,
            },
            {
              headers: {
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json",
              },
              timeout: 10000,
            }
          );
          return res.json(response.data);
        } catch (groqError: any) {
          console.warn("Groq failed, falling back to Gemini:", groqError.message);
          // Continue to Gemini fallback
        }
      }

      // Gemini Fallback (Internal or External)
      if (process.env.GEMINI_API_KEY) {
        try {
          const geminiResponse = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
              contents: messages.map((m: any) => ({
                role: m.role === "assistant" ? "model" : "user",
                parts: [{ text: m.content }]
              })),
              systemInstruction: {
                parts: [{ text: promptText }]
              },
              generationConfig: {
                maxOutputTokens: 500,
                temperature: 0.7,
              }
            }
          );

          const content = geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || "I am processing your request through secondary channels.";

          return res.json({
            choices: [{
              message: { role: "assistant", content }
            }]
          });
        } catch (geminiError: any) {
          console.error("Gemini fallback also failed:", geminiError.message);
        }
      }

      res.status(500).json({ error: "All AI subsystems are currently offline." });
    } catch (error: any) {
      const errorData = error.response?.data || error.message;
      console.error("Critical Chat Error:", JSON.stringify(errorData, null, 2));
      res.status(500).json({ error: "Internal System Failure", details: errorData });
    }
  });

  app.post("/api/search", async (req, res) => {
    try {
      const { query } = req.body;

      if (!process.env.SERPER_API_KEY) {
        return res.status(500).json({ error: "SERPER_API_KEY is not configured" });
      }

      const response = await axios.post(
        "https://google.serper.dev/search",
        { q: query },
        {
          headers: {
            "X-API-KEY": process.env.SERPER_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );
      res.json(response.data);
    } catch (error: any) {
      const errorData = error.response?.data || error.message;
      console.error("Serper Error:", JSON.stringify(errorData, null, 2));
      res.status(500).json({ error: "Failed to search using Serper", details: errorData });
    }
  });

  app.post("/api/youtube", async (req, res) => {
    try {
      const { query } = req.body;
      if (!process.env.SERPER_API_KEY) {
        return res.status(500).json({ error: "SERPER_API_KEY is not configured" });
      }
      const response = await axios.post(
        "https://google.serper.dev/videos",
        { q: query, gl: "us", hl: "en" },
        {
          headers: {
            "X-API-KEY": process.env.SERPER_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );
      res.json(response.data);
    } catch (error: any) {
      const errorData = error.response?.data || error.message;
      console.error("YouTube Search Error:", JSON.stringify(errorData, null, 2));
      res.status(500).json({ error: "Failed to search YouTube via Serper", details: errorData });
    }
  });

  app.get("/api/voices", async (req, res) => {
    try {
      if (!process.env.ELEVENLABS_API_KEY) {
        return res.status(500).json({ error: "ELEVENLABS_API_KEY is not configured" });
      }
      const response = await axios.get("https://api.elevenlabs.io/v1/voices", {
        headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY }
      });
      res.json(response.data);
    } catch (error: any) {
      console.error("Voices list error:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to fetch voices", details: error.response?.data || error.message });
    }
  });

  app.post("/api/voice", async (req, res) => {
    try {
      let { text, voiceId = "21m00Tcm4TlvDq8ikWAM" } = req.body;

      if (!process.env.ELEVENLABS_API_KEY) {
        return res.status(500).json({ error: "ELEVENLABS_API_KEY is not configured" });
      }

      const generateTTS = async (vId: string) => {
        console.log(`TTS: Attempting voice ${vId}`);
        return axios.post(
          `https://api.elevenlabs.io/v1/text-to-speech/${vId}`,
          {
            text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          },
          {
            headers: {
              "xi-api-key": process.env.ELEVENLABS_API_KEY,
              "Content-Type": "application/json",
              "accept": "audio/mpeg"
            },
            responseType: "arraybuffer",
          }
        );
      };

      let response;
      try {
        response = await generateTTS(voiceId);
      } catch (innerError: any) {
        if (innerError.response?.status === 404 && voiceId !== "21m00Tcm4TlvDq8ikWAM") {
          console.warn(`Voice ${voiceId} not found. Falling back to default.`);
          response = await generateTTS("21m00Tcm4TlvDq8ikWAM");
        } else {
          throw innerError;
        }
      }

      res.set("Content-Type", "audio/mpeg");
      res.send(response.data);
    } catch (error: any) {
      const errorStatus = error.response?.status;
      const errorData = error.response?.data;

      let errorMessage = error.message;
      if (errorData instanceof ArrayBuffer || Buffer.isBuffer(errorData)) {
        try {
          const decoded = new TextDecoder().decode(errorData);
          errorMessage = decoded;
        } catch (e) {
          errorMessage = "Could not decode error response";
        }
      } else if (errorData) {
        errorMessage = typeof errorData === 'object' ? JSON.stringify(errorData) : String(errorData);
      }

      if (errorStatus === 402) {
        errorMessage = "ElevenLabs Quota Exceeded. Please check API credits in ElevenLabs dashboard.";
        // On 402, we still return 402 but with a cleaner message that the frontend can handle
        return res.status(402).json({
          error: errorMessage,
          status: 402,
          fallback: true
        });
      }

      console.error(`ElevenLabs Error (${errorStatus}):`, errorMessage);
      res.status(errorStatus || 500).json({
        error: errorMessage,
        status: errorStatus
      });
    }
  });

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
    console.log(`JARVIS Server running on http://localhost:${PORT}`);
  });
}

startServer();
