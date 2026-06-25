import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export type CivicCase = {
  id: string;
  category: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  department: string;
  description: string;
  location: string;
  lat: number;
  lng: number;
  status: "Reported" | "Verified" | "Acknowledged" | "In Progress" | "Resolved";
  verifications: number;
  createdAt: string;
  statusHistory: Array<{ status: string; at: string; note?: string }>;
};

type Row = {
  id: string;
  category: string;
  severity: CivicCase["severity"];
  department: string;
  description: string;
  location: string;
  lat: number;
  lng: number;
  status: CivicCase["status"];
  verifications: number;
  status_history: Array<{ status: string; at: string; note?: string }>;
  created_at: string;
};

function db() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

function rowToCase(r: Row): CivicCase {
  return {
    id: r.id,
    category: r.category,
    severity: r.severity,
    department: r.department,
    description: r.description,
    location: r.location,
    lat: Number(r.lat),
    lng: Number(r.lng),
    status: r.status,
    verifications: r.verifications,
    createdAt: r.created_at,
    statusHistory: Array.isArray(r.status_history) ? r.status_history : [],
  };
}

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function daysOpen(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

async function fetchAll(): Promise<CivicCase[]> {
  const { data, error } = await db()
    .from("civic_cases")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Row[]).map(rowToCase);
}

export const listCases = createServerFn({ method: "GET" }).handler(async () => {
  const cases = await fetchAll();
  return { cases };
});

const createSchema = z.object({
  category: z.string().max(120),
  severity: z.enum(["Low", "Medium", "High", "Critical"]),
  department: z.string().max(120),
  description: z.string().max(1200),
  location: z.string().max(200),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const findDuplicates = createServerFn({ method: "POST" })
  .inputValidator(createSchema)
  .handler(async ({ data }) => {
    const cases = await fetchAll();
    const lat = data.lat ?? 28.5675;
    const lng = data.lng ?? 77.2434;
    const matches = cases
      .filter((c) => c.status !== "Resolved")
      .map((c) => ({ case: c, distanceKm: haversineKm(lat, lng, c.lat, c.lng) }))
      .filter(
        (m) => m.distanceKm < 0.6 && m.case.category.split(" ")[0] === data.category.split(" ")[0],
      )
      .sort((a, b) => a.distanceKm - b.distanceKm);
    return { matches: matches.slice(0, 3) };
  });

export const createCase = createServerFn({ method: "POST" })
  .inputValidator(createSchema)
  .handler(async ({ data }) => {
    const now = new Date().toISOString();
    const id = `CH-${4100 + Math.floor(Math.random() * 9000)}`;
    const insert = {
      id,
      category: data.category,
      severity: data.severity,
      department: data.department,
      description: data.description,
      location: data.location,
      lat: data.lat ?? 28.5675 + (Math.random() - 0.5) * 0.08,
      lng: data.lng ?? 77.2434 + (Math.random() - 0.5) * 0.08,
      status: "Reported" as const,
      verifications: 0,
      status_history: [{ status: "Reported", at: now }],
      created_at: now,
    };
    const { data: row, error } = await db()
      .from("civic_cases")
      .insert(insert)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return { case: rowToCase(row as Row) };
  });

export const verifyCase = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const client = db();
    const { data: existing, error: e1 } = await client
      .from("civic_cases")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (e1) throw new Error(e1.message);
    if (!existing) return { case: null };
    const current = rowToCase(existing as Row);
    const newVerifications = current.verifications + 1;
    const shouldPromote = newVerifications >= 5 && current.status === "Reported";
    const newStatus = shouldPromote ? ("Verified" as const) : current.status;
    const newHistory = shouldPromote
      ? [...current.statusHistory, { status: "Verified", at: new Date().toISOString() }]
      : current.statusHistory;
    const { data: row, error: e2 } = await client
      .from("civic_cases")
      .update({
        verifications: newVerifications,
        status: newStatus,
        status_history: newHistory,
      })
      .eq("id", data.id)
      .select("*")
      .single();
    if (e2) throw new Error(e2.message);
    return { case: rowToCase(row as Row) };
  });

/** Snapshot used by the agent's tool calls — small, cheap, JSON-friendly. */
export async function snapshotForAgent() {
  const cases = await fetchAll();
  return cases.map((c) => ({
    id: c.id,
    category: c.category,
    severity: c.severity,
    department: c.department,
    location: c.location,
    status: c.status,
    verifications: c.verifications,
    daysOpen: daysOpen(c.createdAt),
  }));
}

export async function findChronicZones() {
  const cases = await fetchAll();
  const byLocation = new Map<string, number>();
  for (const c of cases) {
    const key = c.location.split("·")[0].trim();
    byLocation.set(key, (byLocation.get(key) || 0) + 1);
  }
  return Array.from(byLocation.entries())
    .filter(([, count]) => count >= 1)
    .sort((a, b) => b[1] - a[1])
    .map(([location, count]) => ({ location, count }));
}
