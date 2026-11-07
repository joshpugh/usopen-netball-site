import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Watch } from "@/components/Watch";
import { Scores } from "@/components/Scores";
import { Podium } from "@/components/Podium";
import { getScores } from "@/lib/scores";
import { BAI, COUNTRIES, EVENT, GET_INVOLVED, HOTELS, INTRO, MEDIA, PARTNERS, RESULTS_2025, STATS, STREAMS, VENUE, DAYS } from "@/content/site";

export const revalidate = 60;

export default async function Home() {
  const scores = await getScores();
  const sunset = HOTELS.options[0];
  const hampton = HOTELS.options[1];

  return (
    <>
      <Header />
      <main id="main">
        {/* 1. Stream first */}
        <section className="uso-stage hero" aria-labelledby="hero-title">
          <div className="hero__bg" style={{ backgroundImage: "url(/images/photos/opening-ceremony.jpg)" }} aria-hidden="true" />
          <div className="wrap hero__inner">
            <div className="hero__top">
              <p className="uso-eyebrow">{EVENT.datesLabel} · {EVENT.city}</p>
              <h1 id="hero-title" className="hero__title">U.S. Open <span>Netball</span> Championships®</h1>
              <p className="hero__tag">“{EVENT.tagline}”</p>
            </div>
            <Watch />
          </div>
        </section>

        {/* 2. Results */}
        <section className="section" id="scores" aria-labelledby="scores-title">
          <div className="wrap">
            <div className="sec-head">
              <p className="uso-eyebrow">2026 · Las Vegas</p>
              <h2 id="scores-title" className="sec-title">Results</h2>
              <p className="lead muted">Every final score, and the pool tables built from them. This updates through the weekend.</p>
            </div>
            <Scores initial={scores} />
          </div>
        </section>

        {/* 3. About + stats */}
        <section className="section section--sunken" id="about" aria-labelledby="about-title">
          <div className="wrap about">
            <div className="about__copy">
              <p className="uso-eyebrow">Since 2009</p>
              <h2 id="about-title" className="sec-title">The USA’s biggest netball event</h2>
              <p className="lead">{INTRO.lead}</p>
              {INTRO.body.map((p) => <p key={p}>{p}</p>)}
            </div>
            <div className="about__photo"><img src="/images/photos/opening-ceremony.jpg" alt="Teams lined up behind the color guard at the U.S. Open opening ceremony" loading="lazy" /></div>
          </div>
        </section>
        <section className="uso-stage statband" aria-label="The Championships in numbers">
          <div className="wrap">
            <div className="stats">
              {STATS.map((s) => <div key={s.label} className="uso-stat"><span className="uso-stat__value">{s.value}</span><span className="uso-stat__label">{s.label}</span></div>)}
            </div>
            <ul className="countries" aria-label="Countries represented">{COUNTRIES.map((c) => <li key={c}>{c}</li>)}</ul>
          </div>
        </section>

        {/* 4. Event */}
        <section className="section" id="event" aria-labelledby="event-title">
          <div className="wrap">
            <div className="sec-head">
              <p className="uso-eyebrow">{EVENT.datesLabel}</p>
              <h2 id="event-title" className="sec-title">The event</h2>
            </div>
            <div className="grid2">
              <div className="card">
                <h3>Schedule</h3>
                <ul className="sched">
                  {DAYS.map((d) => <li key={d.id}><b>{d.label} · Nov {d.date.slice(-1)}</b><span><strong>{d.title}.</strong> {d.detail}</span></li>)}
                </ul>
                <div className="ctas"><a className="uso-btn uso-btn--primary" href={EVENT.applyHref}>Apply to compete</a></div>
              </div>
              <div className="card">
                <h3>Venue & travel</h3>
                <address className="addr"><strong>{VENUE.name}</strong><br />{VENUE.address.join(", ")}</address>
                <p className="muted">Fly into <strong style={{ color: "var(--ink)" }}>{VENUE.airport}</strong>, {VENUE.airportAddress}. It’s about 15 minutes from the event hotels.</p>
                <div className="ctas">
                  <a className="uso-btn uso-btn--secondary" href={VENUE.mapHref} target="_blank" rel="noopener">Get directions</a>
                  <a className="uso-btn uso-btn--ghost" href="#stay">Where to stay</a>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 32, display: "grid", gap: 12 }}>
              <h3 className="subhead">Meet the 2026 teams</h3>
              <div className="video" style={{ maxWidth: 960 }}><iframe src={`https://www.youtube-nocookie.com/embed/${STREAMS.meetTheTeams}`} title="Meet your 2026 U.S. Open Netball Championships teams" loading="lazy" allow="encrypted-media; picture-in-picture" allowFullScreen /></div>
            </div>
          </div>
        </section>

        {/* 5. Stay */}
        <section className="section section--sunken" id="stay" aria-labelledby="stay-title">
          <div className="wrap">
            <div className="sec-head">
              <p className="uso-eyebrow">Accredited hotels</p>
              <h2 id="stay-title" className="sec-title">Where to stay</h2>
              <p className="lead muted">{HOTELS.intro}</p>
            </div>
            <div className="hotels">
              <div className="card">
                <span className="hotel__role">{sunset.role}</span>
                <h3>{sunset.name}</h3>
                <p className="muted">{sunset.for}</p>
                <div className="hotel__hl"><b>{sunset.highlight}</b><span>{sunset.highlightDetail}</span></div>
                <ul className="ticks">{sunset.points.map((p) => <li key={p}>{p}</li>)}</ul>
                <div className="ctas"><a className="uso-btn uso-btn--secondary" href={sunset.bookHref} target="_blank" rel="noopener">Book at the group rate</a></div>
              </div>
              <div className="card hotel--soldout">
                <span className="hotel__role">{hampton.role}</span>
                <h3>{hampton.name}</h3>
                <p><span className="uso-badge">Sold out</span></p>
                <ul className="ticks">{hampton.points.map((p) => <li key={p}>{p}</li>)}</ul>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Last year */}
        <section className="section" id="results-2025" aria-labelledby="r25-title">
          <div className="wrap">
            <div className="sec-head">
              <p className="uso-eyebrow">2025 · {RESULTS_2025.host}</p>
              <h2 id="r25-title" className="sec-title">Defending champions</h2>
            </div>
            <div className="res-grid">
              {RESULTS_2025.divisions.slice(0, 2).map((d) => <Podium key={d.title} d={d} eyebrow="2025" />)}
              <div className="card" style={{ alignSelf: "stretch" }}>
                <h3>All 2025 results</h3>
                <p className="muted">Bowl, Shield and individual award winners, plus 2024 results and the full 2025 broadcast.</p>
                <div className="ctas"><a className="uso-btn uso-btn--ghost" href="/results">See past results</a></div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Partners */}
        <section className="section section--sunken" id="partners" aria-labelledby="partners-title">
          <div className="wrap">
            <div className="partner-top">
              <div className="sec-head" style={{ marginBottom: 0 }}>
                <p className="uso-eyebrow">Partners & sponsors</p>
                <h2 id="partners-title" className="sec-title">Back women’s sport</h2>
                <p className="lead">{PARTNERS.pitch}</p>
                <p className="muted">{PARTNERS.innovation}</p>
                <div className="ctas"><a className="uso-btn uso-btn--secondary" href={PARTNERS.sponsorHref}>Become a partner</a></div>
              </div>
              <div className="card">
                <h3>Your audience</h3>
                <ul className="ticks">{PARTNERS.audience.map((a) => <li key={a}>{a}</li>)}</ul>
              </div>
            </div>
            <div className="uso-sponsors">
              {PARTNERS.logos.map((l) => {
                const img = <img src={`/images/sponsors/${l.file}`} alt={l.name} loading="lazy" />;
                return l.href
                  ? <a key={l.name} className="uso-sponsor" href={l.href} target="_blank" rel="noopener">{img}</a>
                  : <div key={l.name} className="uso-sponsor">{img}</div>;
              })}
            </div>
          </div>
        </section>

        {/* 8. Get involved + media */}
        <section className="section" id="get-involved" aria-labelledby="gi-title">
          <div className="wrap split">
            <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
              <p className="uso-eyebrow">Volunteers, scorers & umpires</p>
              <h2 id="gi-title" className="sec-title">Get involved</h2>
              <p className="lead">{GET_INVOLVED.volunteers}</p>
              <p className="muted">{GET_INVOLVED.international}</p>
              <div className="ctas"><a className="uso-btn uso-btn--secondary" href={`mailto:${EVENT.email}?subject=Volunteer%20opportunities`}>Ask about opportunities</a></div>
            </div>
            <div className="video"><iframe src={`https://www.youtube-nocookie.com/embed/${STREAMS.invitation}`} title="Invitation to the 2026 U.S. Open Netball Championships" loading="lazy" allow="encrypted-media; picture-in-picture" allowFullScreen /></div>
          </div>
        </section>

        <section className="section section--sunken" id="media" aria-labelledby="media-title">
          <div className="wrap split">
            <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
              <p className="uso-eyebrow">Media</p>
              <h2 id="media-title" className="sec-title">Free global livestream</h2>
              <p className="lead">{MEDIA.lead}</p>
              <p className="muted">{MEDIA.accreditation}</p>
              <div className="ctas"><a className="uso-btn uso-btn--secondary" href={`mailto:${EVENT.email}?subject=Media%20accreditation`}>Request accreditation</a></div>
              <div className="video" style={{ marginTop: 8 }}><iframe src={`https://www.youtube-nocookie.com/embed/${STREAMS.testimonial}`} title="2025 U.S. Open Netball Championships testimonial" loading="lazy" allow="encrypted-media; picture-in-picture" allowFullScreen /></div>
            </div>
            <div>
              <a className="feature" href={MEDIA.coverage[0].href} target="_blank" rel="noopener">
                <img src="/images/photos/karima-christmas-kelly.png" alt="" loading="lazy" />
                <span><span className="press__o">{MEDIA.coverage[0].outlet}</span><br /><strong>{MEDIA.coverage[0].title}</strong></span>
              </a>
              <h3 className="subhead">In the press</h3>
              <ul className="press">
                {MEDIA.coverage.slice(1).map((c) => (
                  <li key={c.href}><a href={c.href} target="_blank" rel="noopener"><span className="press__o">{c.outlet}</span><span className="press__t">{c.title}</span></a></li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 9. BAI */}
        <section className="section" aria-labelledby="bai-title">
          <div className="wrap">
            <div className="card bai">
              <div style={{ display: "grid", gap: 8 }}>
                <p className="uso-eyebrow">Be An Inspiration®</p>
                <h2 id="bai-title" className="sec-title" style={{ fontSize: "clamp(28px,4vw,40px)" }}>Sport that changes lives</h2>
                <p>{BAI.text} <a href={BAI.href} target="_blank" rel="noopener">Learn about BAI</a></p>
              </div>
              <a className="uso-btn uso-btn--primary" href={EVENT.donateHref} target="_blank" rel="noopener">Donate</a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
