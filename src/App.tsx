import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Volume2, VolumeX, Trash2, Terminal, Plus, Mic, Send, Search, Image as ImageIcon, Edit3, User, Cpu, Activity, Database, Zap, Share2, Download, Layout, Ghost, Wind, Youtube, MessageCircle, Languages } from "lucide-react";
import { useJarvis } from "./hooks/useJarvis";
import { PERSONALITIES } from "./types";
import { ActionCard } from "./components/ActionCard";
import { openWhatsApp } from "./services/whatsappService";
import { openEmailClient } from "./services/emailService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function App() {
  const { 
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
    clearHistory,
    handleQuery,
    mood,
    memories 
  } = useJarvis();
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [isTerminalMode, setIsTerminalMode] = useState(false);
  const [uptime, setUptime] = useState("99.98%");
  const [showMemories, setShowMemories] = useState(false);
  
  useEffect(() => {
    if (memories.length > 0) {
      setShowMemories(true);
    }
  }, [memories]);

  useEffect(() => {
    const timer = setInterval(() => {
      const val = (99.9 + Math.random() * 0.09).toFixed(2);
      setUptime(`${val}%`);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [history]);

  const onSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    const query = inputValue.trim();
    if (query) {
      handleQuery(query);
      setInputValue("");
    }
  };

  const getMoodConfig = () => {
    switch (mood) {
      case "positive": return { color: "from-green-400 to-emerald-500", label: "Optimistic", icon: <Zap className="w-3 h-3" /> };
      case "analytical": return { color: "from-blue-400 to-indigo-500", label: "Thinking", icon: <Cpu className="w-3 h-3" /> };
      case "energetic": return { color: "from-orange-400 to-red-500", label: "Focused", icon: <Activity className="w-3 h-3" /> };
      default: return { color: "from-cyan-400 to-blue-500", label: "Stable", icon: <Zap className="w-3 h-3" /> };
    }
  };

  const moodConfig = getMoodConfig();

  return (
    <TooltipProvider>
      <div className={`min-h-[100dvh] transition-colors duration-700 relative overflow-hidden ${isTerminalMode ? 'bg-slate-950 text-emerald-500' : 'bg-white text-slate-900'} font-sans selection:bg-cyan-100 flex flex-col items-center`}>
        
        {/* Dynamic Mood Aura (Unique Feature) */}
        <div className={`fixed inset-0 pointer-events-none opacity-20 transition-all duration-1000 bg-gradient-to-tr ${moodConfig.color} blur-[120px] -z-10`} />
        
        {/* Mood Indicator (Unique Feature) */}
        <div className="fixed top-20 right-4 z-40 hidden md:flex flex-col items-end gap-3">
          <div className={`p-1.5 pr-3 rounded-full border bg-white/80 backdrop-blur-md shadow-lg flex items-center gap-2 transform transition-all duration-700 ${isTerminalMode ? 'border-emerald-900/30 bg-slate-900/80' : 'border-slate-100'}`}>
            <div className={`w-3 h-3 rounded-full bg-gradient-to-tr ${moodConfig.color} animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.5)]`} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-70">Neural: {moodConfig.label}</span>
          </div>
          
          <AnimatePresence>
            {showMemories && memories.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`max-w-[200px] p-3 rounded-2xl border bg-white/80 backdrop-blur-md shadow-2xl flex flex-col gap-2 ${isTerminalMode ? 'border-emerald-900/30 bg-slate-900/80' : 'border-slate-100'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest opacity-50 underline decoration-cyan-500/30">Synaptic Links</span>
                  <button onClick={() => setShowMemories(false)} className="text-slate-300 hover:text-slate-500"><Plus className="w-3 h-3 rotate-45" /></button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {memories.map((word, i) => (
                    <span key={i} className={`text-[9px] px-2 py-0.5 rounded-md border ${isTerminalMode ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' : 'bg-slate-50 border-slate-200 text-slate-600 shadow-sm'}`}>
                      {word}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Progress bar for "thinking" */}
        {status === "thinking" && (
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            className="fixed top-0 left-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 z-[100]"
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        {/* Top Header */}
        <header className={`w-full px-3 sm:px-6 h-12 flex items-center justify-between sticky top-0 ${isTerminalMode ? 'bg-slate-950/80' : 'bg-white/80'} backdrop-blur-md z-50 border-b ${isTerminalMode ? 'border-emerald-900/10' : 'border-slate-50'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-1 rounded-lg bg-gradient-to-tr ${isTerminalMode ? 'from-emerald-400 to-green-500' : 'from-cyan-400 to-blue-600'} shadow-sm`}>
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex flex-col -space-y-0.5">
              <span className={`font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r ${isTerminalMode ? 'from-emerald-400 to-green-500' : 'from-cyan-600 to-blue-600'} bg-clip-text text-transparent`}>Nexus AI</span>
              <span className="text-[8px] font-mono text-slate-400 font-normal uppercase tracking-wider opacity-60">Developed by Safiullah</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-4">
            <div className="flex items-center gap-0.5 bg-slate-100/50 p-0.5 rounded-lg border border-slate-200/30">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={() => setIsTerminalMode(!isTerminalMode)}
                    className={`h-6 w-6 flex items-center justify-center rounded-md transition-colors cursor-pointer outline-none ${isTerminalMode ? 'text-emerald-400 bg-emerald-950/50' : 'text-slate-400 hover:text-slate-600 hover:bg-white/30'}`}
                  >
                    <Terminal className="w-3 h-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="text-[10px]">Matrix Mode</TooltipContent>
              </Tooltip>

              <div className="w-px h-3 bg-slate-200 mx-0.5" />

              {PERSONALITIES.map((p) => {
                const Icon = p.id === "nexus" ? Zap : p.id === "urdu" ? Languages : p.id === "sarcastic" ? Ghost : p.id === "zen" ? Wind : User;
                const active = personality.id === p.id;
                return (
                  <div key={p.id}>
                    <Tooltip>
                      <TooltipTrigger 
                        type="button"
                        onClick={() => setPersonality(p)}
                        className={`h-6 w-6 flex items-center justify-center rounded-md transition-all cursor-pointer outline-none ${
                          active 
                            ? 'bg-white shadow-sm text-cyan-600 ring-1 ring-black/5' 
                            : 'text-slate-400 hover:text-slate-600 hover:bg-white/30'
                        }`}
                      >
                        <Icon className={`w-3 h-3 ${active ? 'scale-110' : ''}`} />
                      </TooltipTrigger>
                      <TooltipContent side="bottom" align="center" className="text-[10px]">
                        <span className="font-bold">{p.name}</span>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-1 border-l pl-2 border-slate-100">
               <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsAudioMuted(!isAudioMuted)}
                    className={`h-7 w-7 rounded-md ${isAudioMuted ? 'text-red-500 bg-red-50' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="text-[10px]">{isAudioMuted ? "Unmute" : "Mute"}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={clearHistory}
                    className="text-slate-400 h-7 w-7 rounded-md hover:text-red-500 hover:bg-red-50/50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="text-[10px]">Clear History</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-4xl flex flex-col relative px-4 pb-12">
          {history.length === 0 ? (
            <div className="flex-1 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-1000 pt-4 md:pt-8 space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-200/50"
                >
                  <Zap className="w-8 h-8 text-white" />
                </motion.div>
                <h1 className="text-4xl md:text-7xl font-bold tracking-tighter text-center animate-in fade-in zoom-in duration-1000 select-none">
                  <span className="flex flex-col md:flex-row items-center justify-center gap-x-4">
                    <span className={`font-script text-3xl md:text-5xl font-normal lowercase mb-2 md:mb-0 ${isTerminalMode ? 'text-emerald-400/80' : 'text-blue-500/80'}`}>Welcome to</span>
                    <span className={`bg-gradient-to-r ${isTerminalMode ? 'from-emerald-400 to-green-500' : 'from-blue-600 via-cyan-400 to-indigo-600'} bg-clip-text text-transparent drop-shadow-sm`}>
                      Nexus AI
                    </span>
                  </span>
                </h1>
                <div className="flex items-center gap-2">
                   <div className={`px-3 py-1 rounded-full text-[10px] font-mono border ${isTerminalMode ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-400' : 'bg-slate-50 border-slate-200 text-slate-500'} flex items-center gap-1.5 animate-in fade-in zoom-in duration-500`}>
                     <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                     Mode: {personality.name}
                   </div>
                </div>
              </div>
              
              <div className="w-full flex flex-col items-center space-y-6">
                <div className="w-full max-w-2xl relative">
                  <form 
                    onSubmit={onSendMessage} 
                    className={`relative flex items-center ${isTerminalMode ? 'bg-slate-900 border-emerald-900/50' : 'bg-white border-cyan-400/20 shadow-xl'} border rounded-3xl h-16 px-6 gap-4 transition-all neon-border-pulse hover:shadow-2xl`}
                  >
                    <Plus className="w-6 h-6 text-slate-400 cursor-pointer hover:text-slate-600" />
                    <input 
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask Nexus AI..." 
                      className={`flex-1 bg-transparent border-none focus:ring-0 focus:outline-none outline-none text-lg ${isTerminalMode ? 'text-emerald-400 placeholder:text-emerald-900' : 'text-slate-800'}`}
                    />
                    <div className="flex items-center gap-2">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={toggleListening}
                        className={`h-10 w-10 rounded-full transition-colors ${status === "listening" ? "text-cyan-500 bg-cyan-50 animate-pulse" : "text-slate-400"}`}
                      >
                        <Mic className="w-6 h-6" />
                      </Button>
                      <button 
                        type="submit"
                        disabled={!inputValue.trim()}
                        className={`w-10 h-10 flex items-center justify-center ${isTerminalMode ? 'bg-emerald-500 text-slate-950' : 'bg-black text-white'} rounded-full hover:opacity-80 transition-colors disabled:opacity-20`}
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </form>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 w-full">
                  <SuggestionCard isTerminal={isTerminalMode} icon={<ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-500" />} text="Vision" sub="Create visuals" onClick={() => handleQuery("Generate a cyberpunk city illustration")} />
                  <SuggestionCard isTerminal={isTerminalMode} icon={<Youtube className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />} text="Media" sub="YouTube" onClick={() => handleQuery("Search for latest technology videos on YouTube")} />
                  <SuggestionCard isTerminal={isTerminalMode} icon={<Edit3 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />} text="Scribe" sub="Draft text" onClick={() => handleQuery("Write a professional email about project Nexus milestones")} />
                  <SuggestionCard isTerminal={isTerminalMode} icon={<MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />} text="Connect" sub="WhatsApp" onClick={() => handleQuery("Message my team on WhatsApp about the meeting")} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full mt-4">
              <ScrollArea className="flex-1 -mx-4" viewportRef={scrollRef}>
                <div className="space-y-10 p-4 pb-20">
                  {history.map((msg, k) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={k} 
                      className={`flex gap-3 md:gap-6 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.role !== "user" && (
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-2xl ${isTerminalMode ? 'bg-emerald-500 text-slate-950' : 'bg-cyan-500 text-white'} flex items-center justify-center shrink-0 mt-1 shadow-sm neon-glow`}>
                          {personality.id === 'nexus' && <Zap className="w-4 h-4 sm:w-6 sm:h-6" />}
                          {personality.id === 'urdu' && <Languages className="w-4 h-4 sm:w-6 sm:h-6" />}
                          {personality.id === 'sarcastic' && <Ghost className="w-4 h-4 sm:w-6 sm:h-6" />}
                          {personality.id === 'zen' && <Wind className="w-4 h-4 sm:w-6 sm:h-6" />}
                          {personality.id === 'aria' && <User className="w-4 h-4 sm:w-6 sm:h-6" />}
                        </div>
                      )}
                      <div className={`max-w-[88%] sm:max-w-[85%] flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                        <div className={`p-3 sm:p-5 rounded-2xl sm:rounded-3xl text-sm sm:text-[15px] leading-relaxed shadow-sm border ${
                          msg.role === "user" 
                            ? `${isTerminalMode ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' : 'bg-slate-50 border-slate-100 text-slate-800'} rounded-tr-sm px-4 sm:px-6` 
                            : `${isTerminalMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-50 text-slate-700 shadow-md'} rounded-tl-sm neon-text`
                        }`}>
                          <div className="markdown-body">
                            {msg.content}
                          </div>
                          
                          {msg.action && (
                            <ActionCard 
                              type={msg.action.type} 
                              data={msg.action.data} 
                              onAction={(action, payload) => {
                                if (msg.action?.type === 'youtube') {
                                  window.open(payload.link, '_blank');
                                } else if (msg.action?.type === 'whatsapp') {
                                  openWhatsApp("", payload.content);
                                } else if (msg.action?.type === 'email') {
                                  openEmailClient("", "Nexus AI Inquiry", "Hello, I am using Nexus AI...");
                                } else if (msg.action?.type === 'search') {
                                  window.open(payload.link, '_blank');
                                }
                              }}
                            />
                          )}
                          
                          {/* Image Preview Helper (UI only) */}
                          {msg.content.toLowerCase().includes("image") && !msg.content.includes("ERROR") && (
                            <div className="mt-4 p-2 bg-slate-100/50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center h-48 group cursor-pointer overflow-hidden relative">
                              <div className="z-10 flex flex-col items-center animate-pulse">
                                <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Processing Visual...</span>
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 mix-blend-overlay" />
                            </div>
                          )}
                        </div>
                        
                        {msg.role !== "user" && (
                          <div className="flex gap-4 mt-2 px-1">
                            <span className="text-[9px] font-mono opacity-30 uppercase tracking-tighter">Model: Nexus-4.8</span>
                            <div className="flex gap-2">
                              <button className="text-slate-400 hover:text-cyan-500 transition-colors"><Share2 className="w-3 h-3" /></button>
                              <button className="text-slate-400 hover:text-cyan-500 transition-colors"><Download className="w-3 h-3" /></button>
                            </div>
                          </div>
                        )}
                      </div>
                      {msg.role === "user" && (
                        <div className={`w-10 h-10 rounded-2xl ${isTerminalMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-slate-100 text-slate-500'} flex items-center justify-center shrink-0 mt-1`}>
                          <User className="w-6 h-6" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {status === "thinking" && (
                    <div className="flex gap-4 md:gap-6">
                      <div className="w-10 h-10 rounded-2xl bg-cyan-500 flex items-center justify-center text-white shrink-0 mt-1 thinking-neon shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                        {personality.id === 'nexus' && <Zap className="w-6 h-6" />}
                        {personality.id === 'urdu' && <Languages className="w-6 h-6" />}
                        {personality.id === 'sarcastic' && <Ghost className="w-6 h-6" />}
                        {personality.id === 'zen' && <Wind className="w-6 h-6" />}
                        {personality.id === 'aria' && <User className="w-6 h-6" />}
                      </div>
                      <div className={`h-12 w-32 rounded-2xl flex items-center justify-center gap-3 border shadow-sm ${isTerminalMode ? 'bg-slate-900 border-emerald-900/30' : 'bg-cyan-50/50 border-cyan-100/50'}`}>
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
                          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                        <div className="text-[10px] font-mono text-cyan-600 uppercase tracking-tighter thinking-neon">Linking</div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Sticky bottom input */}
              <div className={`sticky bottom-0 w-full ${isTerminalMode ? 'bg-slate-950/95' : 'bg-white/95'} backdrop-blur-md pt-2 pb-4 px-4`}>
                 <form 
                    onSubmit={onSendMessage} 
                    className={`relative flex items-center ${isTerminalMode ? 'bg-slate-900 border-emerald-900/50' : 'bg-white border-slate-200 shadow-xl'} border rounded-2xl h-12 sm:h-16 px-4 sm:px-6 gap-2 sm:gap-4 transition-all`}
                  >
                    <Plus className="w-6 h-6 text-slate-400 cursor-pointer hover:text-slate-600" />
                    <input 
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Enter directive..." 
                      className={`flex-1 bg-transparent border-none focus:ring-0 focus:outline-none outline-none text-base ${isTerminalMode ? 'text-emerald-400' : 'text-slate-800'}`}
                    />
                    <div className="flex items-center gap-2">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={toggleListening}
                        className={`h-10 w-10 rounded-full transition-colors ${status === "listening" ? "text-cyan-500 bg-cyan-50 animate-pulse" : "text-slate-400"}`}
                      >
                        <Mic className="w-6 h-6" />
                      </Button>
                      <button 
                        type="submit"
                        disabled={!inputValue.trim()}
                        className={`w-10 h-10 flex items-center justify-center ${isTerminalMode ? 'bg-emerald-500 text-slate-950' : 'bg-black text-white'} rounded-full hover:bg-zinc-800 transition-colors disabled:opacity-20 relative z-10`}
                      >
                        <Send className="w-5 h-5" />
                      </button>

                      {/* Neuro-Visualizer Waves (Unique Feature) */}
                      {(status === "thinking" || status === "speaking" || status === "listening") && (
                        <div className="absolute inset-x-12 bottom-0 h-1 flex items-end justify-around px-8 opacity-40 pointer-events-none">
                           {[...Array(12)].map((_, i) => (
                             <motion.div 
                               key={i}
                               animate={{ height: [2, 12, 4, 16, 2] }}
                               transition={{ 
                                 duration: 0.8 + Math.random(), 
                                 repeat: Infinity,
                                 delay: i * 0.1 
                               }}
                               className={`w-0.5 rounded-full bg-gradient-to-t ${moodConfig.color}`}
                             />
                           ))}
                        </div>
                      )}
                    </div>
                  </form>
              </div>
            </div>
          )}
        </main>
        
        {/* Mobile Overlay for transcript during listening */}
        <AnimatePresence>
          {status === "listening" && transcript && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white/90 backdrop-blur-md z-[100] flex items-center justify-center p-8 overflow-hidden"
            >
              <div className="max-w-xl flex flex-col items-center space-y-8">
                 <div className="w-24 h-24 bg-cyan-100 rounded-full flex items-center justify-center animate-pulse shadow-xl shadow-cyan-100/50">
                    <Mic className="w-12 h-12 text-cyan-600" />
                 </div>
                 <p className="text-4xl font-medium text-center text-slate-800 leading-tight">
                  {transcript}
                 </p>
                 <Button variant="outline" onClick={toggleListening} className="rounded-full px-12 h-12 text-lg">Close Interface</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}

function SuggestionCard({ icon, text, sub, onClick, isTerminal }: { icon: React.ReactNode, text: string, sub?: string, onClick: () => void, isTerminal?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-start p-3 sm:p-5 ${isTerminal ? 'bg-slate-900 border-emerald-900/30' : 'bg-white border-slate-100'} border rounded-2xl sm:rounded-3xl text-left hover:border-cyan-200 transition-all shadow-sm group active:scale-95`}
    >
      <div className="mb-2 sm:mb-3 group-hover:scale-110 transition-transform bg-slate-50 p-1.5 sm:p-2 rounded-lg sm:rounded-xl">{icon}</div>
      <div className={`text-xs sm:text-sm font-semibold h-4 overflow-hidden ${isTerminal ? 'text-emerald-400' : 'text-slate-800'}`}>{text}</div>
      <div className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5 sm:mt-1 uppercase tracking-wider font-mono truncate w-full">{sub}</div>
    </button>
  );
}

