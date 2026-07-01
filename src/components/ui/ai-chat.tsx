"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message { sender: "kai" | "user"; text: string }

interface KaiChatPreviewProps {
  className?: string;
  /** If true, runs a scripted demo conversation automatically */
  autoPlay?: boolean;
  /** Language label shown in the header */
  languageLabel?: string;
}

const DEMO_SCRIPT: Message[] = [
  { sender: "kai",  text: "नमस्ते! मैं Kai हूं। आज आपको क्या तकलीफ हो रही है?" },
  { sender: "user", text: "मेरे पेट में बहुत दर्द है।" },
  { sender: "kai",  text: "समझ गया। दर्द पेट में कहाँ महसूस हो रहा है — ऊपर, नीचे, या बीच में?" },
  { sender: "user", text: "नीचे की तरफ, और कभी-कभी पीठ में भी।" },
  { sender: "kai",  text: "1 से 10 के पैमाने पर दर्द कितना तेज़ है?" },
  { sender: "user", text: "करीब 7।" },
  { sender: "kai",  text: "ठीक है। क्या आपको बुखार या मतली भी है?" },
]

const KAI_TYPING_BASE_MS = 1400;
const KAI_TYPING_PER_CHAR_MS = 18;
const USER_MESSAGE_DELAY_MS = 900;
const KAI_REPLY_DELAY_MS = 1200;
const KAI_FALLBACK_REPLY = "समझ गया। क्या और कोई लक्षण है?";

export function KaiChatPreview({
  className,
  autoPlay = true,
  languageLabel = "हिंदी",
}: KaiChatPreviewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [demoIndex, setDemoIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  // Auto-play scripted demo
  useEffect(() => {
    if (!autoPlay) return;
    if (demoIndex >= DEMO_SCRIPT.length) return;

    const msg = DEMO_SCRIPT[demoIndex];
    let timeout: ReturnType<typeof setTimeout>;
    let typingTimeout: ReturnType<typeof setTimeout> | undefined;

    if (msg.sender === "kai") {
      typingTimeout = setTimeout(() => setIsTyping(true), 0);
      timeout = setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, msg]);
        setDemoIndex(i => i + 1);
      }, KAI_TYPING_BASE_MS + msg.text.length * KAI_TYPING_PER_CHAR_MS);
    } else {
      timeout = setTimeout(() => {
        setMessages(prev => [...prev, msg]);
        setDemoIndex(i => i + 1);
      }, USER_MESSAGE_DELAY_MS);
    }

    return () => {
      clearTimeout(timeout);
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [autoPlay, demoIndex]);

  const handleSend = () => {
    if (!input.trim() || autoPlay) return;
    const trimmedInput = input.trim();
    setMessages(prev => [...prev, { sender: "user", text: trimmedInput }]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { sender: "kai", text: KAI_FALLBACK_REPLY }]);
    }, KAI_REPLY_DELAY_MS);
  };

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden",
        "rounded-[28px]",
        className,
      )}
      style={{
        background: "#13110F",
        border: "1px solid rgba(82,197,220,0.12)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(11,143,172,0.12) 0%, transparent 60%)" }}
      />

      {/* Header */}
      <div
        className="relative z-10 flex items-center gap-3 px-5 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Kai avatar dot */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#14B8A6,#0F766E)" }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M2 2h4v4L2 12V2z" fill="white" opacity="0.9"/>
            <path d="M7 2h5L7 12H4.5L7 2z" fill="white"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-white tracking-tight">Kai</p>
          <p className="text-[11px]" style={{ color: "rgba(82,197,220,0.6)" }}>{languageLabel} · Medical intake</p>
        </div>
        {/* Live badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-semibold text-emerald-400">Live</span>
        </div>
      </div>

      {/* AI disclaimer */}
      <div className="relative z-10 flex items-center gap-2 px-4 py-2" style={{ background: "rgba(245,158,11,0.06)", borderBottom: "1px solid rgba(245,158,11,0.1)" }}>
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#F59E0B" }} />
        <span className="text-[10px] font-medium" style={{ color: "rgba(245,158,11,0.7)" }}>
          AI assistant · Not a medical professional
        </span>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="relative z-10 flex-1 overflow-y-auto px-4 py-5 space-y-3"
        style={{ minHeight: 0 }}
      >
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className={cn("flex", msg.sender === "kai" ? "justify-start" : "justify-end")}
          >
            <div
              className="max-w-[82%] px-4 py-3 text-[14px] leading-[1.65]"
              style={
                msg.sender === "kai"
                  ? {
                      background: "#0F766E",
                      color: "white",
                      borderRadius: "16px 16px 16px 3px",
                      boxShadow: "0 2px 12px rgba(7,95,119,0.2)",
                    }
                  : {
                      background: "rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.9)",
                      borderRadius: "16px 16px 3px 16px",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }
              }
            >
              {msg.text}
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="flex items-end gap-2"
            >
              <div
                className="flex gap-1 px-4 py-3 rounded-[16px_16px_16px_3px]"
                style={{ background: "#0F766E" }}
              >
                {[0, 1, 2].map(i => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "#2DD4BF" }}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input row */}
      <div
        className="relative z-10 flex items-center gap-2 px-4 py-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}
      >
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder={autoPlay ? "बोलें या लिखें…" : "Type your message…"}
          disabled={autoPlay}
          className="flex-1 bg-transparent text-[13px] py-1 focus:outline-none"
          style={{ color: autoPlay ? "rgba(255,255,255,0.25)" : "white", caretColor: "#2DD4BF" }}
          aria-label="Chat input"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || autoPlay}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition"
          style={{
            background: input.trim() && !autoPlay ? "#14B8A6" : "rgba(255,255,255,0.06)",
            color: input.trim() && !autoPlay ? "white" : "rgba(255,255,255,0.2)",
          }}
          aria-label="Send"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default KaiChatPreview;