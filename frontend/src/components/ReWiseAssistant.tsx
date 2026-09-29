import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Bot, User, HelpCircle, ShieldAlert, ArrowRight } from "lucide-react";
import { api } from "../services/api";
import type { AssistantChatResponse } from "../types";

interface ReWiseAssistantProps {
  diagnosisId?: number;
  deviceContext?: {
    brand?: string;
    model?: string;
    issue?: string;
    recommendedAction?: string;
    repairCost?: number | null;
    resaleValue?: number | null;
  };
}

interface Message {
  sender: "user" | "assistant";
  text: string;
  sourceProvenance?: string;
  suggestedAction?: string;
  timestamp: string;
}

export const ReWiseAssistant: React.FC<ReWiseAssistantProps> = ({
  diagnosisId,
  deviceContext,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "assistant",
      text: `Hello! I'm your ReWise Circular Assistant. I have loaded your ${
        deviceContext?.brand ? `${deviceContext.brand} ${deviceContext.model || ""}` : "device"
      } diagnostic results. Ask me about repair feasibility, trade-in economics, repurpose ideas, or recycling regulations.`,
      sourceProvenance: "ReWise Multi-Source Diagnostic Knowledgebase",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    "Is it worth repairing or should I resell?",
    "Can I reuse this phone as a webcam or smart display?",
    "Why can't internal damage be confirmed remotely?",
    "How are the CO₂e carbon savings calculated?",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input.trim();
    if (!textToSend || loading) return;

    const userMsg: Message = {
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput("");
    setLoading(true);

    try {
      const response: AssistantChatResponse = await api.chatWithAssistant(
        textToSend,
        diagnosisId,
        deviceContext
      );

      const assistantMsg: Message = {
        sender: "assistant",
        text: response.reply,
        sourceProvenance: response.source_provenance,
        suggestedAction: response.suggested_action,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: "I could not connect to the diagnostic assistant server. Please check your backend connection.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-eco rounded-3xl border border-white/5 bg-[#090d0b] overflow-hidden flex flex-col h-[520px] shadow-2xl">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-white/5 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#f4f6f4]">ReWise Contextual AI Assistant</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px]">
                Grounded
              </span>
            </div>
            <p className="text-[11px] text-[#93a299] font-mono">
              Empirical repairability, trade-in schedules & CPCB compliance
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-[#93a299] font-mono">
          <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Zero pricing hallucinations</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs font-mono">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.sender === "assistant" && (
              <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-4 space-y-2 ${
                msg.sender === "user"
                  ? "bg-emerald-500 text-slate-950 font-sans font-medium ml-auto"
                  : "bg-black/60 border border-white/5 text-[#f4f6f4] font-sans"
              }`}
            >
              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

              {msg.suggestedAction && (
                <div className="pt-2 border-t border-white/10 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 font-mono">
                  <ArrowRight className="w-3 h-3" />
                  <span>Suggested Next Step: {msg.suggestedAction}</span>
                </div>
              )}

              {msg.sourceProvenance && (
                <div className="text-[10px] text-[#93a299] font-mono pt-1">
                  Source: {msg.sourceProvenance}
                </div>
              )}

              <div
                className={`text-[9px] font-mono ${
                  msg.sender === "user" ? "text-slate-950/70" : "text-[#93a299]"
                } text-right`}
              >
                {msg.timestamp}
              </div>
            </div>

            {msg.sender === "user" && (
              <div className="w-7 h-7 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#f4f6f4] shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start items-center text-[#93a299]">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Bot className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="p-3 rounded-2xl bg-black/60 border border-white/5 text-xs text-[#93a299] font-mono flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Analyzing grounded repair & circular evidence...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Inquiries */}
      <div className="px-4 py-2 bg-black/40 border-t border-white/5 overflow-x-auto flex gap-2">
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={loading}
            className="px-2.5 py-1 rounded-xl bg-black/60 hover:bg-white/5 border border-white/10 text-[11px] font-mono text-[#93a299] hover:text-emerald-300 transition-colors whitespace-nowrap flex items-center gap-1.5 shrink-0"
          >
            <HelpCircle className="w-3 h-3 text-emerald-400" />
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3.5 bg-black/80 border-t border-white/5 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Ask a question about your device diagnosis or circular options..."
          className="flex-1 bg-black/60 border border-white/10 rounded-2xl px-4 py-3 text-xs text-[#f4f6f4] placeholder-[#93a299] focus:outline-none focus:border-emerald-500/60 font-mono"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="p-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 transition-colors shadow-md shadow-emerald-500/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
