import { EVENT, NAV } from "@/content/site";

export function Header() {
  return (
    <header className="hdr">
      <div className="wrap hdr__bar">
        <a href="/" className="hdr__logos" aria-label="U.S. Open Netball Championships home">
          <span className="hdr__chip"><img src="/images/logos/us-open-2026.png" alt="" width={46} height={37} /></span>
          <span className="hdr__na"><img src="/images/logos/netball-america.png" alt="Netball America" width={57} height={28} /></span>
        </a>
        <nav aria-label="Main">
          <ul>{NAV.map((n) => <li key={n.href}><a href={n.href}>{n.label}</a></li>)}</ul>
        </nav>
        <a className="uso-btn uso-btn--primary hdr__donate" href={EVENT.donateHref} target="_blank" rel="noopener">Donate</a>
      </div>
      <nav className="hdr__sub" aria-label="Sections">
        <ul>{NAV.map((n) => <li key={n.href}><a href={n.href}>{n.label}</a></li>)}</ul>
      </nav>
    </header>
  );
}
