# Community Hero — AI-Powered Civic Intelligence Platform

**The city is talking. Community Hero is listening.**

Community Hero is a civic-tech prototype that turns everyday problems — potholes, garbage
overflow, water leaks, streetlight outages — into tracked, accountable cases. Citizens submit
a photo and a short description; an AI co-pilot classifies the issue, assesses severity,
checks for duplicates, routes it to the responsible department, and drafts a formal complaint
— all before a human ever has to fill out a government form.

## ✨ Features

- **AI Investigation Engine** — a visual, agentic pipeline (vision classification → severity
  scoring → duplicate detection → authority routing → auto-drafted complaint → SLA tracking →
  resolution verification) that turns a raw report into an official case.
- **Civic Workbench** — a guided 3-step flow (Evidence → AI brief → Official filing) for
  citizens to submit and file real complaints.
- **Live Case Board** — cases are stored in Supabase (Postgres) with row-level security, so
  reports, verifications, and status changes are real and persisted, not staged demo data.
- **Community Verification** — five independent confirmations auto-advance a case from
  *Reported* to *Verified*, with the counter backed by the live database.
- **Live Map & Digital Twin** — a command-center map plotting real case coordinates, plus a
  stylized isometric "city twin" view colored by live severity data.
- **Government Pathways** — direct links into real official portals (CPGRAMS, MCD 311, UP
  Jansunwai, RTI Online) so a verified case can be filed where it actually counts.
- **Operations Feed & Case Files** — a live-streaming activity log and detailed per-case
  intelligence dossiers (AI summary, hazard score, cost estimate, resolution timeline).
- **Feedback Loop** — a lightweight in-product feedback widget so users can flag friction
  points directly.

## 🧱 Tech Stack

- **Frontend:** React 19, TanStack Start + TanStack Router, Tailwind CSS v4, Framer Motion,
  shadcn/ui (Radix primitives), Recharts
- **Backend:** Supabase (Postgres, Row Level Security, realtime)
- **AI:** Gemini (multimodal vision, severity reasoning, auto-complaint drafting)
- **Maps:** Google Maps (geocoding, routing, spatial intelligence)
- **Tooling:** Vite, TypeScript, ESLint, Prettier

## ⚠️ Disclaimer

Community Hero is an independent civic-assistance prototype built for demonstration purposes.
It is **not affiliated with or endorsed by any government body**. Links to official portals
(CPGRAMS, MCD, RTI Online, etc.) take users to real government sites; Community Hero stores
only the reference ID a user chooses to bring back.

## 🚀 Getting Started

\`\`\`bash
# install dependencies
npm install   # or bun install

# run the dev server
npm run dev

# build for production
npm run build
\`\`\`

You'll need a Supabase project (see \`supabase/migrations\`) and the relevant API keys
configured as environment variables.

---

*Built for the cities of tomorrow.*
