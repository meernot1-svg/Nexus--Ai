import { motion } from "motion/react";

interface WaveAnimationProps {
  status: "idle" | "listening" | "thinking" | "speaking" | "error";
}

export default function WaveAnimation({ status }: WaveAnimationProps) {
  const bars = Array.from({ length: 15 }, (_, i) => i);

  return (
    <div className="flex items-center justify-center gap-1 h-32 w-full max-w-sm mx-auto">
      {bars.map((i) => (
        <motion.div
          key={i}
          id={`wave-bar-${i}`}
          className={`w-1 rounded-full ${
            status === "error" ? "bg-red-500" : "bg-jarvis-blue"
          }`}
          animate={{
            height: status === "listening" 
              ? [20, 60, 20] 
              : status === "speaking" 
                ? [10, 80, 10]
                : status === "thinking"
                  ? [10, 30, 20, 10]
                  : 8,
            opacity: status === "idle" ? 0.3 : 1
          }}
          transition={{
            duration: status === "thinking" ? 1.5 : 0.8,
            repeat: Infinity,
            delay: i * 0.05,
            ease: "easeInOut"
          }}
          style={{
            boxShadow: status !== "idle" ? "0 0 10px var(--color-jarvis-blue)" : "none"
          }}
        />
      ))}
    </div>
  );
}
