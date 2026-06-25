import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ExternalLink,
  FileCheck2,
  FileText,
  Globe2,
  Heart,
  Lightbulb,
  Link2,
  MapPin,
  MessageSquareMore,
  Paperclip,
  Route,
  ShieldCheck,
  Sparkles,
  Star,
  Upload,
  Users,
  X,
  Zap,
} from "lucide-react";
import { analyzeCivicEvidence } from "@/lib/civic-ai";
import {
  findDuplicates,
  createCase,
  listCases,
  verifyCase,
  type CivicCase,
} from "@/lib/case-store";

type Analysis = {
  category: string;
  severity: string;
  department: string;
  confidence: number;
  summary: string;
};

type SavedReport = {
  id: string;
  reference: string;
  title: string;
  location: string;
  status: string;
  createdAt: string;
};

type Review = { rating: number; message: string; createdAt: string };

const portals = [
  {
    name: "CPGRAMS",
    scope: "Central & participating state authorities",
    detail: "File, track, remind and appeal using an official registration ID.",
    url: "https://www.pgportal.gov.in/",
    badge: "National",
  },
  {
    name: "MCD 311",
    scope: "Municipal Corporation of Delhi",
    detail: "Civic complaints for sanitation, roads, drains and municipal services.",
    url: "https://mcdonline.nic.in/",
    badge: "Delhi",
  },
  {
    name: "Jansunwai Samadhan",
    scope: "Government of Uttar Pradesh",
    detail: "Register, track, send reminders and give disposal feedback.",
    url: "https://jansunwai.up.nic.in/?language=en_US",
    badge: "Uttar Pradesh",
  },
  {
    name: "RTI Online",
    scope: "Central public authorities only",
    detail: "Seek information or file a first appeal when records are needed.",
    url: "https://www.rtionline.gov.in/",
    badge: "Escalation",
  },
];

const sampleCases = [
  {
    id: "CH-4012",
    reference: "DOPPW/E/2026/004821",
    title: "Dangerous pothole near school crossing",
    location: "MG Road · Ward 12, Delhi",
    status: "Awaiting authority action",
    age: "4 days open",
    progress: 58,
    tone: "bg-warning",
    recommendation: "Send an official reminder today",
    reason: "The acknowledgement window has passed and the case has 24 community verifications.",
  },
  {
    id: "CH-4007",
    reference: "MCD311-260619-1842",
    title: "Overflowing waste collection point",
    location: "Lajpat Nagar II · Ward 144",
    status: "Work order issued",
    age: "2 days open",
    progress: 78,
    tone: "bg-info",
    recommendation: "Wait for the promised site visit",
    reason: "A work order is active. Ask nearby citizens for after-work photo proof tomorrow.",
  },
  {
    id: "CH-3988",
    reference: "PGPORTAL/2026/009184",
    title: "Streetlights dark across two blocks",
    location: "Vasant Kunj · Sector B",
    status: "Resolved · verification pending",
    age: "Resolved today",
    progress: 92,
    tone: "bg-success",
    recommendation: "Verify the repair after sunset",
    reason:
      "The authority marked this resolved. One independent citizen check will close the evidence loop.",
  },
];

const demoAnalysis: Analysis = {
  category: "Road damage · pothole",
  severity: "High",
  department: "Municipal engineering / PWD",
  confidence: 94,
  summary:
    "Likely asphalt surface failure in an active traffic lane. The visible depth and proximity to pedestrians suggest elevated injury and vehicle-damage risk.",
};

function readStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function CivicWorkbench() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("MG Road, Ward 12, Delhi");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisMode, setAnalysisMode] = useState("guided demo");
  const [duplicates, setDuplicates] = useState<
    Array<{
      case: {
        id: string;
        category: string;
        location: string;
        status: string;
        verifications: number;
      };
      distanceKm: number;
    }>
  >([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [liveCases, setLiveCases] = useState<CivicCase[]>([]);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [justVerified, setJustVerified] = useState<string | null>(null);
  const [reportReady, setReportReady] = useState(false);
  const [handoffOpen, setHandoffOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState(0);
  const [reference, setReference] = useState("");
  const [saved, setSaved] = useState(false);
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewSent, setReviewSent] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setReports(readStored<SavedReport[]>("community-hero-reports", []));
    setReviews(readStored<Review[]>("community-hero-reviews", []));
  }, []);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const next = URL.createObjectURL(file);
    setPreview(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);

  async function loadLiveCases() {
    const result = await listCases();
    setLiveCases(result.cases.filter((c) => c.status !== "Resolved"));
  }

  useEffect(() => {
    loadLiveCases();
  }, []);

  async function handleVerify(id: string) {
    setVerifyingId(id);
    try {
      const result = await verifyCase({ data: { id } });
      if (result.case) {
        setLiveCases((current) => current.map((c) => (c.id === id ? result.case! : c)));
        setJustVerified(id);
        window.setTimeout(
          () => setJustVerified((current) => (current === id ? null : current)),
          2200,
        );
      }
    } finally {
      setVerifyingId(null);
    }
  }

  const complaint = useMemo(() => {
    const a = analysis ?? demoAnalysis;
    return `Subject: Urgent civic complaint regarding ${a.category}\n\nSir/Madam,\n\nI wish to report a ${a.severity.toLowerCase()}-severity civic issue at ${location || "the location noted above"}. ${description || a.summary}\n\nThe issue poses a risk to public safety and requires inspection and time-bound corrective action. Photo evidence and geolocation are attached. Please acknowledge this complaint, share the responsible officer/work-order details, and provide a resolution timeline.\n\nSincerely,\nA concerned citizen`;
  }, [analysis, description, location]);

  async function analyzeEvidence() {
    setAnalyzing(true);
    setAnalysis(null);
    try {
      let imageData: string | undefined;
      if (file?.type.startsWith("image/")) {
        if (file.size > 8_000_000) throw new Error("Please use an image under 8 MB");
        imageData = await fileToBase64(file);
      }
      const result = await analyzeCivicEvidence({
        data: { data: imageData, mimeType: file?.type, description, location },
      });
      setAnalysis(result.analysis);
      setAnalysisMode(result.live ? `${result.model} · live` : result.model);
      setDescription(
        (current) =>
          current ||
          "A deep pothole is obstructing the left traffic lane beside a pedestrian crossing.",
      );
      setCheckingDuplicates(true);
      try {
        const dupResult = await findDuplicates({
          data: {
            category: result.analysis.category,
            severity: result.analysis.severity as "Low" | "Medium" | "High" | "Critical",
            department: result.analysis.department,
            description,
            location,
          },
        });
        setDuplicates(dupResult.matches);
        if (dupResult.matches.length === 0) {
          await createCase({
            data: {
              category: result.analysis.category,
              severity: result.analysis.severity as "Low" | "Medium" | "High" | "Critical",
              department: result.analysis.department,
              description,
              location,
            },
          });
          await loadLiveCases();
        }
      } catch {
        setDuplicates([]);
      } finally {
        setCheckingDuplicates(false);
      }
    } catch (error) {
      setAnalysis({
        ...demoAnalysis,
        summary:
          error instanceof Error
            ? `${demoAnalysis.summary} ${error.message}.`
            : demoAnalysis.summary,
      });
      setAnalysisMode("guided fallback");
    } finally {
      setAnalyzing(false);
    }
  }

  function saveReference() {
    if (!reference.trim()) return;
    const item: SavedReport = {
      id: `CH-${Math.floor(4100 + Math.random() * 800)}`,
      reference: reference.trim(),
      title: analysis?.category ?? "Civic issue",
      location,
      status: "Filed on official portal",
      createdAt: new Date().toISOString(),
    };
    const next = [item, ...reports];
    setReports(next);
    window.localStorage.setItem("community-hero-reports", JSON.stringify(next));
    setSaved(true);
  }

  function submitReview() {
    if (!reviewMessage.trim()) return;
    const next = [
      { rating, message: reviewMessage.trim(), createdAt: new Date().toISOString() },
      ...reviews,
    ];
    setReviews(next);
    window.localStorage.setItem("community-hero-reviews", JSON.stringify(next));
    setReviewMessage("");
    setReviewSent(true);
    window.setTimeout(() => setReviewSent(false), 3000);
  }

  return (
    <>
      <section id="report" className="relative border-y border-border bg-card/45 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="eyebrow">Citizen action desk</span>
              <h2 className="font-display mt-3 max-w-3xl text-4xl md:text-6xl">
                From street evidence to an official case.
              </h2>
            </div>
            <div className="flex items-center gap-3 rounded-full border border-primary/20 bg-civic-soft/60 px-4 py-2 text-xs font-medium text-primary">
              <Sparkles className="h-4 w-4" /> Gemini-guided workflow
            </div>
          </div>

          <div className="grid overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-elevated)] lg:grid-cols-[0.95fr_1.05fr]">
            <div className="border-b border-border p-6 md:p-9 lg:border-b-0 lg:border-r">
              <div className="mb-6 flex items-center gap-3 text-xs">
                {["Evidence", "AI brief", "Official filing"].map((label, index) => (
                  <div key={label} className="flex items-center gap-2">
                    <span
                      className={`grid h-6 w-6 place-items-center rounded-full font-mono text-[10px] ${index === 0 || analysis ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                    >
                      {index + 1}
                    </span>
                    <span className="hidden text-muted-foreground sm:inline">{label}</span>
                    {index < 2 && <ChevronRight className="h-3 w-3 text-border" />}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="group relative grid min-h-64 w-full place-items-center overflow-hidden rounded-2xl border border-dashed border-primary/35 bg-civic-soft/25 transition hover:border-primary hover:bg-civic-soft/45"
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Uploaded civic issue evidence"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="max-w-xs px-5 text-center">
                    <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                      <Camera className="h-6 w-6" />
                    </span>
                    <p className="mt-4 font-semibold">Add a photo or short video</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Clear, recent evidence helps the community and authority verify faster.
                    </p>
                  </div>
                )}
                {preview && (
                  <span className="absolute bottom-3 right-3 rounded-full bg-ink/80 px-3 py-1.5 text-xs text-white backdrop-blur">
                    <Upload className="mr-1 inline h-3 w-3" /> Replace
                  </span>
                )}
              </button>
              <input
                ref={fileInput}
                className="hidden"
                type="file"
                accept="image/*,video/*"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-medium">
                  <span className="mb-2 block text-muted-foreground">Location</span>
                  <span className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-3">
                    <MapPin className="h-4 w-4 text-primary" />
                    <input
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                      className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                    />
                  </span>
                </label>
                <label className="text-xs font-medium">
                  <span className="mb-2 block text-muted-foreground">Your observation</span>
                  <input
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="What did you notice?"
                    className="w-full rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none focus:border-primary"
                  />
                </label>
              </div>

              <button
                onClick={analyzeEvidence}
                disabled={analyzing}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 disabled:opacity-70"
              >
                {analyzing ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />{" "}
                    Gemini is reading the evidence…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Analyze & prepare complaint
                  </>
                )}
              </button>
              <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">
                {analysis
                  ? `Analysis mode: ${analysisMode}.`
                  : "Images are processed only when you start analysis."}
              </p>
            </div>

            <div className="bg-paper/45 p-6 md:p-9">
              {!analysis ? (
                <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
                  <div className="relative grid h-24 w-24 place-items-center rounded-full border border-primary/20 bg-civic-soft/50">
                    <Bot className="h-10 w-10 text-primary" />
                    <span className="absolute inset-[-8px] rounded-full border border-dashed border-primary/20" />
                  </div>
                  <h3 className="font-display mt-7 text-2xl">Your civic co-pilot is ready</h3>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                    It will classify the issue, estimate urgency, route it to the likely authority
                    and write the formal complaint.
                  </p>
                  <div className="mt-8 grid w-full max-w-md grid-cols-2 gap-3 text-left text-xs">
                    {[
                      "Issue classification",
                      "Severity assessment",
                      "Authority routing",
                      "Formal letter drafting",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2 rounded-xl border border-border bg-card p-3"
                      >
                        <Check className="h-3.5 w-3.5 text-success" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="eyebrow">Gemini evidence brief</span>
                      <h3 className="font-display mt-2 text-3xl">{analysis.category}</h3>
                    </div>
                    <span className="rounded-full bg-terracotta/10 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-terracotta">
                      {analysis.severity} risk
                    </span>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <Info label="Confidence" value={`${analysis.confidence}%`} />
                    <Info label="Likely authority" value={analysis.department} />
                  </div>
                  <div className="mt-4 rounded-xl border border-primary/20 bg-civic-soft/35 p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                      <Sparkles className="h-3.5 w-3.5" /> AI assessment
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/75">
                      {analysis.summary}
                    </p>
                  </div>
                  {checkingDuplicates && (
                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                      Scanning nearby open cases for duplicates…
                    </div>
                  )}
                  {!checkingDuplicates && duplicates.length > 0 && (
                    <div className="mt-4 rounded-xl border border-warning/30 bg-warning/5 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-warning">
                        <Users className="h-3.5 w-3.5" /> {duplicates.length} similar open case
                        {duplicates.length > 1 ? "s" : ""} nearby
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-foreground/75">
                        This looks like it may already be reported. Verifying an existing case
                        builds stronger evidence than a duplicate filing.
                      </p>
                      <div className="mt-3 space-y-2">
                        {duplicates.map((m) => (
                          <div
                            key={m.case.id}
                            className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-xs"
                          >
                            <span>
                              <strong className="font-mono">{m.case.id}</strong> · {m.case.location}{" "}
                              · {m.case.verifications} verifications
                            </span>
                            <span className="text-muted-foreground">
                              {(m.distanceKm * 1000).toFixed(0)}m away
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {!checkingDuplicates && duplicates.length === 0 && (
                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-success/25 bg-success/5 p-3 text-xs text-success">
                      <Check className="h-3.5 w-3.5" /> No nearby duplicates found — this case has
                      been added to the live board.
                    </div>
                  )}
                  <div className="mt-4 rounded-xl border border-border bg-card">
                    <div className="flex items-center justify-between border-b border-border px-4 py-3">
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <FileText className="h-4 w-4 text-primary" /> Formal complaint draft
                      </div>
                      <button
                        onClick={() => navigator.clipboard?.writeText(complaint)}
                        className="text-[11px] font-medium text-primary"
                      >
                        Copy text
                      </button>
                    </div>
                    <pre className="max-h-48 overflow-auto whitespace-pre-wrap p-4 font-sans text-xs leading-relaxed text-foreground/70">
                      {complaint}
                    </pre>
                  </div>
                  <button
                    onClick={() => {
                      setReportReady(true);
                      setHandoffOpen(true);
                    }}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                  >
                    Continue to official filing <ExternalLink className="h-4 w-4" />
                  </button>
                  <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
                    <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> Community
                    Hero prepares and tracks your case. You review and submit it on the government
                    portal; we never claim to file without your confirmation.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="track" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <span className="eyebrow">Smart follow-through</span>
              <h2 className="font-display mt-3 text-4xl md:text-5xl">
                Never wonder what to do next.
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                The recommendation rail reads each case’s age, official status and community
                evidence, then suggests one responsible next action.
              </p>
              <div className="mt-8 space-y-2">
                {sampleCases.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedCase(index)}
                    className={`w-full rounded-xl border p-4 text-left transition ${selectedCase === index ? "border-primary bg-civic-soft/55" : "border-border bg-card hover:border-primary/30"}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {item.id}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{item.age}</span>
                    </div>
                    <div className="mt-1 text-sm font-semibold">{item.title}</div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className={`h-1.5 w-1.5 rounded-full ${item.tone}`} />
                      {item.status}
                    </div>
                  </button>
                ))}
                {reports.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-success/30 bg-success/5 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-muted-foreground">{item.id}</span>
                      <BadgeCheck className="h-4 w-4 text-success" />
                    </div>
                    <div className="mt-1 text-sm font-semibold capitalize">{item.title}</div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Official ref · {item.reference}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <CaseTracker item={sampleCases[selectedCase]} />
          </div>
        </div>
      </section>

      <section id="validate" className="border-y border-border bg-card/45 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="eyebrow">Community verification</span>
              <h2 className="font-display mt-3 max-w-2xl text-4xl md:text-5xl">
                You confirm it. The case gets stronger.
              </h2>
              <p className="mt-4 max-w-xl text-muted-foreground">
                Five independent verifications auto-advance a case from
                <span className="font-semibold"> Reported</span> to
                <span className="font-semibold"> Verified</span>. This reads and writes the live
                board — your tap actually moves the counter.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-civic-soft/60 px-4 py-2 text-xs font-medium text-primary">
              <Users className="h-4 w-4" /> {liveCases.length} open cases nearby
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {liveCases.map((c) => {
              const progress = Math.min(100, (c.verifications / 5) * 100);
              return (
                <div key={c.id} className="card-elevated p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {c.id}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ${c.status === "Verified" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <div className="mt-3 text-sm font-semibold">{c.category}</div>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {c.location}
                  </p>
                  <div className="mt-4">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>{c.verifications} of 5 verifications</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => handleVerify(c.id)}
                    disabled={verifyingId === c.id || c.status === "Verified"}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-civic-soft/40 px-4 py-2.5 text-xs font-semibold text-primary transition hover:bg-civic-soft/70 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {verifyingId === c.id ? (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                    ) : justVerified === c.id ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Verified — thank you
                      </>
                    ) : c.status === "Verified" ? (
                      <>
                        <BadgeCheck className="h-3.5 w-3.5" /> Already verified
                      </>
                    ) : (
                      <>
                        <BadgeCheck className="h-3.5 w-3.5" /> I see this issue too
                      </>
                    )}
                  </button>
                </div>
              );
            })}
            {liveCases.length === 0 && (
              <div className="col-span-full rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                No open cases yet — report an issue above to see it appear here for community
                verification.
              </div>
            )}
          </div>
        </div>
      </section>

      <section
        id="government"
        className="border-y border-border bg-primary py-24 text-primary-foreground"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[.2em] text-primary-foreground/60">
                Verified government pathways
              </span>
              <h2 className="font-display mt-3 max-w-3xl text-4xl md:text-5xl">
                One civic desk. Real official destinations.
              </h2>
            </div>
            <div className="max-w-sm text-sm leading-relaxed text-primary-foreground/65">
              Links open the official portal in a new tab. Community Hero stores only the reference
              you choose to bring back.
            </div>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {portals.map((portal) => (
              <a
                key={portal.name}
                href={portal.url}
                target="_blank"
                rel="noreferrer"
                className="group rounded-2xl border border-white/15 bg-white/[.06] p-6 transition hover:-translate-y-1 hover:bg-white/[.1]"
              >
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <span className="rounded-full border border-white/15 px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-white/60">
                      {portal.badge}
                    </span>
                    <h3 className="font-display mt-4 text-2xl">{portal.name}</h3>
                  </div>
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-primary transition group-hover:rotate-12">
                    <ExternalLink className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-4 text-sm font-medium">{portal.scope}</div>
                <p className="mt-1 text-sm leading-relaxed text-white/60">{portal.detail}</p>
              </a>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-xs leading-relaxed text-white/55">
            Important: RTI Online serves Central Government public authorities, not State
            Governments (including NCT Delhi). Community Hero is an independent civic-assistance
            prototype and is not affiliated with or endorsed by any government body.
          </div>
        </div>
      </section>

      <section id="feedback" className="py-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <span className="eyebrow">Built with citizens</span>
            <h2 className="font-display mt-3 text-4xl md:text-5xl">Tell us what slows you down.</h2>
            <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground">
              Feedback is tagged, counted and surfaced immediately so the product team can fix the
              highest-friction parts first.
            </p>
            <div className="mt-8 flex items-end gap-4">
              <span className="font-display text-6xl">4.8</span>
              <div className="pb-2">
                <div className="flex text-warning">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Demo community score · {128 + reviews.length} responses
                </div>
              </div>
            </div>
            <div className="mt-7 space-y-3">
              {[
                "Make Hindi the next full language",
                "Simplify the official portal handoff",
                "Add neighbourhood WhatsApp sharing",
              ].map((item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-sm"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-civic-soft font-mono text-[10px] text-primary">
                    {index + 1}
                  </span>
                  <span className="flex-1">{item}</span>
                  <span className="text-xs text-muted-foreground">{42 - index * 11}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card-elevated p-6 md:p-8">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
                <MessageSquareMore className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display text-xl">Fast feedback loop</h3>
                <p className="text-xs text-muted-foreground">About 30 seconds</p>
              </div>
            </div>
            <div className="mt-7">
              <label className="text-xs font-semibold">How useful was this experience?</label>
              <div className="mt-3 flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => setRating(value)}
                    aria-label={`${value} stars`}
                    className={`grid h-11 w-11 place-items-center rounded-xl border transition ${value <= rating ? "border-warning bg-warning/10 text-warning" : "border-border text-muted-foreground"}`}
                  >
                    <Star className={`h-4 w-4 ${value <= rating ? "fill-current" : ""}`} />
                  </button>
                ))}
              </div>
            </div>
            <label className="mt-6 block text-xs font-semibold">
              What should we improve first?
            </label>
            <textarea
              value={reviewMessage}
              onChange={(event) => setReviewMessage(event.target.value)}
              placeholder="Example: I wasn't sure which portal to use for a drainage issue…"
              className="mt-3 min-h-36 w-full resize-none rounded-xl border border-border bg-background p-4 text-sm outline-none focus:border-primary"
            />
            <button
              onClick={submitReview}
              disabled={!reviewMessage.trim()}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {reviewSent ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Feedback saved
                </>
              ) : (
                <>
                  Send feedback <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              This prototype stores feedback in your browser only.
            </p>
          </div>
        </div>
      </section>

      {handoffOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Official filing handoff"
          className="fixed inset-0 z-[80] grid place-items-center bg-ink/60 p-4 backdrop-blur-sm"
        >
          <div className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-3xl border border-border bg-card shadow-2xl">
            <div className="sticky top-0 flex items-start justify-between border-b border-border bg-card/95 p-6 backdrop-blur">
              <div>
                <span className="eyebrow">Step 3 · official filing</span>
                <h3 className="font-display mt-2 text-2xl">Choose the right government channel</h3>
              </div>
              <button
                onClick={() => setHandoffOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full border border-border"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6">
              <div className="rounded-xl border border-info/25 bg-info/5 p-4 text-sm leading-relaxed">
                <strong>Community Hero does not submit on your behalf.</strong> Open the official
                portal, review the AI-prepared complaint, complete login/OTP/CAPTCHA yourself, then
                paste the issued reference below.
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {portals.slice(0, 3).map((portal) => (
                  <a
                    key={portal.name}
                    href={portal.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-border p-4 text-sm font-semibold transition hover:border-primary hover:bg-civic-soft/40"
                  >
                    <span>
                      <span className="block">{portal.name}</span>
                      <span className="mt-1 block text-[11px] font-normal text-muted-foreground">
                        {portal.badge}
                      </span>
                    </span>
                    <ExternalLink className="h-4 w-4 text-primary" />
                  </a>
                ))}
              </div>
              <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                After submitting
                <span className="h-px flex-1 bg-border" />
              </div>
              <label className="text-xs font-semibold">Official registration / complaint ID</label>
              <div className="mt-2 flex gap-2">
                <input
                  value={reference}
                  onChange={(event) => {
                    setReference(event.target.value);
                    setSaved(false);
                  }}
                  placeholder="e.g. MCD311-260623-1842"
                  className="min-w-0 flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                />
                <button
                  onClick={saveReference}
                  disabled={!reference.trim()}
                  className="rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                >
                  Save & track
                </button>
              </div>
              {saved && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-success/10 p-3 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4" /> Linked. Your recommendation timeline is now
                  active.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result || "");
      resolve(value.includes(",") ? value.slice(value.indexOf(",") + 1) : value);
    };
    reader.onerror = () => reject(new Error("Could not read the selected image"));
    reader.readAsDataURL(file);
  });
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

function CaseTracker({ item }: { item: (typeof sampleCases)[number] }) {
  const stages = ["Reported", "Verified", "Officially filed", "In progress", "Citizen confirmed"];
  return (
    <div className="card-elevated overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-secondary/50 px-6 py-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Official reference
          </span>
          <div className="mt-1 font-mono text-sm font-semibold">{item.reference}</div>
        </div>
        <span className="rounded-full border border-border bg-card px-3 py-1.5 text-xs">
          {item.age}
        </span>
      </div>
      <div className="p-6 md:p-8">
        <h3 className="font-display text-3xl">{item.title}</h3>
        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {item.location}
        </p>
        <div className="mt-8">
          <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
            {stages.map((stage, index) => (
              <span key={stage} className={index === 1 || index === 2 ? "hidden sm:block" : ""}>
                {stage}
              </span>
            ))}
          </div>
          <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${item.progress}%` }}
            />
          </div>
        </div>
        <div className="mt-8 rounded-2xl border border-primary/20 bg-civic-soft/45 p-5">
          <div className="flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Lightbulb className="h-5 w-5" />
            </span>
            <div>
              <span className="font-mono text-[9px] uppercase tracking-widest text-primary">
                Recommended next move
              </span>
              <h4 className="mt-1 text-lg font-semibold">{item.recommendation}</h4>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.reason}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
              Prepare action
            </button>
            <button className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold">
              Why this?
            </button>
          </div>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <Mini icon={<Users />} value="24" label="citizen verifications" />
          <Mini icon={<Clock3 />} value="18h" label="until next check" />
          <Mini icon={<FileCheck2 />} value="6" label="evidence items" />
        </div>
        <div className="mt-7 border-t border-border pt-6">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Case activity</h4>
            <span className="text-[11px] text-muted-foreground">Last sync · 12 min ago</span>
          </div>
          <div className="mt-4 space-y-4">
            {[
              ["Community Hero", "Official reference linked and tracking started", "Today · 10:42"],
              ["24 neighbours", "Issue verified as still present", "Yesterday · 18:10"],
              [
                "Gemini",
                "Evidence structured and responsible authority suggested",
                "19 Jun · 09:14",
              ],
            ].map(([who, event, time]) => (
              <div key={event} className="flex gap-3 text-sm">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div className="flex-1">
                  <strong>{who}</strong>
                  <span className="text-muted-foreground"> · {event}</span>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">{time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Mini({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between text-primary">
        {<span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span>}
        <strong className="font-display text-xl text-foreground">{value}</strong>
      </div>
      <div className="mt-2 text-[11px] leading-tight text-muted-foreground">{label}</div>
    </div>
  );
}
