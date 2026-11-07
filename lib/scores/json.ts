import type { ScoresAdapter, ScoresPayload } from "./types";

// Reads a feed that already matches ScoresPayload (see types.ts).
// Use this when the scoring system can export JSON, or put a tiny transform
// (Zapier, an Apps Script, a Netball Connect export) in front of it.
export const jsonAdapter: ScoresAdapter = {
  name: "json",
  async fetch(): Promise<ScoresPayload> {
    const url = process.env.SCORES_JSON_URL;
    if (!url) throw new Error("SCORES_JSON_URL is not set");
    const res = await fetch(url, { cache: "no-store", headers: process.env.SCORES_API_KEY ? { Authorization: `Bearer ${process.env.SCORES_API_KEY}` } : {} });
    if (!res.ok) throw new Error(`Feed returned ${res.status}`);
    const data = (await res.json()) as Partial<ScoresPayload>;
    return {
      source: "json",
      sample: false,
      updatedAt: data.updatedAt ?? new Date().toISOString(),
      matches: data.matches ?? [],
      pools: data.pools ?? [],
    };
  },
};
