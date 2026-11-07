import type { Match, MatchStatus, Pool, ScoresAdapter, ScoresPayload, Standing } from "./types";

// Google Sheets: File → Share → Publish to web → choose the tab → CSV. One URL per tab.
//
// Matches tab columns (header row, any order):
//   id, court, division, pool, start, status, home, home_score, away, away_score
//   status = final | upcoming (blank = final when both scores are filled)     start = 2026-11-07 09:40 (Pacific) or ISO
// Standings tab columns:
//   group, division, pool, team, p, w, d, l, gf, ga, pts      group = Ladies | Mixed
// No standings tab? Leave SCORES_STANDINGS_CSV unset and tables are calculated from the finals.

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [head, ...body] = rows.filter((r) => r.some((x) => x.trim()));
  if (!head) return [];
  const keys = head.map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  return body.map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? "").trim()])));
}

const num = (v: string) => (v === "" || v == null ? null : Number(v));
const toIso = (v: string) => {
  if (!v) return undefined;
  if (/T/.test(v)) return v;
  const m = v.match(/^(\d{4}-\d{2}-\d{2})[ ](\d{1,2}):(\d{2})/);
  return m ? `${m[1]}T${m[2].padStart(2, "0")}:${m[3]}:00-08:00` : undefined;
};

async function get(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Sheet returned ${res.status}`);
  return parseCsv(await res.text());
}

export const csvAdapter: ScoresAdapter = {
  name: "csv",
  async fetch(): Promise<ScoresPayload> {
    const mUrl = process.env.SCORES_MATCHES_CSV;
    const sUrl = process.env.SCORES_STANDINGS_CSV;
    if (!mUrl && !sUrl) throw new Error("Set SCORES_MATCHES_CSV and/or SCORES_STANDINGS_CSV");
    const [mRows, sRows] = await Promise.all([mUrl ? get(mUrl) : [], sUrl ? get(sUrl) : []]);

    const matches: Match[] = mRows.filter((r) => r.home && r.away).map((r, i) => ({
      id: r.id || `m${i}`,
      court: r.court || undefined,
      division: r.division || "",
      pool: r.pool || undefined,
      start: toIso(r.start),
      status: (r.status?.toLowerCase() === "upcoming" || r.home_score === "" ? "upcoming" : "final") as MatchStatus,
      home: { team: r.home, score: num(r.home_score) },
      away: { team: r.away, score: num(r.away_score) },
    }));

    const poolMap = new Map<string, Pool>();
    for (const r of sRows) {
      if (!r.team) continue;
      const key = `${r.division}|${r.pool}`;
      if (!poolMap.has(key)) poolMap.set(key, { division: r.division, group: /mixed/i.test(r.group || r.division) ? "Mixed" : "Ladies", name: r.pool || "", standings: [] });
      const s: Standing = { team: r.team, p: +r.p || 0, w: +r.w || 0, d: +r.d || 0, l: +r.l || 0, gf: +r.gf || 0, ga: +r.ga || 0, pts: r.pts === "" || r.pts == null ? undefined : +r.pts };
      poolMap.get(key)!.standings.push(s);
    }
    // Order rows as the scoring system ranks them: points, then goal difference, then goals for.
    const pools = [...poolMap.values()].map((p) => ({ ...p, standings: p.standings.sort((a, b) => (b.pts ?? 0) - (a.pts ?? 0) || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf) }));

    return { source: "csv", sample: false, updatedAt: new Date().toISOString(), matches, pools };
  },
};
