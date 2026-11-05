import Link from "next/link";
import { posts, fmtDate } from "./posts";

export const metadata = { title: "Blog — Paul Esan", description: "Write-ups, process notes and videos by Paul Esan." };

export default function Blog() {
  return (
    <section className="page blog">
      <span className="eyebrow">Write-ups, process &amp; videos</span>
      <h1>Blog</h1>
      {posts.length === 0 && <p className="lead">First posts coming soon.</p>}
      <div className="blog-grid">
        {posts.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="blog-card">
            <div className="blog-thumb">
              {p.cover ? <img src={p.cover} alt="" loading="lazy" /> : <div className="ph" />}
              {p.type === "video" && <span className="blog-play">▶ Video</span>}
            </div>
            <span className="muted small">{fmtDate(p.date)} · {p.type === "video" ? "Video" : "Article"}</span>
            <h3>{p.title}</h3>
            <p className="muted">{p.excerpt}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
