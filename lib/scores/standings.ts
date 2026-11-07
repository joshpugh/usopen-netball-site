import type { Match, Pool, Standing } from "./types";

// Builds pool tables from final results when the source doesn't publish standings.
// Ranked by wins, then draws, then goal difference, then goals for. Points are shown
// only if POINTS_WIN is set (e.g. POINTS_WIN=2 POINTS_DRAW=1), so we never guess the rule.
export function standingsFromFinals(matches: Match[]): Pool[] {
  const win = process.env.POINTS_WIN ? Number(process.env.POINTS_WIN) : undefined;
  const draw = Number(process.env.POINTS_DRAW ?? 1);
  const pools = new Map<string, { division: string; name: string; rows: Map<string, Standing> }>();
  for (const m of matches) {
    if (m.status !== "final" || m.home.score == null || m.away.score == null) continue;
    const key = `${m.division}|${m.pool ?? ""}`;
    if (!pools.has(key)) pools.set(key, { division: m.division, name: m.pool ?? "", rows: new Map() });
    const rows = pools.get(key)!.rows;
    const row = (team: string) => {
      if (!rows.has(team)) rows.set(team, { team, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 });
      return rows.get(team)!;
    };
    const h = row(m.home.team), a = row(m.away.team);
    const hs = m.home.score, as = m.away.score;
    h.p++; a.p++; h.gf += hs; h.ga += as; a.gf += as; a.ga += hs;
    if (hs > as) { h.w++; a.l++; } else if (hs < as) { a.w++; h.l++; } else { h.d++; a.d++; }
  }
  return [...pools.values()].map(({ division, name, rows }) => ({
    division,
    name,
    group: /mixed/i.test(division) ? "Mixed" : "Ladies",
    standings: [...rows.values()]
      .map((s) => (win === undefined ? s : { ...s, pts: s.w * win + s.d * draw }))
      .sort((a, b) => (b.pts ?? 0) - (a.pts ?? 0) || b.w - a.w || b.d - a.d || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf),
  }));
}
