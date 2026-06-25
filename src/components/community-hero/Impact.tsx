import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";

function HealingDot({ x, y, healing, warm }: { x: number; y: number; healing: MotionValue<number>; warm: boolean }) {
  const bg = useTransform(healing, [0, 1], [warm ? "#C65D3B" : "#F59E0B", "#2E7D32"]);
  const shadow = useTransform(healing, [0, 1], ["0 0 0 0 rgba(0,0,0,0)", "0 0 14px 0 rgba(46,125,50,0.45)"]);
  return (
    <motion.span
      className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{ left: `${x}%`, top: `${y}%`, background: bg, boxShadow: shadow }}
    />
  );
}

export function Impact() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const healing = useTransform(scrollYProgress, [0.1, 0.9], [0, 1]);
  const overlay = useTransform(
    healing,
    [0, 1],
    [
      "radial-gradient(circle at 50% 50%, rgba(198,93,59,0.18), transparent 65%)",
      "radial-gradient(circle at 50% 50%, rgba(46,125,50,0.2), transparent 65%)",
    ],
  );
  const score = useTransform(healing, (v) => (62 + v * 26).toFixed(0));
  const scoreWidth = useTransform(healing, (v) => `${62 + v * 26}%`);

  const dots = Array.from({ length: 60 }).map((_, i) => ({
    x: (i * 37) % 100,
    y: (i * 53) % 100,
    warm: (i * 13) % 100 < 60,
  }));

  return (
    <section id="impact" ref={ref} className="relative py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 max-w-3xl">
          <span className="eyebrow">Section 06 · Impact</span>
          <h2 className="font-display mt-3 text-4xl text-balance md:text-5xl">
            A city, healing in real time.
          </h2>
          <p className="mt-4 text-foreground/70">
            Scroll. Watch red zones become green. Every dot is someone's commute, someone's
            evening walk, someone's safer street.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="relative aspect-[16/11] overflow-hidden rounded-2xl border border-border bg-paper shadow-[var(--shadow-card)]">
            <div className="absolute inset-0 grid-paper opacity-60" />
            {dots.map((d, i) => (
              <HealingDot key={i} x={d.x} y={d.y} warm={d.warm} healing={healing} />
            ))}
            <motion.div className="absolute inset-0" style={{ background: overlay }} />
            <div className="absolute bottom-4 left-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              City Health Index · scroll to advance
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 self-center">
            {[
              { v: "24,000+", l: "Issues Reported" },
              { v: "18,000+", l: "Issues Resolved" },
              { v: "4.2M", l: "Citizens Impacted" },
              { v: "91%", l: "AI Accuracy" },
            ].map((s, i) => (
              <motion.div
                key={s.l}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="card-elevated p-5"
              >
                <div className="font-display text-3xl text-primary">{s.v}</div>
                <div className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {s.l}
                </div>
              </motion.div>
            ))}
            <div className="card-elevated col-span-2 p-5">
              <div className="eyebrow mb-2">City Health Score</div>
              <div className="flex items-end gap-3">
                <span className="font-display text-5xl text-success">
                  <motion.span>{score}</motion.span>
                </span>
                <span className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  / 100 · last 30 days
                </span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                <motion.div className="h-full bg-success" style={{ width: scoreWidth }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
