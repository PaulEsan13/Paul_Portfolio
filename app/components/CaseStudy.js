"use client";
// Koto-style case study: sticky left column (project info + section index that follows the scroll),
// visuals and story on the right, a gentle "Thanks" and the next project at the end.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

function Reveal({ children, className = "" }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { rootMargin: "0px 0px -8% 0px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`reveal-up ${on ? "in" : ""} ${className}`}>{children}</div>;
}

function Block({ b }) {
  if (b.type === "img")
    return <Reveal><img className="cs-img" src={b.src} alt="" loading="lazy" decoding="async" style={{ aspectRatio: b.ratio }} /></Reveal>;
  if (b.type === "grid")
    return (
      <div className={`cs-grid cols-${b.items.length}`}>
        {b.items.map((it, i) => <Block key={i} b={it} />)}
      </div>
    );
  if (b.type === "video")
    return <Reveal><video className="cs-img" src={b.src} poster={b.poster} autoPlay muted loop playsInline style={{ aspectRatio: "16/9" }} /></Reveal>;
  if (b.type === "lead")
    return <Reveal><p className="cs-lead">{b.text}</p></Reveal>;
  if (b.type === "text")
    return (
      <Reveal className="cs-text">
        <h3>{b.title}</h3>
        {b.body.map((p, i) => <p key={i}>{p}</p>)}
      </Reveal>
    );
  return null;
}

export default function CaseStudy({ project, sections }) {
  const [active, setActive] = useState(sections[0].id);
  const refs = useRef({});

  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.dataset.id)),
      { rootMargin: "-40% 0px -55% 0px" }
    );
    Object.values(refs.current).forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <article className="cs">
      <header className="cs-hero">
        <span className="eyebrow">{project.fields}</span>
        <h1>{project.title}</h1>
        <p className="cs-sub">{project.subtitle}</p>
      </header>

      <div className="cs-body">
        <aside className="cs-side">
          <div className="cs-sticky">
            <nav className="cs-index">
              {sections.map((s) => (
                <a key={s.id} href={`#${s.id}`} className={active === s.id ? "on" : ""}>{s.label}</a>
              ))}
            </nav>
            <dl className="cs-meta">
              <dt>Role</dt><dd>{project.role}</dd>
              <dt>Tools</dt><dd>{project.tools}</dd>
              <dt>Year</dt><dd>{project.year}</dd>
            </dl>
            <a className="link small" href={project.behance} target="_blank" rel="noreferrer">View on Behance ↗</a>
          </div>
        </aside>

        <div className="cs-main">
          {sections.map((s) => (
            <section key={s.id} id={s.id} data-id={s.id} ref={(el) => (refs.current[s.id] = el)} className="cs-section">
              {s.blocks.map((b, i) => <Block key={i} b={b} />)}
            </section>
          ))}

          <Reveal className="cs-thanks"><p>Thanks for watching.</p></Reveal>
        </div>
      </div>

      <Link href={project.next.href} className="cs-next">
        <span className="eyebrow">Next project</span>
        <span className="cs-next-name">{project.next.name}</span>
        <span className="muted small">{project.next.note}</span>
      </Link>
    </article>
  );
}
