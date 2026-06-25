import { motion } from "framer-motion";
import { useMemo } from "react";

type Hotspot = { x: number; y: number; color: string; label: string };

/**
 * Isometric "digital twin" rendered as SVG.
 * Buildings rise, roads glow, hotspots pulse — premium feel without 3D weight.
 *
 * The grid/buildings are stylised (not georeferenced), but the hotspot count,
 * colors and the active/resolved label are driven by the real live case
 * board passed in via props, so the visual reflects actual report data
 * rather than a fixed decorative scene.
 */
export function CityTwin({
  activeCount = 4,
  resolvedCount = 1,
  hotspots: hotspotInput = [
    { x: 1.5, y: 2, color: "#C65D3B", label: "Pothole" },
    { x: 3.2, y: 4.1, color: "#F59E0B", label: "Garbage" },
    { x: 4.5, y: 1.4, color: "#506680", label: "Streetlight" },
    { x: 2.6, y: 5.2, color: "#2E7D32", label: "Resolved" },
  ],
}: {
  activeCount?: number;
  resolvedCount?: number;
  hotspots?: Hotspot[];
}) {
  const buildings = useMemo(() => {
    // Deterministic pseudo-random so SSR matches client (no hydration mismatch)
    const out: { x: number; y: number; w: number; d: number; h: number; tone: string }[] = [];
    const tones = ["#1F4D3A", "#234e3c", "#2c5a48", "#3a6c57"];
    let s = 9301;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 6; col++) {
        if (rand() < 0.25) continue;
        const h = 18 + rand() * 70;
        out.push({
          x: col,
          y: row,
          w: 38,
          d: 38,
          h,
          tone: tones[Math.floor(rand() * tones.length)],
        });
      }
    }
    return out;
  }, []);

  const hotspots = hotspotInput.length > 0 ? hotspotInput.slice(0, 8) : [];

  const project = (cx: number, cy: number) => {
    // Isometric projection
    const tile = 52;
    const px = (cx - cy) * tile * 0.86;
    const py = (cx + cy) * tile * 0.5;
    return { px, py };
  };

  return (
    <div className="relative aspect-[5/4] w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-civic-soft/50 via-paper to-paper shadow-[var(--shadow-elevated)]">
      {/* HUD frame */}
      <div className="pointer-events-none absolute inset-3 z-10 rounded-xl border border-primary/15" />
      <div className="absolute left-4 top-4 z-20 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-primary">
        <span
          className="h-1.5 w-1.5 rounded-full bg-terracotta"
          style={{ animation: "pulse-dot 1.4s infinite" }}
        />
        Digital Twin · Sector 12
      </div>
      <div className="absolute right-4 top-4 z-20 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        28.61°N · 77.20°E
      </div>
      <div className="absolute bottom-4 left-4 z-20 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {activeCount} active · {resolvedCount} resolved
      </div>

      <svg viewBox="-280 -40 560 460" className="absolute inset-0 h-full w-full">
        {/* ground grid */}
        <g opacity="0.5">
          {Array.from({ length: 8 }).map((_, i) => {
            const a = project(i, 0);
            const b = project(i, 7);
            return (
              <line
                key={`gx${i}`}
                x1={a.px}
                y1={a.py}
                x2={b.px}
                y2={b.py}
                stroke="#1F4D3A"
                strokeOpacity="0.12"
              />
            );
          })}
          {Array.from({ length: 8 }).map((_, i) => {
            const a = project(0, i);
            const b = project(7, i);
            return (
              <line
                key={`gy${i}`}
                x1={a.px}
                y1={a.py}
                x2={b.px}
                y2={b.py}
                stroke="#1F4D3A"
                strokeOpacity="0.12"
              />
            );
          })}
        </g>

        {/* glowing roads */}
        <g>
          {[2, 5].map((r) => {
            const a = project(0, r);
            const b = project(7, r);
            return (
              <line
                key={`rh${r}`}
                x1={a.px}
                y1={a.py}
                x2={b.px}
                y2={b.py}
                stroke="#506680"
                strokeWidth="6"
                strokeOpacity="0.18"
                strokeLinecap="round"
              />
            );
          })}
          {[2, 4].map((c) => {
            const a = project(c, 0);
            const b = project(c, 7);
            return (
              <line
                key={`rv${c}`}
                x1={a.px}
                y1={a.py}
                x2={b.px}
                y2={b.py}
                stroke="#506680"
                strokeWidth="6"
                strokeOpacity="0.18"
                strokeLinecap="round"
              />
            );
          })}
        </g>

        {/* traffic particles */}
        {[0, 1, 2].map((i) => (
          <motion.circle
            key={`tp${i}`}
            r="2.5"
            fill="#F59E0B"
            initial={false}
            animate={{
              cx: [project(0, 2).px, project(7, 2).px],
              cy: [project(0, 2).py, project(7, 2).py],
            }}
            transition={{ duration: 6 + i, repeat: Infinity, ease: "linear", delay: i * 1.5 }}
          />
        ))}

        {/* Buildings */}
        {buildings.map((b, i) => {
          const base = project(b.x, b.y);
          const tileW = 52 * 0.86;
          const tileH = 52 * 0.5;
          const top = { x: base.px, y: base.py - b.h };
          const leftTop = { x: base.px - tileW, y: base.py - tileH - b.h };
          const rightTop = { x: base.px + tileW, y: base.py - tileH - b.h };
          const backTop = { x: base.px, y: base.py - tileH * 2 - b.h };
          const leftBase = { x: base.px - tileW, y: base.py - tileH };
          const rightBase = { x: base.px + tileW, y: base.py - tileH };
          return (
            <motion.g
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.02, duration: 0.6, ease: "easeOut" }}
            >
              {/* left face */}
              <polygon
                points={`${leftBase.x},${leftBase.y} ${base.px},${base.py} ${top.x},${top.y} ${leftTop.x},${leftTop.y}`}
                fill={b.tone}
                opacity="0.78"
              />
              {/* right face */}
              <polygon
                points={`${rightBase.x},${rightBase.y} ${base.px},${base.py} ${top.x},${top.y} ${rightTop.x},${rightTop.y}`}
                fill={b.tone}
                opacity="0.92"
              />
              {/* top */}
              <polygon
                points={`${top.x},${top.y} ${leftTop.x},${leftTop.y} ${backTop.x},${backTop.y} ${rightTop.x},${rightTop.y}`}
                fill="#F7F4ED"
                opacity="0.95"
              />
              {/* window */}
              <line
                x1={top.x}
                y1={top.y + 6}
                x2={top.x}
                y2={base.py - 4}
                stroke="#F7F4ED"
                strokeOpacity="0.2"
                strokeWidth="1"
              />
            </motion.g>
          );
        })}

        {/* Hotspots */}
        {hotspots.map((h, i) => {
          const p = project(h.x, h.y);
          return (
            <g key={i}>
              <circle cx={p.px} cy={p.py - 8} r="10" fill={h.color} opacity="0.18">
                <animate
                  attributeName="r"
                  values="6;18;6"
                  dur="2.2s"
                  repeatCount="indefinite"
                  begin={`${i * 0.4}s`}
                />
                <animate
                  attributeName="opacity"
                  values="0.35;0;0.35"
                  dur="2.2s"
                  repeatCount="indefinite"
                  begin={`${i * 0.4}s`}
                />
              </circle>
              <circle cx={p.px} cy={p.py - 8} r="4" fill={h.color} />
              <circle cx={p.px} cy={p.py - 8} r="1.5" fill="#F7F4ED" />
            </g>
          );
        })}
      </svg>

      {/* scanline */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        initial={{ top: "10%" }}
        animate={{ top: ["10%", "90%", "10%"] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
