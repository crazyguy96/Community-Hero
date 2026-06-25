const stack = [
  { name: "Gemini AI", role: "Multimodal reasoning · vision · auto-complaints" },
  { name: "Google AI Studio", role: "Prompt engineering · evals · agent design" },
  { name: "Firebase", role: "Realtime DB · auth · serverless functions" },
  { name: "Google Maps", role: "Geocoding · routing · spatial intelligence" },
];

export function TechStack() {
  return (
    <section className="border-y border-border bg-card/60 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">Built On</span>
            <h2 className="font-display mt-3 text-3xl md:text-4xl">Google's intelligence stack.</h2>
          </div>
          <p className="max-w-md text-sm text-foreground/70">
            We don't reinvent infrastructure. We compose the most reliable AI platform on
            Earth into a product cities can trust.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stack.map((s) => (
            <div key={s.name} className="group rounded-xl border border-border bg-paper p-5 transition-all hover:border-primary hover:-translate-y-0.5">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground font-display">
                {s.name[0]}
              </div>
              <div className="mt-4 font-display text-lg">{s.name}</div>
              <div className="mt-1.5 text-xs text-foreground/65">{s.role}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
