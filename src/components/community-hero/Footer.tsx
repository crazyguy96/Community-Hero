export function Footer() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-paper text-primary font-display">CH</div>
            <span className="font-display text-lg">Community Hero</span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-primary-foreground/75">
            The operating system for civic infrastructure. Citizens report. AI investigates.
            Authorities resolve. Cities improve.
          </p>
          <div className="mt-6 font-mono text-[10px] uppercase tracking-widest text-primary-foreground/60">
            Built with Gemini · Firebase · Google Maps
          </div>
        </div>
        {[
          ["Product", ["Live Map", "AI Engine", "Case Files", "Impact"]],
          ["Cities", ["For Mayors", "For PWD", "For Citizens", "API Access"]],
          ["Company", ["About", "Press", "Careers", "Contact"]],
        ].map(([title, items]) => (
          <div key={title as string}>
            <div className="font-mono text-[10px] uppercase tracking-widest text-primary-foreground/60">{title as string}</div>
            <ul className="mt-4 space-y-2 text-sm">
              {(items as string[]).map((i) => (
                <li key={i}><a className="hover:underline" href="#">{i}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-primary-foreground/60 md:flex-row md:items-center">
          <span>© 2026 Community Hero · all systems operational</span>
          <span>Made for the cities of tomorrow.</span>
        </div>
      </div>
    </footer>
  );
}
