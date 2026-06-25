import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/community-hero/Nav";
import { Hero } from "@/components/community-hero/Hero";
import { Metrics } from "@/components/community-hero/Metrics";
import { LiveMap } from "@/components/community-hero/LiveMap";
import { AIEngine } from "@/components/community-hero/AIEngine";
import { CaseFeed } from "@/components/community-hero/CaseFeed";
import { CaseFile } from "@/components/community-hero/CaseFile";
import { Impact } from "@/components/community-hero/Impact";
import { TechStack } from "@/components/community-hero/TechStack";
import { CityCommandAI } from "@/components/community-hero/CityCommandAI";
import { Footer } from "@/components/community-hero/Footer";
import { CivicWorkbench } from "@/components/community-hero/CivicWorkbench";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Community Hero — AI-Powered Civic Intelligence Platform" },
      {
        name: "description",
        content:
          "Citizens report civic issues. Gemini AI verifies, prioritizes and routes them. A living digital twin of your city.",
      },
      { property: "og:title", content: "Community Hero — AI Civic Intelligence" },
      {
        property: "og:description",
        content: "The operating system for civic infrastructure, powered by Gemini AI.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <CivicWorkbench />
      <Metrics />
      <LiveMap />
      <AIEngine />
      <CaseFeed />
      <CaseFile />
      <Impact />
      <TechStack />
      <Footer />
      <CityCommandAI />
    </main>
  );
}
