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
    "Can I reuse this phone as a webcam or smart home display?",
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
    <div className="glass-panel rounded-3xl border border-slate-800 bg-slate-900/70 overflow-hidden flex flex-col h-[520px]">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">ReWise Circular Assistant</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px]">
                Active Context
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Grounded in empirical repairability and circular economy data
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">No fabricated specs</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
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
              className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 ${
                msg.sender === "user"
                  ? "bg-emerald-600 text-slate-950 font-medium ml-auto"
                  : "bg-slate-950 border border-slate-800 text-slate-200"
              }`}
            >
              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

              {msg.suggestedAction && (
                <div className="pt-2 border-t border-slate-800 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                  <ArrowRight className="w-3 h-3" />
                  <span>Suggested Next Step: {msg.suggestedAction}</span>
                </div>
              )}

              {msg.sourceProvenance && (
                <div className="text-[10px] text-slate-400 font-mono pt-1">
                  Source: {msg.sourceProvenance}
                </div>
              )}

              <div
                className={`text-[9px] ${
                  msg.sender === "user" ? "text-slate-900/70" : "text-slate-500"
                } text-right`}
              >
                {msg.timestamp}
              </div>
            </div>

            {msg.sender === "user" && (
              <div className="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start items-center text-slate-400">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Bot className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Analyzing grounded repair & circular evidence...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Inquiries */}
      <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-800/60 overflow-x-auto flex gap-2 no-scrollbar">
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={loading}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-emerald-300 transition-colors whitespace-nowrap flex items-center gap-1.5 shrink-0"
          >
            <HelpCircle className="w-3 h-3 text-emerald-400" />
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Ask a question about your device diagnosis or circular options..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 transition-colors shadow-md shadow-emerald-500/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
