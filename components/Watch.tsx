"use client";
import { useEffect, useState } from "react";
import { DAYS, STREAMS } from "@/content/site";

type Tab = "sat" | "sun" | "replays";

function isLive(from?: string, to?: string, now = Date.now()) {
  return !!from && !!to && now >= Date.parse(from) && now <= Date.parse(to);
}

export function Watch() {
  const [tab, setTab] = useState<Tab>("sat");
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const n = Date.now();
    setNow(n);
    if (n >= Date.parse("2026-11-08T00:00:00-08:00")) setTab("sun");
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const sat = DAYS[1], sun = DAYS[2];
  const live = now !== null && ((tab === "sat" && isLive(sat.live?.from, sat.live?.to, now)) || (tab === "sun" && isLive(sun.live?.from, sun.live?.to, now)));
  const videoId = tab === "sat" ? STREAMS.day1 : tab === "sun" ? STREAMS.day2 : "";
  const src = tab === "replays"
    ? `https://www.youtube.com/embed/videoseries?list=${STREAMS.replaysPlaylist}`
    : videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&rel=0` : "";
  const title = tab === "sat" ? "Day One · Saturday, November 7" : tab === "sun" ? "Finals Day · Sunday, November 8" : "2025 broadcast replays";

  const tabs: { id: Tab; label: string }[] = [
    { id: "sat", label: "Sat · Day One" },
    { id: "sun", label: "Sun · Finals" },
    { id: "replays", label: "2025 replays" },
  ];

  return (
    <div className="watch" id="watch">
      <div>
        <div className="uso-stream">
          {src ? (
            <iframe key={src} src={src} title={`U.S. Open Netball Championships — ${title}`} allow="autoplay; encrypted-media; picture-in-picture; web-share" allowFullScreen loading="eager" />
          ) : (
            <div className="uso-stream__poster">
              <div>
                Finals Day stream goes up Sunday morning
                <div style={{ fontFamily: "var(--font-sans)", textTransform: "none", fontSize: 16, fontWeight: 500, marginTop: 12, letterSpacing: 0 }}>
                  <a href={STREAMS.channel} target="_blank" rel="noopener" style={{ color: "var(--on-stage)" }}>Follow NetballUSA on YouTube</a> to get notified.
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="uso-stream__bar">
          {live && <span className="uso-badge uso-badge--live">Live</span>}
          <h2 className="uso-stream__title">{title}</h2>
          <div className="uso-tabs" role="tablist" aria-label="Choose a stream" style={{ marginLeft: "auto" }}>
            {tabs.map((t) => (
              <button key={t.id} className="uso-tab" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>{t.label}</button>
            ))}
          </div>
        </div>
      </div>
      <aside className="watch__side" aria-label="Schedule">
        <p className="uso-eyebrow">This weekend · Pacific time</p>
        {DAYS.map((d) => {
          const day = new Date(d.date + "T12:00:00-08:00");
          const isToday = now !== null && new Date(now).toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" }) === d.date;
          return (
            <div key={d.id} className={`daycard${isToday ? " daycard--now" : ""}`}>
              <div className="daycard__d">{d.label}<b>{day.getUTCDate()}</b></div>
              <div><div className="daycard__t">{d.title}{isToday ? " · Today" : ""}</div><div className="daycard__s">{d.detail}</div></div>
            </div>
          );
        })}
        <a className="uso-btn uso-btn--ghost" href="#scores">Jump to results</a>
      </aside>
    </div>
  );
}
