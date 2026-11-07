export type MatchStatus = "final" | "upcoming"; // no live scoring at this event

export type Match = {
  id: string;
  court?: string;
  division: string; // e.g. "Ladies Cup"
  pool?: string; // e.g. "Pool A"
  start?: string; // ISO time
  status: MatchStatus;
  home: { team: string; score: number | null };
  away: { team: string; score: number | null };
};

export type Standing = {
  team: string;
  p: number; w: number; d: number; l: number;
  gf: number; ga: number; pts?: number;
  // Present when the source publishes a real ladder (see netballconnect.ts).
  rank?: number; // the source's own ranking — includes tiebreakers we cannot recompute
  logo?: string; // hotlinked club logo; may 404, so the UI hides a broken one
  form?: string; // "WWLWD", latest game FIRST
  next?: string; // next opponent's name
  nextLogo?: string;
};

export type Pool = { division: string; group: "Ladies" | "Mixed"; name: string; standings: Standing[] };

export type ScoresPayload = {
  source: string; // which adapter produced it
  sample: boolean; // true => show the "sample data" banner
  updatedAt: string; // ISO
  matches: Match[];
  pools: Pool[];
  error?: string;
};

export interface ScoresAdapter {
  name: string;
  fetch(): Promise<ScoresPayload>;
}
