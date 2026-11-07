import { EVENT, LEGAL, SOCIAL } from "@/content/site";

export function Footer() {
  return (
    <footer className="ftr uso-stage">
      <div className="wrap">
        <div className="ftr__top">
          <div style={{ display: "grid", gap: 12 }}>
            <h2>U.S. Open Netball Championships®</h2>
            <p style={{ color: "var(--on-stage-muted)" }}>Presented by Netball America, a 501(c)(3) not-for-profit organization.</p>
            <p><a href={`mailto:${EVENT.email}`}>{EVENT.email}</a></p>
          </div>
          <div>
            <h2>Follow</h2>
            <ul>{SOCIAL.map((s) => <li key={s.href}><a href={s.href} target="_blank" rel="noopener">{s.name} · {s.handle}</a></li>)}</ul>
          </div>
          <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
            <h2>Stay in the loop</h2>
            <p style={{ color: "var(--on-stage-muted)" }}>News, results and next year's host city, straight to your inbox.</p>
            <p><a className="uso-btn uso-btn--ghost" href={EVENT.newsletterHref} target="_blank" rel="noopener">Sign up for e-news</a></p>
          </div>
        </div>
        <div className="ftr__legal">
          <p>{LEGAL.map((l, i) => <span key={l.href}>{i > 0 && " · "}<a href={l.href} target="_blank" rel="noopener">{l.label}</a></span>)}</p>
          <p>© 2026 U.S. Open Netball Championships®. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
