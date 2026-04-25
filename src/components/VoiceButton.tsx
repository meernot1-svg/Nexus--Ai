import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

interface VoiceButtonProps {
  isListening: boolean;
  isThinking: boolean;
  onToggle: () => void;
}

export default function VoiceButton({ isListening, isThinking, onToggle }: VoiceButtonProps) {
  return (
    <div className="relative group">
      {isListening && (
        <motion.div
          className="absolute inset-0 rounded-full bg-jarvis-blue/20"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      
      <Button
        id="voice-mic-button"
        size="lg"
        variant="ghost"
        className={`w-20 h-20 rounded-full border-2 transition-all duration-300 relative z-10 ${
          isListening 
            ? "border-jarvis-blue text-jarvis-blue bg-jarvis-blue/10" 
            : "border-white/10 text-white/50 hover:border-jarvis-blue/50 hover:text-jarvis-blue"
        }`}
        onClick={onToggle}
        disabled={isThinking}
      >
        {isThinking ? (
          <Loader2 className="w-10 h-10 animate-spin" />
        ) : isListening ? (
          <Mic className="w-10 h-10 neon-text" />
        ) : (
          <MicOff className="w-10 h-10" />
        )}
      </Button>
      
      {!isListening && !isThinking && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-jarvis-blue font-mono">
          Activate Jarvis
        </span>
      )}
    </div>
  );
}
