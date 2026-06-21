"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Send,
  Sparkles,
  Trash2,
  Bot,
  User,
  Loader2,
  Zap,
  Apple,
  Wallet,
  Calendar,
} from "lucide-react";
import type { AIChatContext } from "@/app/actions/meal-actions";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIChatPageProps {
  context: AIChatContext | null;
}

const QUICK_CHIPS = [
  { icon: Calendar, label: "Lihat meal plan hari ini" },
  { icon: Apple, label: "Saran menu sehat" },
  { icon: Wallet, label: "Cek budget & saldo" },
  { icon: Zap, label: "Tips nutrisi untuk tujuanku" },
];

const GOAL_LABEL: Record<string, string> = {
  weight_loss: "Turun Berat Badan",
  muscle_gain: "Tambah Massa Otot",
  healthy_life: "Hidup Lebih Sehat",
  budget_healthy: "Hemat Makan Sehat",
};

function formatTime(date: Date) {
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

export default function AIChatPage({ context }: AIChatPageProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Halo${context?.userName ? ` ${context.userName.split(" ")[0]}` : ""}! 👋 Aku **MealIt AI**, asisten nutrisi & meal planning-mu.\n\nAku bisa bantu kamu:\n• 🍽️ Diskusi meal plan hari ini\n• 💡 Rekomendasi menu sesuai tujuanmu\n• 💰 Pantau budget & saldo Nutri-Wallet\n• 🥗 Tips nutrisi & kesehatan\n\nMau tanya apa hari ini?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      try {
        // Only send conversation messages (exclude welcome), last 5
        const history = [...messages.filter((m) => m.id !== "welcome"), userMessage]
          .slice(-5)
          .map((m) => ({ role: m.role, content: m.content }));

        const res = await fetch("/api/ai-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });

        const data = await res.json();
        const replyText = data.reply ?? "Maaf, terjadi kesalahan. Coba lagi ya!";

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: replyText,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMessage]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "Oops, koneksi bermasalah. Coba lagi sebentar ya! 🙏",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome-" + Date.now(),
        role: "assistant",
        content: `Percakapan baru dimulai! 🌟 Ada yang bisa aku bantu seputar meal plan atau nutrisimu?`,
        timestamp: new Date(),
      },
    ]);
  };

  // Render message content with basic markdown-like bold support
  const renderContent = (text: string) => {
    return text.split("\n").map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <span key={i}>
          {parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j}>{part}</strong> : part
          )}
          {i < text.split("\n").length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <div
      className="flex flex-col"
      style={{
        height: "100dvh",
        background: "linear-gradient(135deg, #0a1628 0%, #0d2318 40%, #0a1628 100%)",
        overflow: "hidden",
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0"
        style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center gap-3">
          <button
            id="ai-chat-back-btn"
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex items-center gap-2.5">
            {/* AI Avatar */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center relative"
              style={{ background: "linear-gradient(135deg, #0f5238, #22c55e)" }}
            >
              <Bot size={18} className="text-white" />
              {/* Online dot */}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0a1628]" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">MealIt AI</p>
              <p className="text-emerald-400 text-[10px] font-medium">● Online</p>
            </div>
          </div>
        </div>

        <button
          id="ai-chat-clear-btn"
          onClick={clearChat}
          title="Bersihkan chat"
          className="w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-rose-400 hover:bg-white/10 transition-all"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* ── Context Banner ── */}
      {context && (
        <div
          className="mx-4 mt-3 mb-1 rounded-xl px-3 py-2 flex items-center gap-3 flex-shrink-0 text-xs"
          style={{ background: "rgba(15,82,56,0.25)", border: "1px solid rgba(34,197,94,0.2)" }}
        >
          <Sparkles size={13} className="text-emerald-400 flex-shrink-0" />
          <div className="flex gap-3 flex-wrap">
            <span className="text-white/70">
              Budget:{" "}
              <span className="text-emerald-400 font-semibold">
                Rp {context.dailyBudget.toLocaleString("id-ID")}
              </span>
            </span>
            <span className="text-white/30">|</span>
            <span className="text-white/70">
              Wallet:{" "}
              <span className="text-emerald-400 font-semibold">
                Rp {context.walletBalance.toLocaleString("id-ID")}
              </span>
            </span>
            {context.bodyGoal && (
              <>
                <span className="text-white/30">|</span>
                <span className="text-white/70">
                  Tujuan:{" "}
                  <span className="text-amber-400 font-semibold">
                    {GOAL_LABEL[context.bodyGoal] ?? context.bodyGoal}
                  </span>
                </span>
              </>
            )}
            {context.todayPlan && (
              <>
                <span className="text-white/30">|</span>
                <span className="text-white/70">
                  Plan hari ini:{" "}
                  <span className="text-sky-400 font-semibold">
                    {context.todayPlan.totalCalories} kkal
                  </span>
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            style={{ animation: "chatFadeIn 0.3s ease-out" }}
          >
            {/* Avatar */}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-1"
              style={
                msg.role === "assistant"
                  ? { background: "linear-gradient(135deg, #0f5238, #22c55e)" }
                  : { background: "linear-gradient(135deg, #1e3a5f, #2d5a8e)" }
              }
            >
              {msg.role === "assistant" ? (
                <Bot size={14} className="text-white" />
              ) : (
                <User size={14} className="text-white" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[78%] rounded-2xl px-4 py-3 ${
                msg.role === "user" ? "rounded-br-sm" : "rounded-bl-sm"
              }`}
              style={
                msg.role === "user"
                  ? {
                      background: "linear-gradient(135deg, #0f5238, #1a7a52)",
                      boxShadow: "0 4px 15px rgba(15,82,56,0.4)",
                    }
                  : {
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      backdropFilter: "blur(10px)",
                    }
              }
            >
              <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                {renderContent(msg.content)}
              </p>
              <p
                className={`text-[10px] mt-1.5 ${
                  msg.role === "user" ? "text-emerald-200/60" : "text-white/30"
                } text-right`}
              >
                {formatTime(msg.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-end gap-2" style={{ animation: "chatFadeIn 0.3s ease-out" }}>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #0f5238, #22c55e)" }}
            >
              <Bot size={14} className="text-white" />
            </div>
            <div
              className="rounded-2xl rounded-bl-sm px-4 py-3"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <TypingDots />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Quick Chips ── */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2 flex-shrink-0">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip.label}
                id={`quick-chip-${chip.label.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => sendMessage(chip.label)}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                style={{
                  background: "rgba(15,82,56,0.3)",
                  border: "1px solid rgba(34,197,94,0.25)",
                  color: "#86efac",
                }}
              >
                <chip.icon size={12} />
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input Area ── */}
      <div
        className="px-4 py-3 flex-shrink-0 border-t border-white/10"
        style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)" }}
      >
        <div
          className="flex items-end gap-2 rounded-2xl px-4 py-2"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <textarea
            ref={inputRef}
            id="ai-chat-input"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              // Auto-resize
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={handleKeyDown}
            placeholder="Tanya seputar meal plan, nutrisi, budget..."
            rows={1}
            disabled={isLoading}
            className="flex-1 bg-transparent text-white placeholder-white/30 text-sm resize-none outline-none py-1 max-h-[120px] overflow-y-auto"
            style={{ lineHeight: "1.5" }}
          />
          <button
            id="ai-chat-send-btn"
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
            style={
              input.trim() && !isLoading
                ? {
                    background: "linear-gradient(135deg, #0f5238, #22c55e)",
                    boxShadow: "0 4px 12px rgba(34,197,94,0.4)",
                  }
                : { background: "rgba(255,255,255,0.1)" }
            }
          >
            {isLoading ? (
              <Loader2 size={16} className="text-white animate-spin" />
            ) : (
              <Send size={16} className={input.trim() ? "text-white" : "text-white/40"} />
            )}
          </button>
        </div>
        <p className="text-center text-white/20 text-[10px] mt-2">
          MealIt AI hanya membahas topik seputar meal plan & nutrisi
        </p>
      </div>

      <style jsx global>{`
        @keyframes chatFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
