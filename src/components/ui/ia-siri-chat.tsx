"use client";

import { Mic, Volume2, VolumeX, Sparkles, Loader2 } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface VoiceChatProps {
  onStart?: () => void;
  onStop?: (duration: number) => void;
  onVolumeChange?: (volume: number) => void;
  className?: string;
  demoMode?: boolean;
  /** Label shown below the orb (e.g. "Listening to Kai") */
  label?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  opacity: number;
  velocity: { x: number; y: number };
}

export function VoiceChat({
  onStart,
  onStop,
  onVolumeChange,
  className,
  demoMode = true,
  label,
}: VoiceChatProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(0);
  const [duration, setDuration] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [waveformData, setWaveformData] = useState<number[]>(Array(32).fill(0));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animationRef = useRef<number>(0);
  const demoRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const durationRef = useRef<number>(0);
  const cancelledRef = useRef<boolean>(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const newParticles: Particle[] = Array.from({ length: 18 }, (_, i) => ({
        id: i,
        x: Math.random() * 400,
        y: Math.random() * 400,
        opacity: Math.random() * 0.25 + 0.05,
        velocity: { x: (Math.random() - 0.5) * 0.4, y: (Math.random() - 0.5) * 0.4 },
      }));
      setParticles(newParticles);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const tick = () => {
      setParticles(prev =>
        prev.map(p => ({
          ...p,
          x: (p.x + p.velocity.x + 400) % 400,
          y: (p.y + p.velocity.y + 400) % 400,
          opacity: Math.max(0.03, Math.min(0.3, p.opacity + (Math.random() - 0.5) * 0.015)),
        }))
      );
      animationRef.current = requestAnimationFrame(tick);
    };
    animationRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  useEffect(() => {
    if (isListening) {
      intervalRef.current = setInterval(() => {
        setDuration(t => {
          const next = t + 1;
          durationRef.current = next;
          return next;
        });
        setWaveformData(Array(32).fill(0).map(() => Math.random() * 100));
        const v = Math.random() * 100;
        setVolume(v);
        onVolumeChange?.(v);
      }, 120);
      return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
    const resetTimer = setTimeout(() => {
      setWaveformData(Array(32).fill(0));
      setVolume(0);
    }, 0);
    return () => clearTimeout(resetTimer);
  }, [isListening, onVolumeChange]);

  // Keep durationRef in sync when duration changes outside of the interval
  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  const runDemo = useCallback(async () => {
    if (cancelledRef.current) return;
    setIsListening(true);
    onStart?.();

    await delay(3000);
    if (cancelledRef.current) return;

    setIsListening(false);
    setIsProcessing(true);
    onStop?.(durationRef.current);

    await delay(1800);
    if (cancelledRef.current) return;

    setIsProcessing(false);
    setIsSpeaking(true);

    await delay(3500);
    if (cancelledRef.current) return;

    setIsSpeaking(false);
    setDuration(0);
    durationRef.current = 0;

    demoRef.current = setTimeout(runDemo, 1800);
  }, [onStart, onStop]);

  useEffect(() => {
    if (!demoMode) return;
    cancelledRef.current = false;
    demoRef.current = setTimeout(runDemo, 800);
    return () => {
      cancelledRef.current = true;
      if (demoRef.current) clearTimeout(demoRef.current);
    };
  }, [demoMode, runDemo]);

  const handleToggle = () => {
    if (demoMode) return;
    if (isListening) {
      setIsListening(false);
      onStop?.(durationRef.current);
      setDuration(0);
      durationRef.current = 0;
    } else {
      setIsListening(true);
      onStart?.();
    }
  };

  const fmt = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const statusText = isListening ? "Listening…" : isProcessing ? "Thinking…" : isSpeaking ? "Speaking…" : "Tap to speak";
  const activeColor = isListening ? "#2DD4BF" : isProcessing ? "#F59E0B" : isSpeaking ? "#34D399" : "rgba(255,255,255,0.3)";

  return (
    <div className={cn("relative flex flex-col items-center overflow-hidden", className)}>
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute w-1 h-1 rounded-full"
            style={{ left: p.x, top: p.y, opacity: p.opacity, background: "#2DD4BF" }}
          />
        ))}
      </div>

      {/* Ambient glow behind orb */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
        <motion.div
          className="w-64 h-64 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(11,143,172,0.2) 0%, transparent 70%)" }}
          animate={{ scale: isListening ? [1, 1.25, 1] : [1, 1.08, 1], opacity: isListening ? [0.5, 0.9, 0.5] : [0.2, 0.35, 0.2] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Orb button */}
      <div className="relative z-10">
        <motion.button
          onClick={handleToggle}
          whileHover={!demoMode ? { scale: 1.06 } : undefined}
          whileTap={!demoMode ? { scale: 0.94 } : undefined}
          className="relative w-28 h-28 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(11,143,172,0.25) 0%, rgba(7,95,119,0.15) 100%)",
            border: `2px solid ${activeColor}`,
            boxShadow: `0 0 0 0 ${activeColor}`,
          }}
          animate={{ boxShadow: isListening ? [`0 0 0 0 ${activeColor}55`, `0 0 0 20px ${activeColor}00`] : undefined }}
          transition={{ duration: 1.4, repeat: isListening ? Infinity : 0 }}
        >
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div key="proc" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}>
                <Loader2 className="w-10 h-10 animate-spin" style={{ color: "#F59E0B" }} />
              </motion.div>
            ) : isSpeaking ? (
              <motion.div key="speak" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}>
                <Volume2 className="w-10 h-10" style={{ color: "#34D399" }} />
              </motion.div>
            ) : isListening ? (
              <motion.div key="listen" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}>
                <Mic className="w-10 h-10" style={{ color: "#2DD4BF" }} />
              </motion.div>
            ) : (
              <motion.div key="idle" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}>
                <Mic className="w-10 h-10" style={{ color: "rgba(255,255,255,0.35)" }} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Pulse rings */}
        <AnimatePresence>
          {isListening && (
            <>
              <motion.div
                key="ring1"
                className="absolute inset-0 rounded-full border-2 pointer-events-none"
                style={{ borderColor: "rgba(82,197,220,0.35)" }}
                initial={{ scale: 1, opacity: 0.7 }}
                animate={{ scale: 1.6, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.div
                key="ring2"
                className="absolute inset-0 rounded-full border-2 pointer-events-none"
                style={{ borderColor: "rgba(82,197,220,0.2)" }}
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 2.1, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
              />
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Waveform */}
      <div className="relative z-10 flex items-center justify-center gap-px h-10 mt-6">
        {waveformData.map((h, i) => (
          <motion.div
            key={i}
            className="w-[3px] rounded-full"
            style={{ background: activeColor }}
            animate={{ height: `${Math.max(3, (isListening || isSpeaking ? h : 4) * 0.38)}px`, opacity: isListening || isSpeaking ? 0.8 : 0.2 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
          />
        ))}
      </div>

      {/* Status */}
      <div className="relative z-10 mt-4 text-center space-y-1">
        <motion.p
          className="text-[14px] font-semibold tracking-wide"
          style={{ color: activeColor }}
          animate={{ opacity: isListening || isProcessing || isSpeaking ? [1, 0.65, 1] : 1 }}
          transition={{ duration: 1.8, repeat: isListening || isProcessing || isSpeaking ? Infinity : 0 }}
        >
          {statusText}
        </motion.p>
        {(isListening || duration > 0) && (
          <p className="font-mono text-[12px]" style={{ color: "rgba(255,255,255,0.3)" }}>
            {fmt(duration)}
          </p>
        )}
        {volume > 0 && (
          <motion.div
            className="flex items-center justify-center gap-2 mt-1"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <VolumeX className="w-3 h-3" style={{ color: "rgba(255,255,255,0.3)" }} />
            <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <motion.div className="h-full rounded-full" style={{ background: "#2DD4BF" }} animate={{ width: `${volume}%` }} transition={{ duration: 0.1 }} />
            </div>
            <Volume2 className="w-3 h-3" style={{ color: "rgba(255,255,255,0.3)" }} />
          </motion.div>
        )}
      </div>

      {/* AI label */}
      <motion.div
        className="relative z-10 flex items-center gap-1.5 mt-4"
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <Sparkles className="w-3 h-3" style={{ color: "rgba(82,197,220,0.5)" }} />
        <span className="text-[11px] uppercase tracking-widest font-medium" style={{ color: "rgba(82,197,220,0.5)" }}>
          {label ?? "Kai · Voice AI"}
        </span>
      </motion.div>
    </div>
  );
}

function delay(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

export default VoiceChat;