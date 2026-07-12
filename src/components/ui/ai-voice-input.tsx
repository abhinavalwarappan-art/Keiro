"use client";

import { Mic } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AIVoiceInputProps {
  onStart?: () => void;
  onStop?: (duration: number) => void;
  visualizerBars?: number;
  demoMode?: boolean;
  demoInterval?: number;
  className?: string;
  /** Controlled recording state — pass from parent to sync with speech recognition */
  isRecording?: boolean;
}

export function AIVoiceInput({
  onStart,
  onStop,
  visualizerBars = 48,
  demoMode = false,
  demoInterval = 3000,
  className,
  isRecording: controlledRecording,
}: AIVoiceInputProps) {
  const [internalSubmitted, setInternalSubmitted] = useState(false);
  const [time, setTime] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [isDemo, setIsDemo] = useState(demoMode);

  const submitted = controlledRecording !== undefined ? controlledRecording : internalSubmitted;

  // Latest-value refs so the recording effect depends only on `submitted`
  const onStartRef = useRef(onStart);
  const onStopRef = useRef(onStop);
  const timeRef = useRef(time);
  // Skip the stop path on the very first run so mounting (submitted=false) does
  // not fire a spurious onStop(0) before recording has ever started.
  const hasStartedRef = useRef(false);
  useEffect(() => {
    onStartRef.current = onStart;
    onStopRef.current = onStop;
    timeRef.current = time;
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (submitted) {
      hasStartedRef.current = true;
      onStartRef.current?.();
      const intervalId = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);
      return () => clearInterval(intervalId);
    }
    // Only report a stop once a recording actually started.
    if (!hasStartedRef.current) return;
    const currentTime = timeRef.current;
    onStopRef.current?.(currentTime);
    setTime(0);
  }, [submitted]);

  useEffect(() => {
    if (!isDemo) return;

    let timeoutId: NodeJS.Timeout;
    const runAnimation = () => {
      setInternalSubmitted(true);
      timeoutId = setTimeout(() => {
        setInternalSubmitted(false);
        timeoutId = setTimeout(runAnimation, 1000);
      }, demoInterval);
    };

    const initialTimeout = setTimeout(runAnimation, 100);
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(initialTimeout);
    };
  }, [isDemo, demoInterval]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleClick = () => {
    if (controlledRecording !== undefined) return;
    if (isDemo) {
      setIsDemo(false);
      setInternalSubmitted(false);
    } else {
      setInternalSubmitted((prev) => !prev);
    }
  };

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="relative max-w-xl w-full mx-auto flex items-center flex-col gap-2">
        {controlledRecording === undefined && (
          <button
            className={cn(
              "group w-16 h-16 rounded-xl flex items-center justify-center transition-colors",
              submitted
                ? "bg-none"
                : "bg-none hover:bg-black/10"
            )}
            type="button"
            onClick={handleClick}
          >
            {submitted ? (
              <div
                className="w-6 h-6 rounded-sm animate-spin bg-brand-ink cursor-pointer pointer-events-auto"
                style={{ animationDuration: "3s" }}
              />
            ) : (
              <Mic className="w-6 h-6 text-brand-ink/70" />
            )}
          </button>
        )}

        <span
          className={cn(
            "font-mono text-sm transition-opacity duration-300",
            submitted
              ? "text-brand-ink"
              : "text-brand-ink/30"
          )}
        >
          {formatTime(time)}
        </span>

        <div className="h-4 w-64 flex items-center justify-center gap-0.5">
          {[...Array(visualizerBars)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-0.5 rounded-full transition duration-300",
                submitted
                  ? "bg-brand-ink/60 animate-pulse"
                  : "bg-brand-ink/15 h-1"
              )}
              style={
                submitted && isClient
                  ? {
                      // Deterministic pseudo-random bar heights — stable across renders
                      height: `${20 + ((i * 37 + 13) % 80)}%`,
                      animationDelay: `${i * 0.05}s`,
                    }
                  : undefined
              }
            />
          ))}
        </div>

        <p className="h-4 text-xs text-brand-ink/70">
          {submitted ? "Listening…" : controlledRecording === undefined ? "Click to speak" : ""}
        </p>
      </div>
    </div>
  );
}