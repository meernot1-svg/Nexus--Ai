import { useState, useEffect, useRef, useCallback } from "react";
import { Message, JarvisStatus, Personality, PERSONALITIES } from "../types";
import { chatWithJarvis, searchWithSerper, convertTextToSpeech } from "../services/api";
import { searchYouTube } from "../services/youtubeService";
import { openWhatsApp } from "../services/whatsappService";
import { openEmailClient } from "../services/emailService";

export function useJarvis() {
  const [status, setStatus] = useState<JarvisStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [history, setHistory] = useState<Message[]>([]);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [personality, setPersonality] = useState<Personality>(PERSONALITIES[0]);
  const [mood, setMood] = useState<"neutral" | "positive" | "analytical" | "energetic">("neutral");
  const [memories, setMemories] = useState<string[]>([]);
  const [isLocalVoice, setIsLocalVoice] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const statusRef = useRef<JarvisStatus>(status);

  // Update mood and memories based on chat
  useEffect(() => {
    if (history.length === 0) return;
    const lastMsg = history[history.length - 1].content.toLowerCase();
    
    // Simple Mood Logic
    if (lastMsg.includes("wow") || lastMsg.includes("great") || lastMsg.includes("cool") || lastMsg.includes("thank")) {
      setMood("positive");
    } else if (lastMsg.includes("how") || lastMsg.includes("why") || lastMsg.includes("explain") || lastMsg.includes("data")) {
      setMood("analytical");
    } else if (lastMsg.includes("go") || lastMsg.includes("do") || lastMsg.includes("now") || lastMsg.includes("fast")) {
      setMood("energetic");
    } else {
      setMood("neutral");
    }

    // Extraction Logic (Memories)
    const words = lastMsg.match(/\b[A-Z][a-z]+\b/g); // Simple proper noun check
    if (words) {
      setMemories(prev => Array.from(new Set([...prev, ...words])).slice(-8));
    }
  }, [history]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setStatus("idle");
    }
  }, []);

  // Sync ref with state
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Stop audio if muted while playing
  useEffect(() => {
    if (isAudioMuted && status === "speaking") {
      stopAudio();
    }
  }, [isAudioMuted, status, stopAudio]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    stopAudio();
  }, [stopAudio]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      if (recognitionRef.current) return; // Prevent double init

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const text = event.results[i][0].transcript;
            setTranscript(text);
            handleQuery(text);
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript(interimTranscript);
        
        // Wake word detection: "Jarvis"
        if (statusRef.current === "idle" && interimTranscript.toLowerCase().includes("jarvis")) {
          setTranscript("Listening...");
          setStatus("listening");
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        // "aborted" and "no-speech" are common and often non-fatal in continuous mode
        if (event.error === "aborted" || event.error === "no-speech") return;
        
        console.error("Speech Recognition Error:", event.error);
        if (event.error === "not-allowed") {
          setStatus("error");
          setHistory(prev => [...prev, { 
            role: "assistant", 
            content: "Microphone access denied. Please click the microphone icon and allow access in your browser to use voice features." 
          }]);
        }
      };

      recognitionRef.current.onend = () => {
        // Restart if we are in listening mode OR idle (for wake word)
        // BUT only if we haven't hit a fatal error like 'not-allowed'
        if (statusRef.current !== "error" && (statusRef.current === "idle" || statusRef.current === "listening")) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            // Already started or blocked
          }
        }
      };
      
      // Removed auto-start on mount to prevent 'not-allowed' security block
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    };
  }, []); // Only init once

  const handleQuery = async (query: string) => {
    if (!query.trim()) return;
    
    // Switch to thinking state
    setStatus("thinking");
    
    const newUserMessage: Message = { role: "user", content: query };
    setHistory(prev => [...prev.slice(-10), newUserMessage]);

    try {
      console.log("JARVIS: Processing query ->", query);
      let responseText = "";
      let actionCard: Message['action'] = undefined;
      
      const queryLower = query.toLowerCase();
      
      // INTENT: YouTube
      if (queryLower.includes("youtube") || queryLower.includes("video") || queryLower.includes("play")) {
        console.log("JARVIS: YouTube node triggered...");
        const videos = await searchYouTube(query);
        if (videos.length > 0) {
          const video = videos[0];
          actionCard = { type: 'youtube', data: video };
          responseText = `I've found a relevant transmission: "${video.title}" by ${video.channel}. Video link has been established.`;
        } else {
          responseText = "I attempted to locate a visual transmission on YouTube, but the signal was weak. I couldn't find a direct link.";
        }
      } 
      // INTENT: WhatsApp
      else if (queryLower.includes("whatsapp") || queryLower.includes("message")) {
        console.log("JARVIS: WhatsApp node triggered...");
        const messageMatch = query.match(/(?:message|whatsapp|tell|say) (?:to )?(.+)/i);
        const feedback = messageMatch ? `Preparing WhatsApp uplink for: "${messageMatch[1]}"` : "WhatsApp interface primed. What is your message?";
        actionCard = { 
          type: 'whatsapp', 
          data: { 
            title: messageMatch ? `Message to: ${messageMatch[1]}` : 'WhatsApp Link',
            content: messageMatch ? messageMatch[1] : ""
          } 
        };
        responseText = feedback;
      }
      // INTENT: Email
      else if (queryLower.includes("email") || queryLower.includes("mail")) {
        console.log("JARVIS: Email node triggered...");
        actionCard = { type: 'email', data: { to: "", subject: "Nexus AI Correspondence", body: "" } };
        responseText = "Digital correspondence interface (Email) is ready. I can prepare a direct link for you to send your message.";
      }
      // INTENT: Search
      else if (["latest", "news", "price", "today", "who is", "what is", "current", "search"].some(t => queryLower.includes(t))) {
        console.log("JARVIS: Search node triggered...");
        const searchData = await searchWithSerper(query);
        const snippet = searchData.organic?.[0]?.snippet || "I couldn't find specific details, but I'm searching.";
        
        const aiResponse = await chatWithJarvis([
          ...history,
          newUserMessage,
          { role: "assistant", content: `CONTEXT FROM SEARCH: ${snippet}. Instructions: Summarize this context naturally as ${personality.name}.` }
        ], personality.systemPrompt);
        responseText = aiResponse.choices[0].message.content;
        actionCard = { type: 'search', data: searchData.organic?.[0] };
      } 
      // DEFAULT: Chat
      else {
        const aiResponse = await chatWithJarvis([...history, newUserMessage], personality.systemPrompt);
        responseText = aiResponse.choices[0].message.content;
      }

      console.log("JARVIS: Response generation complete.");
      setHistory(prev => [...prev, { role: "assistant", content: responseText, action: actionCard }]);
      
      if (!isAudioMuted) {
        console.log("JARVIS: Triggering vocal synthesis...");
        await speak(responseText);
      } else {
        console.log("JARVIS: Finalizing (muted).");
        setStatus("idle");
      }
    } catch (error: any) {
      console.error("JARVIS logic error:", error.response?.data || error);
      const errorMessage = error.response?.data?.error || "System failure. Check API key status.";
      setStatus("error");
      setHistory(prev => [...prev, { 
        role: "assistant", 
        content: `ALERT: ${errorMessage}. System keys required.` 
      }]);
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const retryElevenLabs = useCallback(() => {
    setIsLocalVoice(false);
  }, []);

  const speak = async (text: string) => {
    try {
      if (isLocalVoice) {
        throw new Error("Local mode active due to previous quota limit");
      }

      console.log("JARVIS: Accessing ElevenLabs API...");
      setStatus("speaking");
      const audioBlob = await convertTextToSpeech(text, personality.voiceId);
      
      console.log("JARVIS: Vocal buffer received.", audioBlob.type, audioBlob.size);

      if (audioBlob.type === "application/json" || audioBlob.size < 100) {
        const errText = await audioBlob.text();
        let errorMessage = "Unknown error";
        try {
          const errorData = JSON.parse(errText);
          if (errorData.status === 402 || (errorData.error && errorData.error.includes("Quota"))) {
            setIsLocalVoice(true);
          }
          errorMessage = errorData.error || errorData.details || "Synthesis failed";
        } catch (e) {
          errorMessage = errText || "Synthesis failed";
        }
        throw new Error(errorMessage);
      }

      const url = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      audioRef.current = new Audio(url);
      audioRef.current.onended = () => {
        console.log("JARVIS: Vocalization sequence complete.");
        setStatus("idle");
        URL.revokeObjectURL(url);
      };
      
      console.log("JARVIS: Playing vocal output...");
      await audioRef.current.play();
    } catch (error: any) {
      let isQuotaError = false;
      let errorMsg = error.message || "Unknown error";

      // If it's an axios error with a blob response
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const parsed = JSON.parse(text);
          errorMsg = parsed.error || parsed.details || text;
          if (error.response.status === 402 || errorMsg.includes("Quota")) {
            isQuotaError = true;
          }
        } catch (e) {
          // fallback to original error message
        }
      } else if (error.response?.status === 402 || errorMsg.includes("Quota") || errorMsg.includes("402")) {
        isQuotaError = true;
      }

      console.warn("JARVIS: ElevenLabs interface unavailable, shifting to device local voice:", errorMsg);
      
      if (isQuotaError) {
        setIsLocalVoice(true);
      }

      // FALLBACK: Web Speech API
      if ('speechSynthesis' in window) {
        // Cancel any ongoing speaking
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        const getBestVoice = () => {
          const voices = window.speechSynthesis.getVoices();
          let selectedVoice = null;

          if (voices.length > 0) {
            // Priority list for natural sounding voices
            const prioritires = [
              "Google US English",
              "Microsoft David",
              "Natural",
              "en-US",
              "English"
            ];

            // Personality specific tweaks
            if (personality.id === "zen") {
              selectedVoice = voices.find(v => (v.name.includes("Female") || v.name.includes("Google UK English Female") || v.name.includes("Samantha")) && v.lang.startsWith('en'));
              utterance.pitch = 0.75;
              utterance.rate = 0.8;
            } else if (personality.id === "sarcastic") {
              selectedVoice = voices.find(v => (v.name.includes("Male") || v.name.includes("Microsoft David")) && v.lang.startsWith('en'));
              utterance.pitch = 1.15;
              utterance.rate = 1.15;
            } else if (personality.id === "aria") {
              selectedVoice = voices.find(v => (v.name.includes("Zira") || v.name.includes("Female")) && v.lang.startsWith('en'));
              utterance.pitch = 1.0;
              utterance.rate = 1.0;
            }
            
            if (!selectedVoice) {
              for (const p of prioritires) {
                selectedVoice = voices.find(v => v.name.includes(p) && v.lang.startsWith('en'));
                if (selectedVoice) break;
              }
            }
            
            utterance.voice = selectedVoice || voices[0];
          }
          return utterance;
        };

        const speakUtterance = (utt: SpeechSynthesisUtterance) => {
          utt.onstart = () => {
            setStatus("speaking");
            console.log("JARVIS: Native vocal interface active.");
          };
          
          utt.onend = () => {
            setStatus("idle");
            console.log("JARVIS: Native vocalization complete.");
          };

          utt.onerror = (e) => {
            console.error("Native TTS Error:", e);
            setStatus("idle");
          };

          window.speechSynthesis.speak(utt);
        };

        const voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) {
          // Voices might not be loaded yet
          window.speechSynthesis.onvoiceschanged = () => {
            const utt = getBestVoice();
            speakUtterance(utt);
            window.speechSynthesis.onvoiceschanged = null; // Clean up
          };
        } else {
          const utt = getBestVoice();
          speakUtterance(utt);
        }
      } else {
        console.error("JARVIS: Total synthesis failure. No TTS available.");
        setStatus("idle");
      }
    }
  };

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      if (audioRef.current) audioRef.current.pause();
      setTranscript("");
      setStatus("listening");
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Likely already started
      }
    } else {
      alert("Speech recognition not supported in this browser.");
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const toggleListening = () => {
    if (status === "listening") {
      stopListening();
      setStatus("idle");
    } else {
      startListening();
    }
  };

  return {
    status,
    transcript,
    history,
    isAudioMuted,
    setIsAudioMuted,
    isLocalVoice,
    retryElevenLabs,
     personality,
    setPersonality,
    toggleListening,
    setHistory,
    clearHistory,
    stopAudio,
    handleQuery,
    mood,
    memories
  };
}
