import type { Match, Pool, ScoresAdapter, ScoresPayload, Standing } from "./types";

// Reads the JSON published by the NetballConnect scrapers.
//
// Standings come from the ladder feed (the proven GitHub Pages job). Match results come
// from scripts/scrape-fixtures.mjs, published to this repo's `data` branch. Every URL is
// env-overridable so the feeds can move host without a code change.
//
// Nothing here calls api-netball.squadi.com. That endpoint 403s anything that isn't their
// own site, and we don't forge Origin/Referer to get around it.

// This repo's own Pages feed, published by .github/workflows/scrape.yml. Defaulting
// here means a deploy needs only SCORES_PROVIDER=netballconnect set. Override any URL
// to point at another host -- e.g. the original joshpugh.github.io/us-open-netball feed.
const FEED = "https://joshpugh.github.io/usopen-netball-site";

const LADDER = {
  Ladies: process.env.NC_LADDER_LADIES_URL || `${FEED}/ladder-ladies.json`,
  Mixed: process.env.NC_LADDER_MIXED_URL || `${FEED}/ladder-mixed.json`,
} as const;

const FIXTURES = {
  Ladies: process.env.NC_FIXTURES_LADIES_URL || `${FEED}/fixtures-ladies.json`,
  Mixed: process.env.NC_FIXTURES_MIXED_URL || `${FEED}/fixtures-mixed.json`,
} as const;

type Group = "Ladies" | "Mixed";

type LadderRow = {
  rank?: number; name?: string; logo?: string | null;
  p?: number; w?: number; l?: number; d?: number;
  f?: number; a?: number; pts?: number; gd?: number;
  form?: string; next?: string; nextLogo?: string | null;
};
type LadderFeed = { updated?: string; teams?: LadderRow[] };

type FixtureRow = {
  id?: string; round?: string; start?: string; court?: string;
  status?: "final" | "upcoming";
  home?: { team?: string; score?: number | null };
  away?: { team?: string; score?: number | null };
};
type FixtureFeed = { updated?: string; matches?: FixtureRow[] };

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  return (await res.json()) as T;
}

function toPool(group: Group, feed: LadderFeed): Pool {
  // Keep the feed's order. `rank` already encodes NetballConnect's tiebreakers
  // (Points -> Head-to-Head -> For/Against -> Goals For); H2H isn't in the feed, so
  // re-sorting locally would eventually disagree with the official ladder.
  const standings: Standing[] = (feed.teams ?? [])
    .filter((t) => (t.name ?? "").trim())
    .map((t) => ({
      team: (t.name ?? "").trim(),
      p: t.p ?? 0, w: t.w ?? 0, d: t.d ?? 0, l: t.l ?? 0,
      gf: t.f ?? 0, ga: t.a ?? 0,
      pts: t.pts,
      rank: t.rank,
      logo: t.logo ?? undefined,
      form: t.form || undefined,
      next: t.next || undefined,
      nextLogo: t.nextLogo ?? undefined,
    }));
  return { division: group, group, name: "", standings };
}

function toMatches(group: Group, feed: FixtureFeed): Match[] {
  return (feed.matches ?? [])
    .filter((m) => m.home?.team && m.away?.team)
    .map((m, i) => ({
      id: m.id || `${group}-${i}`,
      court: m.court || undefined,
      division: group, // must contain "Mixed" for the Mixed tab to pick it up
      pool: m.round || undefined,
      start: m.start || undefined,
      status: m.status === "upcoming" ? "upcoming" : "final",
      home: { team: m.home!.team!, score: m.home!.score ?? null },
      away: { team: m.away!.team!, score: m.away!.score ?? null },
    }));
}

export const netballConnectAdapter: ScoresAdapter = {
  name: "netballconnect",
  async fetch(): Promise<ScoresPayload> {
    const groups: Group[] = ["Ladies", "Mixed"];

    const ladders = await Promise.allSettled(groups.map((g) => getJson<LadderFeed>(LADDER[g])));
    const fixtures = await Promise.allSettled(
      groups.map((g) => (FIXTURES[g] ? getJson<FixtureFeed>(FIXTURES[g]) : Promise.reject(new Error("not configured")))),
    );

    const pools: Pool[] = [];
    const matches: Match[] = [];
    const stamps: string[] = [];
    const problems: string[] = [];

    groups.forEach((g, i) => {
      const l = ladders[i];
      if (l.status === "fulfilled") {
        const pool = toPool(g, l.value);
        if (pool.standings.length) pools.push(pool);
        else problems.push(`${g} ladder was empty`);
        if (l.value.updated) stamps.push(l.value.updated);
      } else {
        problems.push(`${g} ladder unavailable`);
      }

      const f = fixtures[i];
      if (f.status === "fulfilled") {
        matches.push(...toMatches(g, f.value));
        if (f.value.updated) stamps.push(f.value.updated);
      }
      // A missing fixtures feed is not an error: the UI simply shows standings only.
    });

    // Nothing to show at all -> throw so getScores() keeps the last good render.
    if (!pools.length && !matches.length) throw new Error(problems.join("; ") || "No data");

    // Report the OLDEST successful feed, so the displayed time never overstates freshness.
    const updatedAt = stamps.length ? stamps.slice().sort()[0] : new Date().toISOString();

    return {
      source: "netballconnect",
      sample: false,
      updatedAt,
      matches,
      pools,
      // Only surface an error when standings are actually incomplete.
      error: pools.length < groups.length && problems.length ? problems.join("; ") : undefined,
    };
  },
};
