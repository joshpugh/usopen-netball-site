import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Podium } from "@/components/Podium";
import { RESULTS_2024, RESULTS_2025, STREAMS } from "@/content/site";

export const metadata: Metadata = { title: "Past results · U.S. Open Netball Championships®" };

export default function Results() {
  return (
    <>
      <Header />
      <main id="main">
        <section className="uso-stage section" style={{ paddingBottom: 48 }}>
          <div className="wrap" style={{ display: "grid", gap: 12 }}>
            <p className="uso-eyebrow">Hall of results</p>
            <h1 className="hero__title">Past results</h1>
          </div>
        </section>

        <section className="section" id="2025">
          <div className="wrap">
            <div className="sec-head"><p className="uso-eyebrow">{RESULTS_2025.host}</p><h2 className="sec-title">2025</h2></div>
            <div className="res-photos">
              <figure><img src="/images/photos/2025-ladies-cup-champions.jpg" alt="Santa Monica Heat celebrating with the Ladies Cup" /><figcaption>Ladies Cup champions: Santa Monica Heat</figcaption></figure>
              <figure><img src="/images/photos/2025-mixed-cup-champions.jpg" alt="The Mixed Cup champions with their trophy" /><figcaption>Mixed Cup champions</figcaption></figure>
            </div>
            <div className="res-grid">{RESULTS_2025.divisions.map((d) => <Podium key={d.title} d={d} />)}</div>
            <h3 className="subhead" style={{ marginTop: 48 }}>Awards</h3>
            <ul className="awards res-grid">{RESULTS_2025.awards.map((a) => <li key={a.award}><span>{a.award}</span><strong>{a.winner}</strong></li>)}</ul>
          </div>
        </section>

        <section className="section section--sunken" id="replays">
          <div className="wrap">
            <div className="sec-head"><p className="uso-eyebrow">Watch again</p><h2 className="sec-title">2025 broadcast</h2></div>
            <div className="video" style={{ maxWidth: 960 }}><iframe src={`https://www.youtube-nocookie.com/embed/videoseries?list=${STREAMS.replaysPlaylist}`} title="2025 U.S. Open broadcast playlist" loading="lazy" allow="encrypted-media; picture-in-picture" allowFullScreen /></div>
          </div>
        </section>

        <section className="section" id="2024">
          <div className="wrap">
            <div className="sec-head"><h2 className="sec-title">2024</h2></div>
            <h3 className="subhead">Ladies division</h3>
            <div className="res-grid" style={{ marginBottom: 40 }}>{RESULTS_2024.ladies.map((d) => <Podium key={d.title} d={d} eyebrow="Ladies" />)}</div>
            <h3 className="subhead">Mixed division</h3>
            <div className="res-grid">{RESULTS_2024.mixed.map((d) => <Podium key={d.title} d={d} eyebrow="Mixed" />)}</div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
