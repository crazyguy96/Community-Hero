import { motion } from "framer-motion";
import { CityTwin } from "./CityTwin";
import { ArrowRight, Play } from "lucide-react";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-32 pb-24">
      <div className="absolute inset-0 grid-paper opacity-60" />
      <div className="absolute inset-x-0 top-0 h-[600px] bg-gradient-to-b from-transparent via-paper/0 to-paper" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="chip"
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-terracotta"
              style={{ animation: "pulse-dot 1.6s infinite" }}
            />
            Live · 24,182 signals from the city
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="font-display mt-6 text-5xl leading-[0.95] sm:text-6xl lg:text-[5.4rem]"
          >
            The city is talking.
            <br />
            <span className="text-primary">Community Hero</span>
            <br />
            is listening.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-7 max-w-xl text-lg leading-relaxed text-foreground/75"
          >
            Report potholes, broken roads, garbage dumps, water leaks and streetlight failures.
            Gemini AI verifies, prioritizes, routes and tracks every issue — automatically.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <a
              href="#report"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_-12px_oklch(0.36_0.06_156/0.6)] transition-all hover:-translate-y-0.5"
            >
              Report Issue
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#track"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-secondary"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Track a live case
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-12 flex items-center gap-6 border-t border-border pt-6 font-mono text-[11px] uppercase tracking-widest text-muted-foreground"
          >
            <span>Powered by</span>
            <span className="text-foreground">Gemini AI</span>
            <span className="text-foreground/40">·</span>
            <span className="text-foreground">Google Maps</span>
            <span className="text-foreground/40">·</span>
            <span className="text-foreground">Firebase</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative"
        >
          <CityTwin />
        </motion.div>
      </div>
    </section>
  );
}
