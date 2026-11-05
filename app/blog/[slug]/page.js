import Link from "next/link";
import { notFound } from "next/navigation";
import { posts, getPost, fmtDate } from "../posts";

export function generateStaticParams() { return posts.map((p) => ({ slug: p.slug })); }

export async function generateMetadata({ params }) {
  const { slug } = await params; const p = getPost(slug);
  return p ? { title: `${p.title} — Paul Esan`, description: p.excerpt } : {};
}

export default async function Post({ params }) {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) notFound();
  return (
    <article className="page post">
      <Link href="/blog" className="link small">← All posts</Link>
      <span className="muted small post-meta">{fmtDate(p.date)} · {p.type === "video" ? "Video" : "Article"}</span>
      <h1>{p.title}</h1>
      {p.video && <video className="post-video" src={p.video} poster={p.cover} controls playsInline />}
      {!p.video && p.cover && <img className="post-video" src={p.cover} alt="" />}
      <div className="post-body">
        {p.body.map((b, i) =>
          typeof b === "string" ? <p key={i}>{b}</p>
          : b.h ? <h2 key={i}>{b.h}</h2>
          : b.img ? <figure key={i}><img src={b.img} alt={b.caption || ""} loading="lazy" />{b.caption && <figcaption>{b.caption}</figcaption>}</figure>
          : b.video ? <video key={i} src={b.video} controls playsInline />
          : b.link ? <p key={i}><Link href={b.link} className="link">{b.label}</Link></p>
          : null
        )}
      </div>
    </article>
  );
}
