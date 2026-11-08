"use client";
import { useEffect, useState } from "react";
import { DAYS, STREAMS, STREAM_WINDOWS } from "@/content/site";

type Tab = "sat" | "day2" | "finals";

function isLive(from?: string, to?: string, now = Date.now()) {
  return !!from && !!to && now >= Date.parse(from) && now <= Date.parse(to);
}

export function Watch() {
  const [tab, setTab] = useState<Tab>("sat");
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const n = Date.now();
    setNow(n);
    // Sunday carries two broadcasts: open on whichever one the clock is in.
    if (n >= Date.parse(STREAM_WINDOWS.finals.from)) setTab("finals");
    else if (n >= Date.parse(STREAM_WINDOWS.day2.from)) setTab("day2");
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Each broadcast has its own window: Finals must not read LIVE while Day Two is on.
  const win = tab === "sat" ? STREAM_WINDOWS.day1 : tab === "day2" ? STREAM_WINDOWS.day2 : STREAM_WINDOWS.finals;
  const live = now !== null && isLive(win.from, win.to, now);
  const videoId = tab === "sat" ? STREAMS.day1 : tab === "day2" ? STREAMS.day2 : STREAMS.finals;
  const src = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&rel=0` : "";
  const title = tab === "sat"
    ? "Day One · Saturday, November 7"
    : tab === "day2" ? "Day Two · Sunday, November 8" : "Finals · Sunday, November 8";

  const tabs: { id: Tab; label: string }[] = [
    { id: "sat", label: "Sat · Day One" },
    { id: "day2", label: "Sun · Day Two" },
    { id: "finals", label: "Sun · Finals" },
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
                This stream goes up shortly before play
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
