"use client";
import { useEffect, useRef, useState } from "react";
import { EVENT, NAV, SOCIAL } from "@/content/site";

const MOBILE_MAX = 1080; // keep in step with the media query in site.css

const ICONS: Record<string, React.ReactElement> = {
  Instagram: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.2" cy="6.8" r="1.3" fill="currentColor" />
    </svg>
  ),
  Facebook: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.51 1.5-3.9 3.77-3.9 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0 0 22 12Z" />
    </svg>
  ),
  X: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M18.9 2H22l-7.1 8.1L23.2 22h-6.6l-5.2-6.8L5.5 22H2.4l7.6-8.7L1.6 2h6.8l4.7 6.2L18.9 2Zm-1.1 18.1h1.7L7.3 3.8H5.5l12.3 16.3Z" />
    </svg>
  ),
  YouTube: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M23 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.76-1.77C19.25 5.1 12 5.1 12 5.1s-7.25 0-8.84.43A2.5 2.5 0 0 0 1.4 7.3C1 8.8 1 12 1 12s0 3.2.4 4.7a2.5 2.5 0 0 0 1.76 1.77c1.59.43 8.84.43 8.84.43s7.25 0 8.84-.43A2.5 2.5 0 0 0 22.6 16.7C23 15.2 23 12 23 12ZM9.75 15.02V8.98L15.5 12l-5.75 3.02Z" />
    </svg>
  ),
};

// One account per platform, first listed wins. The full list (including the
// second Facebook and X accounts) stays in the footer.
const PRIMARY_SOCIAL = SOCIAL.filter(
  (s, i) => ICONS[s.name] && SOCIAL.findIndex((o) => o.name === s.name) === i,
);

export function Header() {
  const [open, setOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = () => { setOpen(false); burgerRef.current?.focus(); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    // Growing past the breakpoint reveals the full nav, so the panel must not linger.
    const onResize = () => { if (window.innerWidth > MOBILE_MAX) setOpen(false); };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector("a")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header className="hdr">
      <div className="wrap hdr__bar">
        <a href="/" className="hdr__logos" aria-label="U.S. Open Netball Championships home">
          <span className="hdr__chip"><img src="/images/logos/us-open-2026.png" alt="" width={46} height={37} /></span>
          <span className="hdr__na"><img src="/images/logos/netball-america.png" alt="Netball America" width={57} height={28} /></span>
        </a>

        <nav className="hdr__desk" aria-label="Main">
          <ul>{NAV.filter((n) => n.primary).map((n) => <li key={n.href}><a href={n.href}>{n.label}</a></li>)}</ul>
        </nav>

        <ul className="hdr__social">
          {PRIMARY_SOCIAL.map((s) => (
            <li key={s.href}>
              <a href={s.href} target="_blank" rel="noopener" title={`${s.name} · ${s.handle}`} aria-label={`${s.name}, ${s.handle}`}>
                {ICONS[s.name]}
              </a>
            </li>
          ))}
        </ul>

        <a className="uso-btn uso-btn--primary hdr__donate" href={EVENT.donateHref} target="_blank" rel="noopener">Donate</a>

        <button
          ref={burgerRef}
          type="button"
          className="hdr__burger"
          aria-expanded={open}
          aria-controls="hdr-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="hdr__bars" aria-hidden="true"><span /><span /><span /></span>
        </button>
      </div>

      <div className="hdr__panel" id="hdr-menu" ref={panelRef} hidden={!open}>
        <nav aria-label="Sections">
          <ul>{NAV.map((n) => <li key={n.href}><a href={n.href} onClick={() => setOpen(false)}>{n.label}</a></li>)}</ul>
        </nav>
        <a className="uso-btn uso-btn--primary hdr__paneldonate" href={EVENT.donateHref} target="_blank" rel="noopener" onClick={() => setOpen(false)}>Donate</a>
      </div>

      {open && <div className="hdr__scrim" aria-hidden="true" onClick={() => setOpen(false)} />}
    </header>
  );
}
