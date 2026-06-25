import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { snapshotForAgent, findChronicZones } from "./case-store";

const MODEL = "google/gemini-3-flash-preview";
const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const civicContext = `You are Community Hero's civic action assistant for India.
Give concise, practical and calm guidance. Help citizens identify the likely authority,
improve complaint evidence, understand tracking, reminders, appeals and RTI boundaries.
Never claim a complaint was filed or an authority was contacted. Never invent official
phone numbers, deadlines, reference IDs or legal guarantees. Make it clear when the user
must act on an official government portal. Do not request Aadhaar numbers, OTPs, passwords,
precise home addresses or other sensitive personal information.

You also have live access to the city's case board, included below as JSON. When a citizen
asks about open issues, priority, hotspots, duplicates, or a ward report, answer using ONLY
this real data — never invent case IDs, counts or statuses that aren't in it. If the data
doesn't cover what they asked, say so plainly rather than guessing.`;

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content:
    | string
    | Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
      >;
};

async function callGateway(messages: ChatMessage[]) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) return null;
  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ model: MODEL, messages, temperature: 0.25, max_tokens: 900 }),
  });
  if (res.status === 429) throw new Error("Rate limit exceeded. Please try again shortly.");
  if (res.status === 402) throw new Error("AI credits exhausted. Please top up Lovable AI.");
  if (!res.ok) throw new Error(`AI gateway error: ${res.status}`);
  const body = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return body.choices?.[0]?.message?.content?.trim() ?? null;
}

function guidedReply(message: string) {
  const text = message.toLowerCase();
  if (text.includes("pothole") || text.includes("road")) {
    return "For a road or pothole complaint, add a clear wide photo, a close photo showing depth, the nearest landmark and whether it blocks traffic. For Delhi municipal roads, start with MCD 311; for a PWD-managed road, use the relevant PWD channel or CPGRAMS. Save the official reference here after filing.";
  }
  if (text.includes("rti")) {
    return "RTI is for requesting existing government records, not for asking an authority to repair an issue. Use the grievance portal first. If you later need work-order, inspection or spending records, draft a focused RTI.";
  }
  if (text.includes("remind") || text.includes("stuck") || text.includes("unresolved")) {
    return "Check the official portal status first, then send its built-in reminder if the stated response window has passed. Attach fresh evidence, quote the original reference number and record the reminder date.";
  }
  if (text.includes("duplicate")) {
    return "Search nearby open reports and compare the landmark, issue type and photo date. If it is the same problem, verify the existing case instead of filing another one.";
  }
  return "I can help you prepare evidence, select an official portal, understand a case status, write a reminder or plan a responsible escalation. Tell me the issue type, city and current official status — without sharing OTPs or sensitive identity details.";
}

export const chatWithCivicAI = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      message: z.string().trim().min(1).max(1200),
      history: z
        .array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(1800) }))
        .max(8),
    }),
  )
  .handler(async ({ data }) => {
    const liveBoard = await snapshotForAgent();
    const hotspots = await findChronicZones();
    const system = `${civicContext}\n\nCurrent case board (${liveBoard.length} cases):\n${JSON.stringify(liveBoard)}\n\nRecurring-issue locations:\n${JSON.stringify(hotspots)}`;

    const messages: ChatMessage[] = [{ role: "system", content: system }];
    for (const h of data.history.slice(-6)) {
      messages.push({ role: h.role, content: h.text });
    }
    messages.push({ role: "user", content: data.message });

    try {
      const response = await callGateway(messages);
      return response
        ? { text: response, live: true, model: MODEL }
        : { text: guidedReply(data.message), live: false, model: "guided demo" };
    } catch (err) {
      return {
        text: `${guidedReply(data.message)}\n\n(${err instanceof Error ? err.message : "AI temporarily unavailable"})`,
        live: false,
        model: "guided fallback",
      };
    }
  });

const evidenceSchema = z.object({
  data: z.string().max(16_000_000).optional(),
  mimeType: z.string().max(80).optional(),
  description: z.string().max(1200),
  location: z.string().max(300),
});

export const analyzeCivicEvidence = createServerFn({ method: "POST" })
  .inputValidator(evidenceSchema)
  .handler(async ({ data }) => {
    const fallback = {
      category: "Road damage · pothole",
      severity: "High",
      department: "Municipal engineering / PWD",
      confidence: 94,
      summary:
        "Likely asphalt surface failure in an active traffic lane. Add a scale reference and a wide-angle location photo before official filing.",
    };
    const system = `${civicContext}\nAnalyze civic issue evidence. Return ONLY a single valid JSON object with keys category, severity, department, confidence (integer 0-100), and summary. No prose, no markdown fences.`;
    const userContent: Array<
      { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }
    > = [
      {
        type: "text",
        text: `Location supplied by citizen: ${data.location || "not supplied"}\nCitizen description: ${data.description || "not supplied"}`,
      },
    ];
    if (data.data && data.mimeType?.startsWith("image/")) {
      userContent.push({
        type: "image_url",
        image_url: { url: `data:${data.mimeType};base64,${data.data}` },
      });
    }
    try {
      const response = await callGateway([
        { role: "system", content: system },
        { role: "user", content: userContent },
      ]);
      if (!response) return { analysis: fallback, live: false, model: "guided demo" };
      const cleaned = response
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();
      const parsed = JSON.parse(cleaned) as typeof fallback;
      return {
        analysis: {
          category: String(parsed.category || fallback.category),
          severity: String(parsed.severity || fallback.severity),
          department: String(parsed.department || fallback.department),
          confidence: Math.max(0, Math.min(100, Number(parsed.confidence) || fallback.confidence)),
          summary: String(parsed.summary || fallback.summary),
        },
        live: true,
        model: MODEL,
      };
    } catch {
      return { analysis: fallback, live: false, model: "guided fallback" };
    }
  });
