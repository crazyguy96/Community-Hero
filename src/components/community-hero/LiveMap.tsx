import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { MapPin, RefreshCw } from "lucide-react";
import { listCases, type CivicCase } from "@/lib/case-store";
import { CityTwin } from "./CityTwin";
import { RealMap } from "./RealMap";

const hasMapsKey = Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);

const severityColor: Record<CivicCase["severity"], string> = {
  Low: "#506680",
  Medium: "#F59E0B",
  High: "#C65D3B",
  Critical: "#C0392B",
};
const resolvedColor = "#2E7D32";

const legend = [
  { label: "Critical", color: severityColor.Critical },
  { label: "High", color: severityColor.High },
  { label: "Medium", color: severityColor.Medium },
  { label: "Low", color: severityColor.Low },
  { label: "Resolved", color: resolvedColor },
];

// Bounding box covering the seeded Delhi-NCR cases, used to project
// real lat/lng onto the 0-100 panel so pins reflect actual reported
// locations rather than fixed decorative coordinates.
const BOUNDS = { minLat: 28.4, maxLat: 28.62, minLng: 77.05, maxLng: 77.3 };

function project(lat: number, lng: number) {
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100;
  const y = 100 - ((lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100;
  return { x: Math.min(96, Math.max(4, x)), y: Math.min(94, Math.max(6, y)) };
}

export function LiveMap() {
  const [cases, setCases] = useState<CivicCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [hover, setHover] = useState<CivicCase | null>(null);
  const [selected, setSelected] = useState<CivicCase | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const result = await listCases();
      setCases(result.cases);
      setSelected((current) => current ?? result.cases[0] ?? null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    const iv = setInterval(refresh, 15000);
    return () => clearInterval(iv);
  }, []);

  const colorFor = (c: CivicCase) =>
    c.status === "Resolved" ? resolvedColor : severityColor[c.severity];

  return (
    <section id="livemap" className="relative py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="eyebrow">Section 02 · Live Map</span>
            <h2 className="font-display mt-3 text-4xl text-balance md:text-5xl">
              A command center view of every street.
            </h2>
            <p className="mt-4 max-w-2xl text-foreground/70">
              Pins are plotted from real reported coordinates on the live case board — not staged
              positions. Hover to inspect, click to open the case file.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {legend.map((l) => (
              <span key={l.label} className="chip">
                <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
                {l.label}
              </span>
            ))}
            <button
              onClick={refresh}
              className="chip cursor-pointer hover:border-primary"
              aria-label="Refresh map"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
          <div className="relative aspect-[16/11] overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-civic-soft/40 to-paper shadow-[var(--shadow-card)]">
            {hasMapsKey ? (
              <RealMap cases={cases} onSelect={setSelected} selectedId={selected?.id} />
            ) : (
              <>
                <div className="absolute inset-0 grid-paper opacity-80" />
                <svg
                  viewBox="0 0 100 70"
                  preserveAspectRatio="none"
                  className="absolute inset-0 h-full w-full"
                >
                  <path d="M0 22 L100 18" stroke="#506680" strokeOpacity="0.18" strokeWidth="0.6" />
                  <path d="M0 46 L100 50" stroke="#506680" strokeOpacity="0.18" strokeWidth="0.6" />
                  <path d="M28 0 L32 70" stroke="#506680" strokeOpacity="0.18" strokeWidth="0.6" />
                  <path d="M62 0 L58 70" stroke="#506680" strokeOpacity="0.18" strokeWidth="0.6" />
                  <path
                    d="M0 8 Q40 35 100 12"
                    stroke="#1F4D3A"
                    strokeOpacity="0.12"
                    strokeWidth="0.5"
                    fill="none"
                  />
                  <path
                    d="M0 60 Q50 30 100 65"
                    stroke="#1F4D3A"
                    strokeOpacity="0.12"
                    strokeWidth="0.5"
                    fill="none"
                  />
                </svg>

                <div className="pointer-events-none absolute inset-3 rounded-xl border border-primary/15" />
                <div className="absolute left-4 top-4 font-mono text-[10px] uppercase tracking-widest text-primary">
                  <span
                    className="inline-block h-1.5 w-1.5 translate-y-[-1px] rounded-full bg-terracotta align-middle"
                    style={{ animation: "pulse-dot 1.4s infinite" }}
                  />{" "}
                  Live · {cases.length} cases
                </div>
                <div className="absolute right-4 top-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Delhi NCR · live board
                </div>

                {cases.map((c) => {
                  const { x, y } = project(c.lat, c.lng);
                  return (
                    <button
                      key={c.id}
                      onMouseEnter={() => setHover(c)}
                      onMouseLeave={() => setHover(null)}
                      onClick={() => setSelected(c)}
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${x}%`, top: `${y}%` }}
                    >
                      <span className="relative grid place-items-center">
                        <span
                          className="absolute h-6 w-6 rounded-full opacity-30"
                          style={{ background: colorFor(c), animation: "pulse-dot 2s infinite" }}
                        />
                        <span
                          className="relative h-3 w-3 rounded-full ring-2 ring-paper"
                          style={{ background: colorFor(c) }}
                        />
                      </span>
                    </button>
                  );
                })}

                {hover && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pointer-events-none absolute z-10 w-56 -translate-x-1/2 -translate-y-[140%] rounded-lg border border-border bg-card/95 p-3 text-xs shadow-lg backdrop-blur"
                    style={{
                      left: `${project(hover.lat, hover.lng).x}%`,
                      top: `${project(hover.lat, hover.lng).y}%`,
                    }}
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      <span>{hover.id}</span>
                      <span style={{ color: colorFor(hover) }}>{hover.category}</span>
                    </div>
                    <div className="mt-1.5 font-medium">{hover.location}</div>
                    <div className="mt-0.5 text-muted-foreground">
                      Severity: {hover.severity} · {hover.status}
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>

          {selected && (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="card-elevated overflow-hidden"
            >
              <div className="border-b border-border bg-secondary/50 px-5 py-3">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  <span>Case File · {selected.id}</span>
                  <span style={{ color: colorFor(selected) }}>● {selected.status}</span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                  <span className="font-medium">{selected.location}</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  {[
                    ["Severity", selected.severity],
                    ["Department", selected.department],
                    ["Verifications", String(selected.verifications)],
                    ["Reported", new Date(selected.createdAt).toLocaleDateString()],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-md border border-border bg-paper/50 p-3">
                      <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                        {k}
                      </div>
                      <div className="mt-1 font-medium">{v}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-md border border-dashed border-primary/30 bg-civic-soft/30 p-4 text-xs">
                  <div className="eyebrow mb-2">Case description</div>
                  <p className="leading-relaxed text-foreground/80">{selected.description}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="mt-10">
          <div className="mb-5">
            <span className="eyebrow">Digital twin · same live board</span>
            <h3 className="font-display mt-2 text-2xl">The city, rendered.</h3>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              A stylised isometric view of the same cases above — hotspot count and colors are
              computed from real severities, not staged. The buildings are illustrative, not
              georeferenced.
            </p>
          </div>
          <CityTwin
            activeCount={cases.filter((c) => c.status !== "Resolved").length}
            resolvedCount={cases.filter((c) => c.status === "Resolved").length}
            hotspots={cases.slice(0, 8).map((c, i) => ({
              x: 1 + (i % 4) * 1.4,
              y: 1 + Math.floor(i / 4) * 2.4,
              color: colorFor(c),
              label: c.category,
            }))}
          />
        </div>
      </div>
    </section>
  );
}
