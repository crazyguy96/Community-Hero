import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, User, X } from "lucide-react";
import { chatWithCivicAI } from "@/lib/civic-ai";

const prompts = [
  "Show unresolved potholes near me",
  "Generate ward report",
  "Predict future issue hotspots",
  "Find duplicate complaints",
  "Show highest priority issues",
  "Generate authority briefing",
];

export function CityCommandAI() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [live, setLive] = useState<boolean | null>(null);
  const [model, setModel] = useState("connecting");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([
    {
      role: "assistant",
      text: "Namaste. I can help you prepare evidence, choose an official portal, understand tracking and plan a responsible escalation. What civic issue are you working on?",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function send(text = input) {
    const message = text.trim();
    if (!message || sending) return;
    const history = messages.slice(-8);
    setMessages((current) => [...current, { role: "user", text: message }]);
    setInput("");
    setSending(true);
    try {
      const result = await chatWithCivicAI({ data: { message, history } });
      setMessages((current) => [...current, { role: "assistant", text: result.text }]);
      setLive(result.live);
      setModel(result.model);
    } catch {
      setMessages((current) => [
        ...current,
        { role: "assistant", text: "I could not reach the civic guide. Please try again in a moment." },
      ]);
      setLive(false);
      setModel("offline");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="absolute bottom-16 right-0 w-[360px] origin-bottom-right overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-elevated)]"
          >
            <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3 text-primary-foreground">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <div>
                  <div className="font-display text-sm leading-tight">City Command AI</div>
                  <div className="font-mono text-[9px] uppercase tracking-widest opacity-70">
                    {live === true ? `${model} · live` : live === false ? `${model}` : "secure server connection"}
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-white/10">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div ref={scrollRef} className="max-h-[360px] min-h-[300px] overflow-y-auto p-4">
              <div className="space-y-3">
                {messages.map((message, index) => (
                  <div key={`${message.role}-${index}`} className={`flex gap-2 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${message.role === "user" ? "bg-terracotta/10 text-terracotta" : "bg-civic-soft text-primary"}`}>
                      {message.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                    </span>
                    <div className={`max-w-[82%] whitespace-pre-wrap rounded-xl px-3 py-2.5 text-sm leading-relaxed ${message.role === "user" ? "bg-primary text-primary-foreground" : "border border-border bg-civic-soft/35"}`}>
                      {message.text}
                    </div>
                  </div>
                ))}
                {sending && <div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="h-2 w-2 animate-pulse rounded-full bg-primary" />Thinking through the civic pathway…</div>}
              </div>
              {messages.length === 1 && <div className="mt-5">
                <div className="eyebrow mb-2">Try asking</div>
                <div className="space-y-1.5">
                  {prompts.map((p) => (
                    <button
                      key={p}
                      onClick={() => void send(p)}
                      className="block w-full rounded-md border border-border bg-paper px-3 py-2 text-left text-xs transition-colors hover:border-primary hover:bg-secondary"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>}
            </div>
            <form onSubmit={(event) => { event.preventDefault(); void send(); }} className="flex items-center gap-2 border-t border-border bg-paper p-3">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask City Command AI…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <button type="submit" disabled={!input.trim() || sending} className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-40">
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((v) => !v)}
        className="group flex items-center gap-2.5 rounded-full bg-primary px-4 py-3 text-primary-foreground shadow-[var(--shadow-elevated)] transition-transform hover:-translate-y-0.5"
      >
        <span className="relative grid h-6 w-6 place-items-center">
          <span className="absolute inset-0 rounded-full bg-terracotta opacity-60" style={{ animation: "pulse-dot 2s infinite" }} />
          <Sparkles className="relative h-3.5 w-3.5" />
        </span>
        <span className="font-display text-sm tracking-tight">City Command AI</span>
      </button>
    </div>
  );
}
