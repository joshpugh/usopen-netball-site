"use client";
import { useEffect, useMemo, useState } from "react";
import type { Match, Pool, ScoresPayload, Standing } from "@/lib/scores";

const REFRESH_MS = 60_000;
const fmtTime = (iso?: string) => iso ? new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Los_Angeles" }) : "";
const isMixed = (s: string) => /mixed/i.test(s);

// Logos are hotlinked from NetballConnect's storage bucket and do 404 from time to time.
// Hide a broken one rather than showing the browser's broken-image icon.
const hideBroken = (e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.visibility = "hidden"; };

// `now` is null until the client mounts: the server has no idea what time it is where
// the reader is, and deciding "in progress" during SSR would mismatch on hydration.
function MatchCard({ m, now }: { m: Match; now: number | null }) {
  const final = m.status === "final" && m.home.score != null && m.away.score != null;
  const started = !final && now !== null && !!m.start && new Date(m.start).getTime() <= now;
  const hw = final && m.home.score! > m.away.score!;
  const aw = final && m.away.score! > m.home.score!;
  const rowCls = (won: boolean, lost: boolean) => `uso-match__row${won ? " uso-match__row--won" : ""}${lost ? " uso-match__row--lost" : ""}`;
  return (
    <article className="uso-match" aria-label={`${m.home.team} versus ${m.away.team}`}>
      <div className="uso-match__meta">
        <span>{[m.court, m.division, m.pool].filter(Boolean).join(" · ")}</span>
        {final
          ? <span className="uso-badge uso-badge--final">Final</span>
          : started
            ? <span className="uso-badge uso-badge--live">In play</span>
            : <span className="uso-badge uso-badge--upcoming">{fmtTime(m.start) || "Upcoming"}</span>}
      </div>
      <div className={rowCls(hw, aw)}><span className="uso-match__team">{m.home.team}</span><span className="uso-match__score">{m.home.score ?? "–"}</span></div>
      <div className={rowCls(aw, hw)}><span className="uso-match__team">{m.away.team}</span><span className="uso-match__score">{m.away.score ?? "–"}</span></div>
    </article>
  );
}

// "WWLWD", latest game first. The source string runs the whole competition, so show 5.
function Form({ form }: { form?: string }) {
  const games = (form ?? "").replace(/[^WLD]/gi, "").toUpperCase().slice(0, 5).split("");
  if (!games.length) return <span className="muted">–</span>;
  const label = { W: "Won", L: "Lost", D: "Drawn" } as const;
  return (
    <span className="std__form">
      {games.map((g, i) => (
        <span key={i} className={`std__chip std__chip--${g.toLowerCase()}`} title={`${label[g as "W" | "L" | "D"]}${i === 0 ? " (most recent)" : ""}`}>{g}</span>
      ))}
    </span>
  );
}

function Gd({ gf, ga }: { gf: number; ga: number }) {
  const gd = gf - ga;
  const cls = gd > 0 ? " std__gd--up" : gd < 0 ? " std__gd--down" : "";
  return <span className={`std__gd${cls}`}>{gd > 0 ? `+${gd}` : gd < 0 ? `−${Math.abs(gd)}` : "0"}</span>;
}

function Row({ s, i }: { s: Standing; i: number }) {
  return (
    <tr>
      <td><span className="uso-board__pos">{s.rank ?? i + 1}</span></td>
      <td className="uso-board__team">
        <span className="std__teamcell">
          {s.logo && <img className="std__logo" src={s.logo} alt="" loading="lazy" onError={hideBroken} />}
          <span>{s.team}</span>
        </span>
      </td>
      <td>{s.p}</td>
      <td>{s.w}</td>
      <td className="c-l">{s.l}</td>
      <td className="c-d">{s.d}</td>
      <td className="c-f">{s.gf}</td>
      <td className="c-a">{s.ga}</td>
      <td><Gd gf={s.gf} ga={s.ga} /></td>
      <td className="uso-board__pts">{s.pts ?? "–"}</td>
      <td className="c-form"><Form form={s.form} /></td>
      <td className="c-next">
        {s.nextLogo
          ? <img className="std__next" src={s.nextLogo} alt={s.next ? `Next: ${s.next}` : "Next opponent"} title={s.next || undefined} loading="lazy" onError={hideBroken} />
          : <span className="muted">–</span>}
      </td>
    </tr>
  );
}

