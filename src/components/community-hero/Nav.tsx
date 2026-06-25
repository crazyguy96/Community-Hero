import { motion } from "framer-motion";

export function Nav() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 z-50 w-full"
    >
      <div className="mx-auto mt-4 flex max-w-7xl items-center justify-between rounded-full border border-border bg-paper/70 px-5 py-2.5 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="relative grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
            <span className="font-display text-sm">CH</span>
            <span
              className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-terracotta"
              style={{ animation: "pulse-dot 1.8s ease-in-out infinite" }}
            />
          </div>
          <span className="font-display text-base tracking-tight">Community Hero</span>
          <span className="ml-2 hidden font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:inline">
            City OS · v4.2
          </span>
        </div>
        <div className="hidden items-center gap-7 md:flex">
          {[
            ["Report", "#report"],
            ["Track", "#track"],
            ["Gov portals", "#government"],
            ["Live map", "#livemap"],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-sm text-foreground/80 transition-colors hover:text-primary"
            >
              {label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button className="hidden rounded-full border border-border px-3.5 py-1.5 text-xs font-medium md:block">
            Authority Login
          </button>
          <a
            href="#report"
            className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
          >
            Report Issue
          </a>
        </div>
      </div>
    </motion.nav>
  );
}
