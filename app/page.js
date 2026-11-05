import Showreel from "./components/Showreel";
import WorkList from "./components/WorkList";
import Link from "next/link";

const NEWS = [
  { kind: "Thoughts", title: "Why a brand should be a source, not a logo" },
  { kind: "Press", title: "Feature coming soon" },
  { kind: "Process", title: "Notes from the studio" },
];

export default function Home() {
  return (
    <>
      <section className="intro">
        <p className="intro-line">
          Brand identity designer and art director in Lagos, building identities for tech and
          fashion brands, startups and multinationals.
        </p>
      </section>

      <Showreel />

      <section className="statement">
        <p>
          I make brands that can grow — from the first idea to full identity systems, motion and
          the teams that bring them to life. <span className="muted">Open to senior roles and new projects.</span>
        </p>
      </section>

      <WorkList />

      <section className="news">
        <div className="news-head">
          <span className="eyebrow">Thoughts, press &amp; process</span>
          <Link href="/about" className="link">View all →</Link>
        </div>
        <div className="news-grid">
          {NEWS.map((n) => (
            <article key={n.title} className="news-card">
              <div className="news-thumb" />
              <span className="muted small">{n.kind}</span>
              <h4>{n.title}</h4>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