function Board({ pool, updated }: { pool: Pool; updated: string }) {
  return (
    <div className="uso-board std">
      <div className="uso-board__head">
        <h4 className="uso-board__title">{pool.division}{pool.name ? ` · ${pool.name}` : ""}</h4>
      </div>
      <div className="uso-board__scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Team</th>
              <th scope="col" title="Played">P</th>
              <th scope="col" title="Won">W</th>
              <th scope="col" title="Lost" className="c-l">L</th>
              <th scope="col" title="Drawn" className="c-d">D</th>
              <th scope="col" title="Goals for" className="c-f">F</th>
              <th scope="col" title="Goals against" className="c-a">A</th>
              <th scope="col" title="Goal difference">GD</th>
              <th scope="col" title="Points">Pts</th>
              <th scope="col" title="Last 5, most recent first" className="c-form">Form</th>
              <th scope="col" title="Next opponent" className="c-next">Next</th>
            </tr>
          </thead>
          <tbody>{pool.standings.map((s, i) => <Row key={s.team} s={s} i={i} />)}</tbody>
        </table>
      </div>
      <div className="uso-board__foot">
        Official NetballConnect ladder · <span className="std__updated">Updated {fmtTime(updated)} PT</span>
      </div>
    </div>
  );
}

export function Scores({ initial }: { initial: ScoresPayload }) {
  const [data, setData] = useState(initial);
  const [group, setGroup] = useState<"Ladies" | "Mixed">("Ladies");
  const [showAll, setShowAll] = useState(false);
  const [now, setNow] = useState<number | null>(null);

  // Tick once a minute so a kick-off time rolls over to "In progress" on its own.
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const load = () => fetch("/api/scores").then((r) => r.ok ? r.json() : null).then((d) => d && setData(d)).catch(() => {});
    const id = setInterval(() => { if (document.visibilityState === "visible") load(); }, REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  const inGroup = (division: string) => (group === "Mixed") === isMixed(division);
  const finals = useMemo(() => data.matches.filter((m) => m.status === "final" && inGroup(m.division)).sort((a, b) => (b.start ?? "").localeCompare(a.start ?? "")), [data, group]);
  const next = useMemo(() => data.matches.filter((m) => m.status === "upcoming" && inGroup(m.division)).sort((a, b) => (a.start ?? "").localeCompare(b.start ?? "")).slice(0, 4), [data, group]);
  const pools = data.pools.filter((p) => p.group === group);
  const shown = showAll ? finals : finals.slice(0, 6);

  // The ladder feed carries standings only. Only offer the match sections when a
  // fixtures feed is actually supplying matches, so we never claim "no games yet".
  const hasMatchFeed = data.matches.length > 0;

  return (
    <>
      <div className="scores__bar">
        <div className="uso-tabs" role="tablist" aria-label="Division">
          {(["Ladies", "Mixed"] as const).map((g) => (
            <button key={g} className="uso-tab" role="tab" aria-selected={group === g} onClick={() => { setGroup(g); setShowAll(false); }}>{g}</button>
          ))}
        </div>
        <span className="muted" style={{ fontSize: 14 }} aria-live="polite">Updated {fmtTime(data.updatedAt)} PT · refreshes every minute</span>
      </div>

      {data.sample && <p className="notice">Placeholder results while the results feed is connected. Team names are not real.</p>}
      {data.error && <p className="notice">Some results are temporarily unavailable. Showing the most recent data we have.</p>}

      {pools.length > 0 && (
        <>
          <h3 className="subhead">Standings</h3>
          <div className="boards">{pools.map((p) => <Board key={p.division + p.name} pool={p} updated={data.updatedAt} />)}</div>
        </>
      )}

      {hasMatchFeed && (
        <>
          <h3 className="subhead">Final scores</h3>
          {finals.length ? (
            <div className="matches">{shown.map((m) => <MatchCard key={m.id} m={m} now={now} />)}</div>
          ) : (
            <p className="notice">No {group.toLowerCase()} games have finished yet.</p>
          )}
          {finals.length > 6 && (
            <p style={{ marginTop: "-16px", marginBottom: 32 }}>
              <button className="uso-btn uso-btn--ghost" onClick={() => setShowAll((v) => !v)}>{showAll ? "Show fewer" : `Show all ${finals.length} results`}</button>
            </p>
          )}

          {next.length > 0 && (
            <>
              <h3 className="subhead">Up next</h3>
              <div className="matches">{next.map((m) => <MatchCard key={m.id} m={m} now={now} />)}</div>
            </>
          )}
        </>
      )}

      {!pools.length && !hasMatchFeed && (
        <p className="notice">Results are temporarily unavailable. Check back in a few minutes.</p>
      )}
    </>
  );
}
