import { motion } from "framer-motion";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";

const timeline = [
  { time: "T+0min", label: "Citizen submitted report", state: "done", icon: CheckCircle2 },
  { time: "T+1min", label: "Gemini verified · 94% confidence", state: "done", icon: CheckCircle2 },
  { time: "T+2min", label: "Routed to PWD Zone 4", state: "done", icon: CheckCircle2 },
  { time: "T+8min", label: "Complaint #C-48201 generated", state: "done", icon: CheckCircle2 },
  { time: "T+41min", label: "Crew dispatched", state: "active", icon: Clock },
  { time: "T+3h", label: "Field inspection scheduled", state: "pending", icon: AlertTriangle },
];

export function CaseFile() {
  return (
    <section id="casefiles" className="relative bg-civic-soft/40 py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 max-w-2xl">
          <span className="eyebrow">Section 05 · Case File</span>
          <h2 className="font-display mt-3 text-4xl text-balance md:text-5xl">
            Every issue, an intelligence dossier.
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="card-elevated overflow-hidden"
        >
          {/* Header bar */}
          <div className="grid grid-cols-1 gap-4 border-b border-border bg-paper px-6 py-5 md:grid-cols-[2fr_1fr_1fr_1fr] md:items-center">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">CH-4012</span>
                <span className="rounded-full bg-terracotta/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-terracotta">High Severity</span>
              </div>
              <h3 className="font-display mt-2 text-2xl">Asphalt failure · MG Road, Sector 14</h3>
            </div>
            {[
              ["Status", "Investigating"],
              ["Confidence", "94.2%"],
              ["SLA Remaining", "67h 12m"],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{k}</div>
                <div className="font-display text-lg">{v}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_1fr_1fr]">
            {/* Photo evidence */}
            <div>
              <div className="eyebrow mb-3">Photo Evidence</div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-gradient-to-br from-slate-blue/40 to-civic">
                <svg viewBox="0 0 200 150" className="absolute inset-0 h-full w-full">
                  <rect width="200" height="150" fill="#506680" />
                  <ellipse cx="100" cy="95" rx="55" ry="22" fill="#222" opacity="0.9" />
                  <ellipse cx="100" cy="93" rx="48" ry="18" fill="#1a1a1a" />
                  <ellipse cx="90" cy="89" rx="14" ry="6" fill="#000" />
                  <ellipse cx="115" cy="96" rx="9" ry="4" fill="#000" />
                  {/* AI bbox */}
                  <rect x="40" y="70" width="120" height="55" fill="none" stroke="#C65D3B" strokeWidth="1.2" strokeDasharray="3 2" />
                  <text x="42" y="68" fill="#C65D3B" fontSize="6" fontFamily="JetBrains Mono">pothole 0.94</text>
                </svg>
                <div className="absolute bottom-2 left-2 font-mono text-[10px] text-paper/80">IMG_4192.jpg · 2.1 MB</div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-square rounded-md border border-border bg-secondary/60" />
                ))}
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-3 self-start">
              {[
                ["Category", "Road Damage"],
                ["Location", "28.61°N, 77.20°E"],
                ["Reported", "16:04 · today"],
                ["Reporter", "Verified citizen"],
                ["Authority", "PWD Zone 4"],
                ["Est. Cost", "₹ 48,000"],
                ["Daily Impact", "1,420 commuters"],
                ["Hazard Score", "8.4 / 10"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-md border border-border bg-paper p-3">
                  <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{k}</div>
                  <div className="mt-1 text-sm font-medium">{v}</div>
                </div>
              ))}
            </div>

            {/* AI summary + community */}
            <div className="space-y-4">
              <div className="rounded-lg border border-dashed border-primary/30 bg-card p-4">
                <div className="eyebrow mb-2">Gemini AI Summary</div>
                <p className="text-sm leading-relaxed text-foreground/80">
                  Structural failure detected on arterial road. Cross-correlated with 3 prior
                  reports (CH-3201, CH-3104, CH-2987) suggesting recurring subgrade water
                  damage. Recommend full-depth patching, not surface repair.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="eyebrow mb-3">Community Validation</div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <Stat label="Confirmed" value="34" tone="text-success" />
                  <Stat label="Disputed" value="2" tone="text-terracotta" />
                  <Stat label="Trust" value="96%" tone="text-primary" />
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-success" style={{ width: "94%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="border-t border-border bg-paper/70 px-6 py-6">
            <div className="eyebrow mb-5">Resolution Timeline</div>
            <ol className="relative grid grid-cols-1 gap-y-4 md:grid-cols-6">
              {timeline.map((t, i) => {
                const Icon = t.icon;
                return (
                  <li key={i} className="flex flex-col items-start md:items-center md:text-center">
                    <div className="flex items-center gap-2 md:flex-col">
                      <span
                        className={`grid h-8 w-8 place-items-center rounded-full border ${
                          t.state === "done"
                            ? "border-success bg-success/10 text-success"
                            : t.state === "active"
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground md:mt-1.5">{t.time}</span>
                    </div>
                    <span className="mt-1.5 text-xs text-foreground/80 md:mt-2">{t.label}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div>
      <div className={`font-display text-2xl ${tone}`}>{value}</div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}
