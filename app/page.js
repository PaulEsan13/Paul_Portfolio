import Showreel from "./components/Showreel";
import WorkList from "./components/WorkList";
import Link from "next/link";
import { posts, fmtDate } from "./blog/posts";



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
          <span className="eyebrow">Blog — write-ups, process &amp; videos</span>
          <Link href="/blog" className="link">View all →</Link>
        </div>
        <div className="news-grid">
          {posts.slice(0, 3).map((n) => (
            <Link key={n.slug} href={`/blog/${n.slug}`} className="news-card">
              <div className="news-thumb" style={n.cover ? { background: `#141414 url(${n.cover}) center/cover` } : undefined} />
              <span className="muted small">{fmtDate(n.date)} · {n.type === "video" ? "Video" : "Article"}</span>
              <h4>{n.title}</h4>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
