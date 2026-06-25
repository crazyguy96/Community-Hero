import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const template = [
  { tag: "REPORT", text: "New pothole reported · MG Road", color: "text-terracotta" },
  { tag: "AI", text: "Gemini verified · severity HIGH", color: "text-primary" },
  { tag: "SCAN", text: "Duplicate scan completed · 0 matches", color: "text-slate-blue" },
  { tag: "ROUTE", text: "Authority assigned · PWD Zone 4", color: "text-foreground" },
  { tag: "DRAFT", text: "Complaint #C-48201 generated", color: "text-foreground" },
  { tag: "TRACK", text: "SLA timer started · 72h", color: "text-warning" },
  { tag: "UPDATE", text: "Crew dispatched · ETA 41 min", color: "text-slate-blue" },
  { tag: "CITIZEN", text: "Repair confirmed by 4 citizens", color: "text-success" },
  { tag: "CLOSED", text: "Case CH-4012 resolved & verified", color: "text-success" },
  { tag: "REPORT", text: "Garbage overflow · Block C Market", color: "text-warning" },
  { tag: "AI", text: "Vision flagged biohazard risk", color: "text-terracotta" },
];

export function CaseFeed() {
  const [events, setEvents] = useState(
    template.slice(0, 6).map((e, i) => ({ ...e, id: i, time: staticTime(i) })),
  );

  useEffect(() => {
    const iv = setInterval(() => {
      setEvents((prev) => {
        const next = template[(prev[0].id + 1) % template.length];
        return [{ ...next, id: prev[0].id + 1, time: t(0) }, ...prev].slice(0, 7);
      });
    }, 2200);
    return () => clearInterval(iv);
  }, []);

  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center">
          <div>
            <span className="eyebrow">Section 04 · Operations</span>
            <h2 className="font-display mt-3 text-4xl text-balance md:text-5xl">
              The city, live.
              <br />
              In real time.
            </h2>
            <p className="mt-5 max-w-md text-foreground/70">
              An always-on intelligence feed. Every report, every AI inference, every citizen
              confirmation streams through the operations panel.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                ["428", "events / hr"],
                ["18ms", "median latency"],
                ["99.97%", "uptime"],
              ].map(([v, l]) => (
                <div key={l} className="rounded-lg border border-border bg-card p-3">
                  <div className="font-display text-xl">{v}</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-elevated overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-secondary/50 px-5 py-3">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-success" style={{ animation: "pulse-dot 1.6s infinite" }} />
                Live Intelligence Feed · /var/log/ops
              </div>
              <div className="font-mono text-[10px] text-muted-foreground">streaming</div>
            </div>
            <div className="relative h-[420px] overflow-hidden">
              <AnimatePresence initial={false}>
                {events.map((e, i) => (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1 - i * 0.12, y: 0, height: 60 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-4 border-b border-border/70 px-5"
                  >
                    <span className="font-mono text-[10px] text-muted-foreground">{e.time}</span>
                    <span className={`font-mono text-[10px] font-semibold uppercase tracking-widest ${e.color}`}>
                      [{e.tag}]
                    </span>
                    <span className="text-sm">{e.text}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function t(offsetSec: number) {
  const d = new Date(Date.now() + offsetSec * 1000);
  return d.toTimeString().slice(0, 5);
}

function staticTime(i: number) {
  const base = 16 * 60 + 4;
  const m = base - i * 3;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}
