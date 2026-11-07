import type { ScoresAdapter, ScoresPayload } from "./types";

// Placeholder finals so the layout can be reviewed before the live feed is connected.
// The site shows a "Sample data" banner whenever this adapter is active.
export const sampleAdapter: ScoresAdapter = {
  name: "sample",
  async fetch(): Promise<ScoresPayload> {
    const t = (h: number, m: number) => `2026-11-07T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00-08:00`;
    return {
      source: "sample",
      sample: true,
      updatedAt: new Date().toISOString(),
      matches: [
        { id: "m1", court: "Court 1", division: "Ladies Cup", pool: "Pool A", start: t(9, 40), status: "final", home: { team: "Team A1", score: 31 }, away: { team: "Team A2", score: 28 } },
        { id: "m2", court: "Court 2", division: "Mixed Cup", pool: "Pool A", start: t(9, 40), status: "final", home: { team: "Team M1", score: 18 }, away: { team: "Team M2", score: 19 } },
        { id: "m3", court: "Court 3", division: "Ladies Cup", pool: "Pool B", start: t(8, 20), status: "final", home: { team: "Team B1", score: 44 }, away: { team: "Team B2", score: 39 } },
        { id: "m4", court: "Court 1", division: "Mixed Cup", pool: "Pool A", start: t(8, 20), status: "final", home: { team: "Team M3", score: 35 }, away: { team: "Team M4", score: 41 } },
        { id: "m5", court: "Court 2", division: "Ladies Cup", pool: "Pool A", start: t(11, 0), status: "upcoming", home: { team: "Team A1", score: null }, away: { team: "Team A3", score: null } },
        { id: "m6", court: "Court 3", division: "Mixed Cup", pool: "Pool A", start: t(11, 0), status: "upcoming", home: { team: "Team M1", score: null }, away: { team: "Team M4", score: null } },
        { id: "m7", court: "Court 1", division: "Ladies Cup", pool: "Pool A", start: t(8, 20), status: "final", home: { team: "Team A1", score: 40 }, away: { team: "Team A4", score: 22 } },
        { id: "m8", court: "Court 2", division: "Ladies Cup", pool: "Pool A", start: t(8, 20), status: "final", home: { team: "Team A2", score: 33 }, away: { team: "Team A3", score: 33 } },
        { id: "m9", court: "Court 3", division: "Ladies Cup", pool: "Pool B", start: t(9, 40), status: "final", home: { team: "Team B3", score: 29 }, away: { team: "Team B4", score: 41 } },
        { id: "m10", court: "Court 4", division: "Mixed Cup", pool: "Pool A", start: t(10, 20), status: "final", home: { team: "Team M2", score: 38 }, away: { team: "Team M4", score: 30 } },
      ],
      pools: [],
    };
  },
};
