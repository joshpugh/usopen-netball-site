import { csvAdapter } from "./csv";
import { netballConnectAdapter } from "./netballconnect";
import { jsonAdapter } from "./json";
import { sampleAdapter } from "./sample";
import { standingsFromFinals } from "./standings";
import type { ScoresAdapter, ScoresPayload } from "./types";

// SCORES_PROVIDER = sample | json | csv | netballconnect.
const ADAPTERS: Record<string, ScoresAdapter> = { sample: sampleAdapter, json: jsonAdapter, csv: csvAdapter, netballconnect: netballConnectAdapter };

export async function getScores(): Promise<ScoresPayload> {
  const adapter = ADAPTERS[process.env.SCORES_PROVIDER || "sample"] ?? sampleAdapter;
  try {
    const data = await adapter.fetch();
    if (!data.pools.length) data.pools = standingsFromFinals(data.matches);
    return data;
  } catch (e) {
    return { source: adapter.name, sample: false, updatedAt: new Date().toISOString(), matches: [], pools: [], error: e instanceof Error ? e.message : "Scores unavailable" };
  }
}

export type { ScoresPayload, Match, Pool, Standing } from "./types";
