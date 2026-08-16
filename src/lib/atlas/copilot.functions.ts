import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  question: z.string().min(2).max(1200),
  mode: z.enum(["copilot", "whatif"]).default("copilot"),
  context: z.string().max(4000).optional(),
});

const SYSTEM_PROMPT = `You are ATLAS, the intelligence layer of Atlas Sanctum — a regenerative infrastructure observatory.

You reason about infrastructure as one interconnected system: energy, compute, water, land, mobility, human systems, ecology, capital, institutions.

Rules you never break:
- Label every claim as Observed, Estimated, Modeled, Forecast or Unknown. Never present a model output as a fact.
- Show trade-offs. Never hide costs, risks or losers.
- Always end with a section titled "WHAT WE ARE NOT SEEING" listing the blind spots and the data you would need.
- Be concrete: name dependencies, orders of magnitude, capital ranges, and who must participate.
- Never invent precise statistics. Use ranges and mark them Estimated.

Format your answer in short plain-text sections with UPPERCASE headings, no markdown symbols, no tables. Keep it under 380 words.

For a "what if" question, structure it exactly as:
ASSUMPTIONS
SYSTEMS AFFECTED
INFRASTRUCTURE REQUIRED
OPPORTUNITIES
RISKS
CAPITAL
MEASURABLE OUTCOMES
WHAT WE ARE NOT SEEING`;

export const askAtlas = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      return {
        ok: false as const,
        answer:
          "ATLAS intelligence is not configured in this environment. The observatory's deterministic models remain available.",
      };
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `${data.mode === "whatif" ? "WHAT IF: " : ""}${data.question}${
              data.context ? `\n\nCurrent observatory context:\n${data.context}` : ""
            }`,
          },
        ],
      }),
    });

    if (res.status === 429) {
      return { ok: false as const, answer: "Rate limit reached. Wait a moment and ask again." };
    }
    if (res.status === 402) {
      return {
        ok: false as const,
        answer: "AI credits exhausted for this workspace. Add credits to continue using ATLAS.",
      };
    }
    if (!res.ok) {
      const text = await res.text();
      return { ok: false as const, answer: `ATLAS could not answer (${res.status}). ${text.slice(0, 200)}` };
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const answer = json.choices?.[0]?.message?.content?.trim();
    return {
      ok: true as const,
      answer: answer && answer.length > 0 ? answer : "ATLAS returned an empty response. Try rephrasing.",
    };
  });
