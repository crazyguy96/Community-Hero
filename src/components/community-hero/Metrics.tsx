import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";

function Counter({ value, suffix = "", decimals = 0 }: { value: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => v.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ","));

  useEffect(() => {
    if (inView) {
      const controls = animate(count, value, { duration: 2.2, ease: [0.16, 1, 0.3, 1] });
      return controls.stop;
    }
  }, [inView, value, count]);

  return (
    <span ref={ref} className="font-display tabular-nums">
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

const stats = [
  { value: 24182, label: "Issues Reported", tone: "text-foreground" },
  { value: 17301, label: "Issues Resolved", tone: "text-success" },
  { value: 91, suffix: "%", label: "Verification Accuracy", tone: "text-primary" },
  { value: 312, label: "Authorities Connected", tone: "text-foreground" },
  { value: 4.2, decimals: 1, suffix: "M", label: "Citizens Impacted", tone: "text-terracotta" },
];

export function Metrics() {
  return (
    <section className="relative border-y border-border bg-card/60">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-8 flex items-center justify-between">
          <span className="eyebrow">Live · City Pulse</span>
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Updated 4 seconds ago
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-5">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="border-l border-border/80 pl-5"
            >
              <div className={`text-4xl leading-none md:text-5xl ${s.tone}`}>
                <Counter value={s.value} suffix={s.suffix ?? ""} decimals={s.decimals ?? 0} />
              </div>
              <div className="mt-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
