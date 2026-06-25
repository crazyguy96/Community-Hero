import { motion } from "framer-motion";
import { useState } from "react";

const nodes = [
  { id: "report", label: "Citizen Report", x: 8, y: 50, detail: "Photo, GPS, voice note ingested in <300ms.", icon: "📸" },
  { id: "vision", label: "Gemini Vision", x: 22, y: 22, detail: "Multimodal model classifies hazard type & extent.", icon: "👁" },
  { id: "severity", label: "Severity AI", x: 38, y: 50, detail: "Scores risk from traffic, density, weather context.", icon: "⚖" },
  { id: "dedupe", label: "Duplicate Scan", x: 22, y: 78, detail: "Vector search across 1.2M historical cases.", icon: "🔁" },
  { id: "route", label: "Authority Mapping", x: 56, y: 28, detail: "Routes to the responsible municipal department.", icon: "🧭" },
  { id: "complaint", label: "Auto-Complaint", x: 72, y: 50, detail: "Drafts formal complaint w/ legal references.", icon: "📨" },
  { id: "track", label: "Live Tracking", x: 56, y: 72, detail: "SLA timer, citizen notifications, escalation.", icon: "⏱" },
  { id: "verify", label: "Resolution Verify", x: 90, y: 50, detail: "Re-inspection prompt + photo diff confirms fix.", icon: "✅" },
];

const edges: [string, string][] = [
  ["report", "vision"], ["vision", "severity"], ["report", "dedupe"], ["dedupe", "severity"],
  ["severity", "route"], ["route", "complaint"], ["complaint", "track"], ["track", "verify"], ["severity", "track"],
];

export function AIEngine() {
  const [hovered, setHovered] = useState<string | null>("vision");
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const active = hovered ? nodeMap[hovered] : null;

  return (
    <section id="aiengine" className="relative bg-card/40 py-28">
      <div className="absolute inset-0 grid-paper opacity-40" />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-12 max-w-3xl">
          <span className="eyebrow">Section 03 · Investigation Engine</span>
          <h2 className="font-display mt-3 text-4xl text-balance md:text-5xl">
            Watch Gemini think through every report.
          </h2>
          <p className="mt-4 text-foreground/70">
            A living neural workflow. Each node is an agentic step — verifiable, observable,
            auditable. Hover any node to read the AI's reasoning.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-paper shadow-[var(--shadow-card)]">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
              {edges.map(([a, b], i) => {
                const A = nodeMap[a], B = nodeMap[b];
                const isActive = hovered === a || hovered === b;
                return (
                  <g key={i}>
                    <line
                      x1={A.x} y1={A.y} x2={B.x} y2={B.y}
                      stroke={isActive ? "#1F4D3A" : "#506680"}
                      strokeOpacity={isActive ? 0.9 : 0.25}
                      strokeWidth="0.25"
                    />
                    <circle r="0.7" fill="#C65D3B">
                      <animateMotion
                        dur={`${3 + (i % 3)}s`}
                        repeatCount="indefinite"
                        path={`M${A.x},${A.y} L${B.x},${B.y}`}
                      />
                    </circle>
                  </g>
                );
              })}
            </svg>

            {nodes.map((n) => {
              const isActive = hovered === n.id;
              return (
                <button
                  key={n.id}
                  onMouseEnter={() => setHovered(n.id)}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${n.x}%`, top: `${n.y}%` }}
                >
                  <div className="relative">
                    <span
                      className="absolute inset-0 -m-2 rounded-full"
                      style={{
                        background: "radial-gradient(circle, oklch(0.36 0.06 156 / 0.25), transparent 70%)",
                        animation: isActive ? "pulse-dot 1.8s infinite" : undefined,
                      }}
                    />
                    <span
                      className={`relative grid h-11 w-11 place-items-center rounded-full border text-base transition-all ${
                        isActive ? "border-primary bg-primary text-primary-foreground scale-110" : "border-border bg-card"
                      }`}
                    >
                      {n.icon}
                    </span>
                    <span className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-widest text-foreground/70">
                      {n.label}
                    </span>
                  </div>
                </button>
              );
            })}

            <div className="absolute left-4 top-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              gemini-2.5-pro · agentic graph
            </div>
            <div className="absolute right-4 top-4 font-mono text-[10px] uppercase tracking-widest text-success">
              ● online · 18ms
            </div>
          </div>

          <motion.div
            key={active?.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-elevated flex flex-col p-6"
          >
            <span className="eyebrow">AI Reasoning</span>
            <h3 className="font-display mt-3 text-2xl">{active?.label}</h3>
            <p className="mt-4 text-sm leading-relaxed text-foreground/75">{active?.detail}</p>

            <div className="mt-6 space-y-3 rounded-lg border border-border bg-paper/70 p-4 font-mono text-[11px]">
              <div className="flex justify-between"><span className="text-muted-foreground">model</span><span>gemini-2.5-pro</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">tokens</span><span>4,182</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">latency</span><span>312ms</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">confidence</span><span className="text-success">94.2%</span></div>
            </div>

            <div className="mt-auto pt-6">
              <div className="rounded-md border border-dashed border-primary/30 bg-civic-soft/40 p-3 text-xs leading-relaxed text-foreground/80">
                "Detected longitudinal asphalt fracture w/ pooling water. Severity escalated due to NH-48 arterial classification."
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
